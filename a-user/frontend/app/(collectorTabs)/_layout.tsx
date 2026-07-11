import { Tabs } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TabLayout() {
    return (

        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: "#16a34a",
            }}
        >
            <Tabs.Screen
                name="home"
                options={{
                    title: "Home",
                    tabBarIcon: ({ color, size }) => (
                        <Feather name="home" size={size} color={color} />
                    ),
                }}
            />

            <Tabs.Screen
                name="map"
                options={{
                    title: "Bin Location",
                    tabBarIcon: ({ color, size }) => (
                        <Feather name="map" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: "Profile",
                    tabBarIcon: ({ color, size }) => (
                        <Feather name="user" size={size} color={color} />
                    ),
                }}
            />

       
        </Tabs>

    );
}