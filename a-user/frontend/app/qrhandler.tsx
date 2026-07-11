import { useState } from "react";
import { View, Text, ScrollView } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons"; // Icons
import { SafeAreaView } from "react-native-safe-area-context";


// household information
const household = {
  id: "HH-202610001",
  name: "Dela Cruz Family",
  address: "123 Green Street, Barangay Sunshine, Metro City",
  contact: "+63 917 123 4567",
  members: 5,
  registeredSince: "January 15, 2026",
  totalDisposals: 48,
  compliance: "Excellent",
  points: { total: 1240, thisMonth: 280 },
};

export default function QRhandler() {
  const [search, setSearch] = useState("");

  return (

    <SafeAreaView className="flex-1">

      <ScrollView className="flex-1 px-4 py-2">
        {/* Page Header */}
        <View>
          <Text className="text-2xl font-bold">QR Code</Text>
          <Text className="text-gray-500 mb-6">
            QR Code Verification for Households
          </Text>
        </View>

        {/* Top Cards */}
        <View className="flex flex-col md:flex-row md:space-x-6 space-y-4 md:space-y-0">
          {/* QR Code */}
          <View className="bg-white rounded-xl shadow p-6 flex-1">
            <Text className="font-semibold mb-4 text-center">
              Household QR Code
            </Text>

            <View className="h-[300px] flex justify-center items-center mb-4">
              <View className="w-40 h-40 bg-gray-100 rounded-lg flex justify-center items-center">
                <Text>QR CODE</Text>
              </View>
            </View>

            <Text className="text-center text-sm text-gray-500">
              Household ID
            </Text>
            <Text className="text-center font-semibold text-green-600">
              {household.id}
            </Text>
          </View>

          {/* Compliance Card (optional, uncomment if needed) */}
          {/*
            <View className="bg-green-50 border border-green-200 rounded-xl shadow p-6 flex-1">
              <View className="flex-row items-center gap-2 mb-4">
                <MaterialCommunityIcons name="check-circle" size={20} color="#16A34A" />
                <Text className="font-semibold text-green-600">Compliance Status</Text>
              </View>
              <Text className="text-3xl font-bold text-green-700 mb-2">
                {household.compliance}
              </Text>
              <Text className="text-green-600 mb-6">Keep up the great work!</Text>
              <Text className="text-xs text-gray-500">
                Based on Republic Act No. 9003
              </Text>
            </View>
            */}
        </View>
      </ScrollView>
    </SafeAreaView>

  );
}