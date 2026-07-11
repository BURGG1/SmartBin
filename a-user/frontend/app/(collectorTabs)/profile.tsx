import { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { Feather } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { API_BASE } from "@/config"; // Import the API base URL
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function CollectorProfile() {
  const router = useRouter();
  const [collector, setCollector] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const res = await fetch(`${API_BASE}/api/collectors/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) setCollector(data.data);
      } catch (err) {
        console.error("Failed to fetch collector profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("user");
    router.replace("/");
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#16A34A" />
      </SafeAreaView>
    );
  }

  if (!collector) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center">
        <Text className="text-gray-500">Failed to load profile.</Text>
      </SafeAreaView>
    );
  }

  const infoItems = [
    { label: "Collector Name", value: collector.name, icon: "user" },
    { label: "Employee ID", value: collector.employeeId, icon: "clipboard" },
    { label: "Assigned Barangay", value: collector.assignedBarangay || "—", icon: "map-pin" },
    { label: "Contact Number", value: collector.contact || "—", icon: "phone" },
    { label: "Email", value: collector.email, icon: "mail" },
    { label: "Total Collections", value: `${collector.totalCollections} bins`, icon: "trash-2" },
  ];

  return (
    <SafeAreaView className="flex-1">
      <ScrollView className="flex-1 px-4 py-1">

        <View>
          <Text className="text-3xl font-bold">Collector Profile</Text>
          <Text className="text-gray-500 mb-6">
            View and manage collector information
          </Text>
        </View>

        <View className="bg-white rounded-xl shadow p-6 space-y-4">
          <Text className="text-lg font-semibold mb-4">Collector Information</Text>

          <View className="flex flex-col flex-wrap gap-4">
            {infoItems.map((item) => (
              <View
                key={item.label}
                className="w-full flex-row items-center gap-4 bg-gray-50 rounded-xl p-4 flex-1"
              >
                <View className="p-3 bg-green-100 rounded-lg">
                  <Feather name={item.icon as any} size={20} color="#16A34A" />
                </View>
                <View>
                  <Text className="text-sm text-gray-500">{item.label}</Text>
                  <Text className="font-semibold">{item.value}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View className="w-full items-center mt-4 mb-4">
          <TouchableOpacity
            onPress={handleLogout}
            className="bg-gray-600 px-4 py-2 rounded-lg"
          >
            <View className="flex-row items-center gap-2">
              <Feather name="log-out" size={18} color="white" />
              <Text className="text-white">Logout</Text>
            </View>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}