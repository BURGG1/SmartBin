import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { API_BASE } from "@/config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import RegisterHousehold from "@/components/RegisterHouseholdModal";

export default function AuthPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!form.email || !form.password) {
      Alert.alert("Error", "Please enter your email and password.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email.trim().toLowerCase(),
          password: form.password,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        Alert.alert("Login Failed", data.message || "Invalid credentials.");
        return;
      }

      // Store token and user info
      await AsyncStorage.setItem("token", data.token);
      await AsyncStorage.setItem("user", JSON.stringify(data.user));

      if (data.role === "collector") {
        router.replace("/(collectorTabs)/home");
      } else {
        router.replace("/(userTabs)/home");
      }
    } catch (err) {
      Alert.alert("Error", "Cannot connect to server. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-gray-100 justify-center px-4">
      <View className="w-full max-w-md self-center space-y-6">

        {/* LOGO */}
        <View className="items-center space-y-2 mb-6">
          <View className="w-16 h-16 bg-green-600 rounded-full items-center justify-center">
            <Feather name="trash-2" size={32} color="white" />
          </View>

          <Text className="text-xl font-semibold text-center">
            Smart Bin Waste Management
          </Text>

          <Text className="text-gray-500 text-sm text-center">
            Manage waste collection efficiently
          </Text>
        </View>

        {/* CARD */}
        <View className="bg-white rounded-2xl shadow-lg p-6 space-y-6">

          <Text className="text-lg font-medium text-center">
            Welcome Back!
          </Text>

          {/* EMAIL */}
          <View>
            <Text className="text-sm mb-1 font-semibold">Email</Text>
            <View className="flex-row items-center mb-4 bg-gray-100 rounded-lg px-3 py-3">
              <Feather name="mail" size={18} color="gray" />
              <TextInput
                placeholder="Enter your email"
                value={form.email}
                onChangeText={(text) => setForm({ ...form, email: text })}
                className="flex-1 ml-3"
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>
          </View>

          {/* PASSWORD */}
          <View>
            <Text className="text-sm mb-1 font-semibold">Password</Text>
            <View className="flex-row items-center bg-gray-100 rounded-lg px-3 py-3">
              <Feather name="lock" size={18} color="gray" />
              <TextInput
                placeholder="Enter your password"
                secureTextEntry={!showPassword}
                value={form.password}
                onChangeText={(text) => setForm({ ...form, password: text })}
                className="flex-1 ml-3"
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setShowPassword((prev) => !prev)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Feather
                  name={showPassword ? "eye-off" : "eye"}
                  size={18}
                  color="gray"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* LOGIN BUTTON */}
          <TouchableOpacity
            onPress={handleLogin}
            disabled={loading}
            className="bg-green-600 mt-4 mb-4 py-3 rounded-lg"
            style={{ opacity: loading ? 0.6 : 1 }}
          >
            <Text className="text-white text-center font-medium">
              {loading ? "Logging in..." : "Login"}
            </Text>
          </TouchableOpacity>

          <Text className="text-sm text-gray-500 text-center">
            Forgot your password?{" "}
            <Text className="text-green-600 font-medium">Reset here</Text>
          </Text>

          {/* REGISTER BUTTON */}
          <TouchableOpacity onPress={() => setIsModalOpen(true)}>
            <Text className="text-green-400 text-center font-medium mt-5">
              Register Household
            </Text>
          </TouchableOpacity>

          <RegisterHousehold
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
          />

        </View>
      </View>
    </View>
  );
}