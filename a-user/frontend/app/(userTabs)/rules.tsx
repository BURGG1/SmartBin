import { useState, useEffect } from "react";
import { View, Text, FlatList, ScrollView, Image, TextInput, TouchableOpacity, Linking, ActivityIndicator } from "react-native";
import { Feather } from "@expo/vector-icons"; // Expo Icons
import { SafeAreaView } from "react-native-safe-area-context";
import { API_BASE } from "@/config"; // Import the API_BASE constant

import { getRules } from "../../api/rulesAPI"; // API function to fetch rules
import Pagination from "../../components/UserPagination";

// household info
const household = {
    id: "HH-202610001",
    name: "Joel Dela Cruz",
    address: "123 Green Street, Barangay Sunshine, Metro City",
    contact: "+63 917 123 4567",
    members: 5,
    registeredSince: "January 15, 2026",
    totalDisposals: 48,
    compliance: "Excellent",
    points: {
        total: 1240,
        thisMonth: 280,
    },
};

// Penalty Data
const penaltiesData = {
    note:
        "Repeated violations may result in additional penalties and suspension of waste disposal privileges.",
    records: [
        {
            reason:
                "Improper waste segregation (mixed biodegradable with non-biodegradable)",
            date: "2026-01-15",
            points: -500,
            law: "RA 9003 Section 48",
        },
    ],
};

// recent activity
const recentActivityData = [
    { type: "Earned points", via: "Rule 1. Return of recyclable material", amount: "2kg", date: "2026-01-24", points: 30 },
    { type: "Redeemed Reward", via: "Vitamins/Medicine", amount: "1pc", date: "2026-01-23", points: -500 },
    { type: "Earned points", via: "Rule 2. 10-days Streak", date: "2026-01-22", points: 30 },
    { type: "Earned points", via: "Rule 1. Return of recyclable material", amount: "3kg", date: "2026-01-22", points: 45 },
];

type Rule = {
    _id: string;
    name: string;
    decs?: string;
    freq?: string;
    points?: number;
    image?: string;
    [key: string]: any;
};

const RULES_PER_PAGE = 4;

export default function Rules() {
    const [search, setSearch] = useState("");

    // ---- Rules now come from the database ----
    const [rules, setRules] = useState<Rule[]>([]);
    const [rulesLoading, setRulesLoading] = useState(true);
    const [rulesError, setRulesError] = useState("");
    const [rulesPage, setRulesPage] = useState(1);

    const fetchRules = async () => {
        try {
            setRulesLoading(true);
            const data = await getRules();
            // Handle all possible response shapes
            if (Array.isArray(data)) {
                setRules(data);
            } else if (Array.isArray(data?.data)) {
                setRules(data.data);
            } else {
                setRules([]); // fallback to empty array
            }
        } catch (err) {
            console.error(err);
            setRules([]);
            setRulesError("Failed to load rules. Please try again later.");
        } finally {
            setRulesLoading(false);
        }
    };

    useEffect(() => {
        fetchRules();
    }, []);

    const filteredRules = rules.filter((r) =>
        r.name.toLowerCase().includes(search.toLowerCase())
    );

    
    // Reset to page 1 whenever the search term changes
    useEffect(() => {
        setRulesPage(1);
    }, [search]);

    // Clamp pages if the underlying data shrinks (e.g. a refetch returns fewer rows)
    useEffect(() => {
        const totalPages = Math.max(1, Math.ceil(filteredRules.length / RULES_PER_PAGE));
        if (rulesPage > totalPages) setRulesPage(totalPages);
    }, [filteredRules.length]);

    const paginatedRules = filteredRules.slice(
        (rulesPage - 1) * RULES_PER_PAGE,
        rulesPage * RULES_PER_PAGE
    );
    const rulesFillerCount = Math.max(0, RULES_PER_PAGE - paginatedRules.length);
    
    type RuleItem = Rule & {
        __filler?: boolean;
    };
    
    const rulesForDisplay: RuleItem[] = [
        ...paginatedRules,
        ...Array.from({ length: rulesFillerCount }, (_, i) => ({
            _id: `__filler-${i}`,
            name: "",
            __filler: true,
        })),
    ];

    return (
        <SafeAreaView className="flex-1">

            <ScrollView className="flex-1 px-4 py-2 ">
                {/* Header */}
                <View>
                    <Text className="text-3xl font-bold">Rules & Penalties</Text>
                    <Text className="text-gray-500 mb-6">Rules aligned with RA 9003</Text>
                </View>


                {/* Penalties & Deductions */}
                <View className="flex flex-col gap-2 bg-red-50 border border-red-200 shadow-lg rounded-xl p-6 space-y-4 mb-5">
                    <View>
                        <Text className="text-lg font-semibold text-red-700">Penalties & Deductions</Text>
                        <Text className="text-sm text-red-600 mt-1">
                            Based on Republic Act No. 9003 - Ecological Solid Waste Management Act
                        </Text>
                    </View>

                    {penaltiesData.records.map((item, index) => (
                        <View
                            key={index}
                            className="bg-white border border-red-200 rounded-lg p-4 flex-col justify-between items-center"
                        >
                            <View>
                                <Text className="font-medium">{item.reason}</Text>
                                <Text className="text-xs text-gray-500">{item.date}</Text>
                            </View>
                            <View className="">
                                <Text className="text-red-600 font-semibold">{item.points} pts</Text>
                                <Text className="text-xs text-gray-400">{item.law}</Text>
                            </View>
                        </View>
                    ))}

                    <View className="bg-white border border-red-300 rounded-lg p-3 text-sm">
                        <Text className="text-red-600">
                            <Text className="font-bold">Note: </Text>
                            {penaltiesData.note}
                        </Text>
                    </View>
                </View>



                {/* RA 9003 */}
                <View className="bg-white rounded-xl p-6 shadow">

                    <View className="flex flex-col sm:flex-row sm:justify-between gap-4 mt-5">
                        <View className="flex-row items-start gap-4">

                            <View>
                                <Text className="text-xl font-bold text-gray-800">
                                    Republic Act No. 9003
                                </Text>
                                <Text className="text-green-700 text-sm">
                                    Ecological Solid Waste Management Act of 2000
                                </Text>
                            </View>
                        </View>
                        <View className="flex-row items-center bg-green-100 px-3 py-1 rounded-full gap-1 self-start">
                            <Text className="text-green-700 text-xs font-medium">Philippine Law</Text>
                        </View>
                    </View>

                    <View className="bg-green-100/60 border border-green-200 rounded-xl p-4 mt-5">
                        <Text className="text-sm text-gray-700 text-justify">
                            The Ecological Solid Waste Management Act of 2000, officially known as Republic Act No. 9003,
                            is a Philippine environmental law enacted to establish a comprehensive and sustainable system
                            for managing solid waste nationwide.
                            <Text className="font-semibold">
                                It promotes waste reduction, mandatory segregation at source, recycling, composting,
                                and the closure of open dumpsites, while requiring local government units to take primary
                                responsibility for implementation under the supervision of the Department of Environment
                                and Natural Resources.
                            </Text>
                            The law aims to protect public health and the environment by shifting the country from improper
                            disposal practices to an ecological and community-based waste management approach.
                        </Text>
                    </View>

                </View>
                <TouchableOpacity
                    onPress={() => Linking.openURL("https://www.officialgazette.gov.ph/2001/01/26/republic-act-no-9003/")}
                    className="flex-row items-center gap-2 mb-10"
                >
                    <Text className="text-green-600 font-medium">See full text of RA 9003</Text>
                </TouchableOpacity>



                {/* Rules Section */}
                <View className="bg-white rounded-xl p-6 shadow">
                    <View className="flex-col justify-between items-center mb-4 gap-2">
                        <View className="flex-row items-center gap-2">
                            <Feather name="clipboard" size={18} color="#16A34A" />
                            <Text className="text-lg font-semibold">How to Earn Points</Text>
                        </View>
                        <View className="relative flex-row items-center">
                            <Feather name="search" size={18} color="gray" className="absolute left-2" />
                            <TextInput
                                className="pl-8 pr-4 py-2 border rounded-lg w-64 focus:ring-2 focus:ring-green-500"
                                placeholder="Search reward"
                                value={search}
                                onChangeText={setSearch}
                            />
                        </View>
                    </View>

                    {rulesLoading && (
                        <View className="items-center py-6">
                            <ActivityIndicator color="#16A34A" />
                            <Text className="text-gray-500 mt-2">Loading rules...</Text>
                        </View>
                    )}

                    {!!rulesError && (
                        <Text className="text-red-500 mb-2">{rulesError}</Text>
                    )}

                    {/* RULEES------------ */}
                    <FlatList
                        data={rulesForDisplay}
                        keyExtractor={(item) => item._id}
                        numColumns={2}
                        scrollEnabled={false}
                        columnWrapperStyle={{ gap: 10 }}
                        contentContainerStyle={{ gap: 10 }}
                        ListEmptyComponent={
                            !rulesLoading && !rulesError ? (
                                <Text className="text-gray-500 text-center py-6 w-full">
                                    No rules found.
                                </Text>
                            ) : null
                        }
                        renderItem={({ item: r, index }) => (
                            r.__filler ? (
                                <View className="flex-1 h-56" style={{ opacity: 0 }} />
                            ) : (
                                <View className="flex-1 bg-gray-50 rounded-xl shadow-lg overflow-hidden">

                                    {r.image ? (
                                        <Image
                                            source={{ uri: r.image }}
                                            className="w-full h-40"
                                            resizeMode="cover"
                                        />
                                    ) : (
                                        <View className="w-full h-40 bg-gray-200 items-center justify-center">
                                            <Text className="text-gray-400">No image</Text>
                                        </View>
                                    )}

                                    <View className="p-3 gap-1">
                                        <Text className="text-sm font-bold">
                                            Rule {(rulesPage - 1) * RULES_PER_PAGE + index + 1}
                                        </Text>

                                        <Text className="text-xs text-gray-500">
                                            {r.name}
                                        </Text>

                                        <Text className="text-xs text-gray-400">
                                            {r.decs}
                                        </Text>

                                        <Text className="text-xs text-gray-400">
                                            {r.freq}
                                        </Text>
                                    </View>

                                    <View className="absolute top-2 right-2 bg-white rounded-lg p-1 shadow-md">
                                        <Text className="text-green-500 font-bold text-sm text-center">
                                            +{r.points}
                                        </Text>
                                    </View>
                                </View>
                            )
                        )}
                    />

                    {!rulesLoading && !rulesError && (
                        <Pagination
                            currentPage={rulesPage}
                            totalItems={filteredRules.length}
                            itemsPerPage={RULES_PER_PAGE}
                            onPageChange={setRulesPage}
                        />
                    )}
                </View>


            </ScrollView>
        </SafeAreaView>

    );
}