import { useCallback, useEffect, useRef, useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { API_BASE } from "@/config";

// --- Config / constants -----------------------------------------------

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CODE_REGEX = /^\d{6}$/;
const MIN_PASSWORD_LENGTH = 8;
const REQUEST_TIMEOUT_MS = 15000;
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 60_000; // client-side cool-down after repeated failures
const RESEND_COOLDOWN_MS = 30_000;

// --- Types ---------------------------------------------------------------

type Step = "email" | "reset";

interface FormState {
  step: Step;
  email: string;
  code: string;
  newPassword: string;
  confirmPassword: string;
}

interface ResetPayload {
  code: string;
  newPassword: string;
  confirmPassword: string;
}

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResetSuccess?: () => void;
}

interface ResetPasswordResponse {
  success?: boolean;
  message?: string;
}

// --- Helpers ------------------------------------------------------------

function sanitizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

function validateEmail(email: string): string | null {
  if (!email) return "Please enter your email address.";
  if (!EMAIL_REGEX.test(email)) return "Please enter a valid email address.";
  return null;
}

function validateReset({ code, newPassword, confirmPassword }: ResetPayload): string | null {
  if (!code || !CODE_REGEX.test(code)) {
    return "Please enter the 6-digit code sent to your email.";
  }
  if (!newPassword || newPassword.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  }
  if (newPassword !== confirmPassword) {
    return "Passwords do not match.";
  }
  return null;
}

async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs: number
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

const INITIAL_STATE: FormState = {
  step: "email",
  email: "",
  code: "",
  newPassword: "",
  confirmPassword: "",
};

export default function ForgotPasswordModal({
  isOpen,
  onClose,
  onResetSuccess,
}: ForgotPasswordModalProps) {
  const [form, setForm] = useState<FormState>(INITIAL_STATE);
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [resendCooldown, setResendCooldown] = useState<number>(0);

  // Client-side throttling. UX safety net only — the server MUST enforce
  // its own rate limiting, since any client-side check can be bypassed.
  const attemptsRef = useRef<number>(0);
  const lockedUntilRef = useRef<number>(0);
  const inFlightRef = useRef<boolean>(false);
  const cooldownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Reset all local state whenever the modal is closed, so no stale
  // email/code/password lingers in memory or reappears on next open.
  useEffect(() => {
    if (!isOpen) {
      setForm(INITIAL_STATE);
      setShowPassword(false);
      setShowConfirmPassword(false);
      setResendCooldown(0);
      attemptsRef.current = 0;
      lockedUntilRef.current = 0;
      if (cooldownTimerRef.current) {
        clearInterval(cooldownTimerRef.current);
        cooldownTimerRef.current = null;
      }
    }
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
    };
  }, []);

  const startResendCooldown = useCallback(() => {
    setResendCooldown(RESEND_COOLDOWN_MS / 1000);
    if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
    cooldownTimerRef.current = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
          cooldownTimerRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const isLockedOut = useCallback((): boolean => {
    const now = Date.now();
    if (now < lockedUntilRef.current) {
      const secondsLeft = Math.ceil((lockedUntilRef.current - now) / 1000);
      Alert.alert("Too many attempts", `Please wait ${secondsLeft}s before trying again.`);
      return true;
    }
    return false;
  }, []);

  const registerFailedAttempt = useCallback(() => {
    attemptsRef.current += 1;
    if (attemptsRef.current >= MAX_ATTEMPTS) {
      lockedUntilRef.current = Date.now() + LOCKOUT_MS;
      attemptsRef.current = 0;
    }
  }, []);

  const handleClose = useCallback(() => {
    if (loading) return; // don't allow dismiss mid-request
    onClose?.();
  }, [loading, onClose]);

  // --- Step 1: request a reset code ------------------------------------

  const requestCode = useCallback(async (): Promise<void> => {
    if (inFlightRef.current) return;
    if (isLockedOut()) return;

    const email = sanitizeEmail(form.email);
    const validationError = validateEmail(email);
    if (validationError) {
      Alert.alert("Error", validationError);
      return;
    }

    inFlightRef.current = true;
    setLoading(true);

    try {
      const response = await fetchWithTimeout(
        `${API_BASE}/api/auth/forgot-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        },
        REQUEST_TIMEOUT_MS
      );

      // Don't assume the body is valid JSON — an error page/proxy could
      // return HTML and JSON.parse would throw.
      try {
        await response.json();
      } catch {
        // ignore — body isn't needed beyond the status check below
      }

      if (!response.ok) {
        registerFailedAttempt();
        Alert.alert("Error", "Something went wrong. Please try again.");
        return;
      }

      // Deliberately generic message regardless of whether the email is
      // registered — this avoids leaking which emails have accounts.
      Alert.alert(
        "Check your email",
        "If an account exists for that email, a 6-digit reset code has been sent."
      );

      setForm((f) => ({ ...f, email, step: "reset" }));
      startResendCooldown();
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") {
        Alert.alert("Error", "The request timed out. Please try again.");
      } else {
        if (__DEV__) console.warn("Forgot-password request failed:", err);
        Alert.alert(
          "Error",
          "Cannot connect to server. Please check your connection and try again."
        );
      }
    } finally {
      inFlightRef.current = false;
      setLoading(false);
    }
  }, [form.email, isLockedOut, registerFailedAttempt, startResendCooldown]);

  const handleResend = useCallback(() => {
    if (resendCooldown > 0) return;
    requestCode();
  }, [resendCooldown, requestCode]);

  // --- Step 2: submit code + new password -------------------------------

  const handleResetPassword = useCallback(async (): Promise<void> => {
    if (inFlightRef.current) return;
    if (isLockedOut()) return;

    const validationError = validateReset(form);
    if (validationError) {
      Alert.alert("Error", validationError);
      return;
    }

    inFlightRef.current = true;
    setLoading(true);

    try {
      const response = await fetchWithTimeout(
        `${API_BASE}/api/auth/reset-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: form.email,
            code: form.code.trim(),
            newPassword: form.newPassword,
          }),
        },
        REQUEST_TIMEOUT_MS
      );

      let data: ResetPasswordResponse | null;
      try {
        data = (await response.json()) as ResetPasswordResponse;
      } catch {
        data = null;
      }

      if (!response.ok || !data?.success) {
        registerFailedAttempt();
        // Generic message: don't reveal whether the code was wrong,
        // expired, or the account doesn't exist.
        Alert.alert("Reset Failed", "That code is invalid or has expired. Please try again.");
        return;
      }

      attemptsRef.current = 0;

      // Clear sensitive fields from local state immediately.
      setForm(INITIAL_STATE);

      Alert.alert("Success", "Your password has been reset. Please log in.");
      onResetSuccess?.();
      onClose?.();
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") {
        Alert.alert("Error", "The request timed out. Please try again.");
      } else {
        if (__DEV__) console.warn("Reset-password request failed:", err);
        Alert.alert(
          "Error",
          "Cannot connect to server. Please check your connection and try again."
        );
      }
    } finally {
      inFlightRef.current = false;
      setLoading(false);
    }
  }, [form, isLockedOut, registerFailedAttempt, onResetSuccess, onClose]);

  const goBackToEmailStep = useCallback(() => {
    if (loading) return;
    setForm((f) => ({ ...f, code: "", newPassword: "", confirmPassword: "", step: "email" }));
  }, [loading]);

  return (
    <Modal
      visible={isOpen}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1 justify-center bg-black/40 px-4"
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
        >
          <View className="w-full max-w-md self-center">
            <View className="bg-white rounded-2xl shadow-lg p-6 space-y-6">

              {/* HEADER */}
              <View className="flex-row items-center justify-between mb-2">
                {form.step === "reset" ? (
                  <TouchableOpacity
                    onPress={goBackToEmailStep}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    accessibilityLabel="Back"
                    disabled={loading}
                  >
                    <Feather name="arrow-left" size={20} color="gray" />
                  </TouchableOpacity>
                ) : (
                  <View style={{ width: 20 }} />
                )}

                <View className="items-center">
                  <View className="w-12 h-12 bg-green-600 rounded-full items-center justify-center mb-2">
                    <Feather name="key" size={22} color="white" />
                  </View>
                  <Text className="text-lg font-medium text-center">
                    {form.step === "email" ? "Forgot Password?" : "Reset Password"}
                  </Text>
                  <Text className="text-gray-500 text-sm text-center mt-1">
                    {form.step === "email"
                      ? "Enter your email and we'll send you a reset code."
                      : `Enter the code sent to ${form.email}`}
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={handleClose}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  accessibilityLabel="Close"
                  disabled={loading}
                >
                  <Feather name="x" size={20} color="gray" />
                </TouchableOpacity>
              </View>

              {form.step === "email" ? (
                <>
                  {/* EMAIL */}
                  <View>
                    <Text className="text-sm mb-1 font-semibold">Email</Text>
                    <View className="flex-row items-center mb-4 bg-gray-100 rounded-lg px-3 py-3">
                      <Feather name="mail" size={18} color="gray" />
                      <TextInput
                        placeholder="Enter your email"
                        value={form.email}
                        onChangeText={(text: string) => setForm((f) => ({ ...f, email: text }))}
                        className="flex-1 ml-3"
                        autoCapitalize="none"
                        autoCorrect={false}
                        keyboardType="email-address"
                        textContentType="emailAddress"
                        autoComplete="email"
                        editable={!loading}
                        maxLength={254}
                        accessibilityLabel="Email"
                        returnKeyType="send"
                        onSubmitEditing={() => requestCode()}
                      />
                    </View>
                  </View>

                  {/* SEND CODE BUTTON */}
                  <TouchableOpacity
                    onPress={() => requestCode()}
                    disabled={loading}
                    className="bg-green-600 py-3 rounded-lg flex-row items-center justify-center"
                    style={{ opacity: loading ? 0.6 : 1 }}
                    accessibilityRole="button"
                  >
                    {loading && <ActivityIndicator size="small" color="white" style={{ marginRight: 8 }} />}
                    <Text className="text-white text-center font-medium">
                      {loading ? "Sending..." : "Send Reset Code"}
                    </Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  {/* CODE */}
                  <View>
                    <Text className="text-sm mb-1 font-semibold">Reset Code</Text>
                    <View className="flex-row items-center mb-4 bg-gray-100 rounded-lg px-3 py-3">
                      <Feather name="hash" size={18} color="gray" />
                      <TextInput
                        placeholder="6-digit code"
                        value={form.code}
                        onChangeText={(text: string) =>
                          setForm((f) => ({ ...f, code: text.replace(/[^0-9]/g, "").slice(0, 6) }))
                        }
                        className="flex-1 ml-3"
                        keyboardType="number-pad"
                        editable={!loading}
                        maxLength={6}
                        accessibilityLabel="Reset code"
                      />
                    </View>
                  </View>

                  {/* NEW PASSWORD */}
                  <View>
                    <Text className="text-sm mb-1 font-semibold">New Password</Text>
                    <View className="flex-row items-center mb-4 bg-gray-100 rounded-lg px-3 py-3">
                      <Feather name="lock" size={18} color="gray" />
                      <TextInput
                        placeholder="Enter new password"
                        secureTextEntry={!showPassword}
                        value={form.newPassword}
                        onChangeText={(text: string) => setForm((f) => ({ ...f, newPassword: text }))}
                        className="flex-1 ml-3"
                        autoCapitalize="none"
                        autoCorrect={false}
                        textContentType="newPassword"
                        autoComplete="password-new"
                        editable={!loading}
                        maxLength={128}
                        accessibilityLabel="New password"
                      />
                      <TouchableOpacity
                        onPress={() => setShowPassword((prev) => !prev)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        accessibilityLabel={showPassword ? "Hide password" : "Show password"}
                      >
                        <Feather name={showPassword ? "eye-off" : "eye"} size={18} color="gray" />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* CONFIRM PASSWORD */}
                  <View>
                    <Text className="text-sm mb-1 font-semibold">Confirm Password</Text>
                    <View className="flex-row items-center mb-4 bg-gray-100 rounded-lg px-3 py-3">
                      <Feather name="lock" size={18} color="gray" />
                      <TextInput
                        placeholder="Re-enter new password"
                        secureTextEntry={!showConfirmPassword}
                        value={form.confirmPassword}
                        onChangeText={(text: string) => setForm((f) => ({ ...f, confirmPassword: text }))}
                        className="flex-1 ml-3"
                        autoCapitalize="none"
                        autoCorrect={false}
                        textContentType="newPassword"
                        autoComplete="password-new"
                        editable={!loading}
                        maxLength={128}
                        accessibilityLabel="Confirm new password"
                        returnKeyType="send"
                        onSubmitEditing={handleResetPassword}
                      />
                      <TouchableOpacity
                        onPress={() => setShowConfirmPassword((prev) => !prev)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        accessibilityLabel={showConfirmPassword ? "Hide password" : "Show password"}
                      >
                        <Feather name={showConfirmPassword ? "eye-off" : "eye"} size={18} color="gray" />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* RESET BUTTON */}
                  <TouchableOpacity
                    onPress={handleResetPassword}
                    disabled={loading}
                    className="bg-green-600 py-3 rounded-lg flex-row items-center justify-center"
                    style={{ opacity: loading ? 0.6 : 1 }}
                    accessibilityRole="button"
                  >
                    {loading && <ActivityIndicator size="small" color="white" style={{ marginRight: 8 }} />}
                    <Text className="text-white text-center font-medium">
                      {loading ? "Resetting..." : "Reset Password"}
                    </Text>
                  </TouchableOpacity>

                  {/* RESEND */}
                  <TouchableOpacity onPress={handleResend} disabled={loading || resendCooldown > 0}>
                    <Text
                      className="text-sm text-center mt-2"
                      style={{ color: resendCooldown > 0 || loading ? "#9ca3af" : "#16a34a" }}
                    >
                      {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : "Resend code"}
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}