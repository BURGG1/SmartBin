#include <SPI.h>
#include <MFRC522.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <HardwareSerial.h>
#include <TinyGPSPlus.h>
#include <ESPmDNS.h>

#define SS_PIN 5
#define RST_PIN 22
#define RELAY_PIN 26
#define GPS_RX 16
#define GPS_TX 17
#define GPS_BAUD 9600

#define TRIG_PIN 32
#define ECHO_PIN 33

#define BIN_HEIGHT_CM 40.0
#define SENSOR_OFFSET_CM 2.0

#define FILL_READ_INTERVAL_MS 3000
#define FILL_SEND_INTERVAL_MS 10000
#define LOCATION_SEND_INTERVAL_MS 30000
#define GPS_DEBUG_INTERVAL_MS 10000
#define HEARTBEAT_INTERVAL_MS 15000

MFRC522 mfrc522(SS_PIN, RST_PIN);
TinyGPSPlus gps;
HardwareSerial gpsSerial(2);

const char* ssid     = "Seraphim";
const char* password = "Bueno1982";
const char* BIN_ID   = "BIN-001";

// ── Dynamic URLs — built after WiFi + mDNS resolves ─────────────────────────
String backendBase  = "";
String scanURL      = "";
String locationURL  = "";
String binStatusURL = "";
String heartbeatURL = "";

unsigned long lastFillRead     = 0;
unsigned long lastFillSend     = 0;
unsigned long lastLocationSend = 0;
unsigned long lastGpsDebug     = 0;
unsigned long lastHeartbeat    = 0;

volatile float latestDistanceCm  = -1.0;
volatile int   latestFillPercent = -1;

// ── Resolve backend IP via mDNS ─────────────────────────────────────────────
String resolveBackendIP() {
  Serial.println("Resolving smartbin.local via mDNS...");
  for (int i = 0; i < 5; i++) {
    IPAddress ip = MDNS.queryHost("smartbin");
    if (ip != INADDR_NONE) {
      Serial.println("Resolved: " + ip.toString());
      return ip.toString();
    }
    Serial.println("Retrying mDNS... (" + String(i + 1) + "/5)");
    delay(1000);
  }
  Serial.println("mDNS failed — using fallback IP 192.168.1.226");
  return "192.168.1.226";
}

void feedGPS() {
  while (gpsSerial.available())
    gps.encode(gpsSerial.read());
}

void sendHeartbeat() {
  if (WiFi.status() != WL_CONNECTED || heartbeatURL == "") return;
  HTTPClient http;
  http.begin(heartbeatURL);
  http.addHeader("Content-Type", "application/json");
  String payload = "{\"binId\":\"" + String(BIN_ID) + "\"}";
  int code = http.POST(payload);
  Serial.println("Heartbeat → " + String(code));
  http.end();
}

void printGpsDebug() {
  Serial.println("── GPS Debug ──────────────────────────────");
  Serial.printf("Chars processed : %lu\n", gps.charsProcessed());
  Serial.printf("Sentences w/fix : %lu\n", gps.sentencesWithFix());
  Serial.printf("Failed checksum : %lu\n", gps.failedChecksum());
  Serial.printf("Satellites      : %d\n", gps.satellites.isValid() ? gps.satellites.value() : -1);
  Serial.printf("Location valid  : %s\n", gps.location.isValid() ? "yes" : "no");
  if (gps.charsProcessed() < 10) {
    Serial.println("Almost no data — check wiring");
  } else if (!gps.location.isValid()) {
    Serial.println("No fix yet — try outdoors");
  }
  Serial.println("────────────────────────────────────────────");
}

float readDistanceCm() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  long duration = pulseIn(ECHO_PIN, HIGH, 30000);
  if (duration == 0) return -1.0;
  return duration * 0.0343 / 2.0;
}

float getStableDistanceCm() {
  float readings[5];
  int count = 0;
  for (int i = 0; i < 5; i++) {
    float d = readDistanceCm();
    if (d > 0) readings[count++] = d;
    delay(20);
  }
  if (count == 0) return -1.0;
  for (int i = 1; i < count; i++) {
    float key = readings[i];
    int j = i - 1;
    while (j >= 0 && readings[j] > key) { readings[j + 1] = readings[j]; j--; }
    readings[j + 1] = key;
  }
  return readings[count / 2];
}

int calcFillPercent(float distanceCm) {
  if (distanceCm < 0) return -1;
  float usableHeight = BIN_HEIGHT_CM - SENSOR_OFFSET_CM;
  float fillDepth = (BIN_HEIGHT_CM - distanceCm) - SENSOR_OFFSET_CM;
  if (fillDepth < 0) fillDepth = 0;
  if (fillDepth > usableHeight) fillDepth = usableHeight;
  return (int)((fillDepth / usableHeight) * 100.0);
}

void sendFillLevel() {
  if (WiFi.status() != WL_CONNECTED || binStatusURL == "") return;
  if (latestFillPercent < 0) return;
  HTTPClient http;
  http.begin(binStatusURL);
  http.addHeader("Content-Type", "application/json");
  String payload = "{\"deviceId\":\"" + String(BIN_ID) + "\",";
  payload += "\"fillLevel\":" + String(latestFillPercent) + ",";
  payload += "\"distanceCm\":" + String(latestDistanceCm, 1) + "}";
  int code = http.POST(payload);
  Serial.println("Fill-level → " + String(code));
  http.end();
}

void sendLocationPing() {
  if (WiFi.status() != WL_CONNECTED || locationURL == "") return;
  if (!gps.location.isValid() || gps.location.age() > 5000) return;
  HTTPClient http;
  http.begin(locationURL);
  http.addHeader("Content-Type", "application/json");
  String payload = "{\"deviceId\":\"" + String(BIN_ID) + "\",";
  payload += "\"lat\":" + String(gps.location.lat(), 6) + ",";
  payload += "\"lng\":" + String(gps.location.lng(), 6) + "}";
  int code = http.POST(payload);
  Serial.println("Location → " + String(code));
  http.end();
}

void setup() {
  Serial.begin(115200);
  SPI.begin();
  mfrc522.PCD_Init();

  gpsSerial.begin(GPS_BAUD, SERIAL_8N1, GPS_RX, GPS_TX);

  pinMode(RELAY_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, HIGH);
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  digitalWrite(TRIG_PIN, LOW);

  WiFi.mode(WIFI_STA);
  WiFi.disconnect();
  delay(100);
  WiFi.begin(ssid, password);

  Serial.print("Connecting to WiFi");
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWiFi Connected! IP: " + WiFi.localIP().toString());

    // Init mDNS for this ESP32
    if (!MDNS.begin("esp32bin")) {
      Serial.println("mDNS init failed");
    }

    // Resolve backend
    String backendIP = resolveBackendIP();
    backendBase  = "http://" + backendIP + ":5000";
    scanURL      = backendBase + "/api/rfid/scan-bin";
    locationURL  = backendBase + "/api/devices/location";
    binStatusURL = backendBase + "/api/devices/fill-level";
    heartbeatURL = backendBase + "/api/bins/heartbeat";

    Serial.println("Backend: " + backendBase);
  } else {
    Serial.println("\nWiFi failed. Restarting...");
    ESP.restart();
  }

  Serial.println("Bin: " + String(BIN_ID));
  Serial.println("Ready...");
}

void loop() {
  unsigned long now = millis();

  if (now - lastHeartbeat >= HEARTBEAT_INTERVAL_MS) {
    lastHeartbeat = now;
    sendHeartbeat();
  }

  feedGPS();

  if (now - lastGpsDebug >= GPS_DEBUG_INTERVAL_MS) {
    lastGpsDebug = now;
    printGpsDebug();
  }

  if (now - lastFillRead >= FILL_READ_INTERVAL_MS) {
    lastFillRead = now;
    float d = getStableDistanceCm();
    latestDistanceCm  = d;
    latestFillPercent = calcFillPercent(d);
    if (latestFillPercent >= 0)
      Serial.printf("Distance: %.1f cm | Fill: %d%%\n", latestDistanceCm, latestFillPercent);
    else
      Serial.println("Ultrasonic error");
  }

  if (now - lastFillSend >= FILL_SEND_INTERVAL_MS) {
    lastFillSend = now;
    sendFillLevel();
  }

  if (now - lastLocationSend >= LOCATION_SEND_INTERVAL_MS) {
    lastLocationSend = now;
    sendLocationPing();
  }

  if (!mfrc522.PICC_IsNewCardPresent()) return;
  if (!mfrc522.PICC_ReadCardSerial()) return;

  String uid = "";
  for (byte i = 0; i < mfrc522.uid.size; i++) {
    if (mfrc522.uid.uidByte[i] < 0x10) uid += "0";
    uid += String(mfrc522.uid.uidByte[i], HEX);
    if (i < mfrc522.uid.size - 1) uid += "-";
  }
  uid.toUpperCase();

  Serial.println("\nCard: " + uid + " @ " + String(BIN_ID));

  unsigned long gpsStart = millis();
  while (millis() - gpsStart < 500) feedGPS();

  double lat = 0.0, lng = 0.0;
  bool hasGPS = gps.location.isValid() && gps.location.age() < 5000;
  if (hasGPS) { lat = gps.location.lat(); lng = gps.location.lng(); }

  bool hasFill = (latestFillPercent >= 0);

  if (WiFi.status() == WL_CONNECTED && scanURL != "") {
    HTTPClient http;
    http.begin(scanURL);
    http.addHeader("Content-Type", "application/json");

    String payload = "{\"rfid\":\"" + uid + "\",\"binId\":\"" + String(BIN_ID) + "\"";
    if (hasGPS) payload += ",\"lat\":" + String(lat, 6) + ",\"lng\":" + String(lng, 6);
    if (hasFill) payload += ",\"fillLevel\":" + String(latestFillPercent) + ",\"distanceCm\":" + String(latestDistanceCm, 1);
    payload += "}";

    Serial.println("Sending: " + payload);
    int code = http.POST(payload);
    String resp = http.getString();
    Serial.println("Code: " + String(code) + " | " + resp);

    if (code == 200) {
      digitalWrite(RELAY_PIN, LOW);
      delay(3000);
      digitalWrite(RELAY_PIN, HIGH);
    }

    http.end();
  } else {
    Serial.println("WiFi down. Reconnecting...");
    WiFi.reconnect();
  }

  delay(2000);
  mfrc522.PICC_HaltA();
  mfrc522.PCD_StopCrypto1();
}