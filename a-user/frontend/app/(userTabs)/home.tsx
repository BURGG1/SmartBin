import { useState, useEffect, useCallback } from "react";
import { View, FlatList, Text, ScrollView, Image, TextInput, TouchableOpacity, Linking, ActivityIndicator } from "react-native";
import { Feather } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";

import { getRules } from "../../api/rulesAPI";
import { getHouseholdActivity } from "../../api/rewardAPI";
import { useHousehold, fetchHousehold } from "../store/householdStore";
import { API_BASE } from "@/config";
import Pagination from "../../components/UserPagination";

type Rule = {
    _id: string;
    name: string;
    description?: string;
    frequency?: string;
    points?: number;
    image?: string;
    [key: string]: any;
};

type ActivityItem = { type: string; via: string; date: string; points: number; amount?: string };

const RULES_PER_PAGE = 4;
const ACTIVITY_PER_PAGE = 7;
const ACTIVITY_FETCH_LIMIT = 50; // fetch enough rows to paginate client-side

export default function Home() {
    const [search, setSearch] = useState("");
    const household = useHousehold();
    const [householdLoading, setHouseholdLoading] = useState(!household);
    const [myRank, setMyRank] = useState<number | null>(null);

    const [rules, setRules] = useState<Rule[]>([]);
    const [rulesLoading, setRulesLoading] = useState(true);
    const [rulesError, setRulesError] = useState("");
    const [rulesPage, setRulesPage] = useState(1);

    const [activity, setActivity] = useState<ActivityItem[]>([]);
    const [activityLoading, setActivityLoading] = useState(true);
    const [activityPage, setActivityPage] = useState(1);

    const loadHousehold = useCallback(async () => {
        setHouseholdLoading(true);
        await fetchHousehold();
        setHouseholdLoading(false);
    }, []);

    const loadActivity = useCallback(async (householdId?: string) => {
        if (!householdId) return;
        try {
            setActivityLoading(true);
            const data = await getHouseholdActivity(householdId, ACTIVITY_FETCH_LIMIT);
            setActivity(data);
        } catch (err) {
            console.error("Failed to load activity:", err);
        } finally {
            setActivityLoading(false);
        }
    }, []);

    const fetchRules = useCallback(async () => {
        try {
            setRulesLoading(true);
            const data = await getRules();
            const list = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
            setRules(list);
        } catch (err) {
            console.error(err);
            setRules([]);
            setRulesError("Failed to load rules. Please try again later.");
        } finally {
            setRulesLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!household?._id) return;
        const fetchRank = async () => {
            try {
                const res = await fetch(`${API_BASE}/api/households/leaderboard?limit=200`);
                const data = await res.json();
                if (data.success) {
                    const me = data.data.find((h: any) => h._id === household._id);
                    if (me) setMyRank(me.rank);
                }
            } catch (err) {
                console.error("Failed to fetch rank:", err);
            }
        };
        fetchRank();
    }, [household?._id, household?.points?.total]); // re-fetch rank when points change

    useEffect(() => {
        loadHousehold();
        fetchRules();
    }, []);

    useEffect(() => {
        if (household?._id) {
            loadActivity(household._id);
            setActivityPage(1);
        }
    }, [household?._id]);

    // Refresh points & activity whenever Home regains focus — catches a
    // redemption made on the Rewards screen or points awarded via RFID scan
    useFocusEffect(
        useCallback(() => {
            loadHousehold();
            if (household?._id) loadActivity(household._id);
        }, [household?._id])
    );

    const filteredRules = rules.filter((r) => r.name.toLowerCase().includes(search.toLowerCase()));

    // Reset to page 1 whenever the search term changes
    useEffect(() => {
        setRulesPage(1);
    }, [search]);

    // Clamp pages if the underlying data shrinks (e.g. a refetch returns fewer rows)
    useEffect(() => {
        const totalPages = Math.max(1, Math.ceil(filteredRules.length / RULES_PER_PAGE));
        if (rulesPage > totalPages) setRulesPage(totalPages);
    }, [filteredRules.length]);

    useEffect(() => {
        const totalPages = Math.max(1, Math.ceil(activity.length / ACTIVITY_PER_PAGE));
        if (activityPage > totalPages) setActivityPage(totalPages);
    }, [activity.length]);

    const paginatedRules = filteredRules.slice(
        (rulesPage - 1) * RULES_PER_PAGE,
        rulesPage * RULES_PER_PAGE
    );
    type RuleItem = Rule & {
        __filler?: boolean;
    };

    const rulesFillerCount = Math.max(0, RULES_PER_PAGE - paginatedRules.length);
    const rulesForDisplay: RuleItem[] = [
        ...paginatedRules,
        ...Array.from({ length: rulesFillerCount }, (_, i) => ({
            _id: `__filler-${i}`,
            name: "",
            __filler: true,
        })),
    ];
    const paginatedActivity = activity.slice(
        (activityPage - 1) * ACTIVITY_PER_PAGE,
        activityPage * ACTIVITY_PER_PAGE
    );

    const activityFillerCount = Math.max(0, ACTIVITY_PER_PAGE - paginatedActivity.length);

    if (householdLoading) {
        return (
            <SafeAreaView className="flex-1 items-center justify-center">
                <ActivityIndicator size="large" color="#16A34A" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1">
            <ScrollView className="flex-1 px-4 py-2">
                <View>
                    <Text className="text-3xl font-bold">Home</Text>
                    <Text className="text-gray-500 mb-6">Keep up the great work with waste segregation</Text>
                </View>

                <View className="bg-green-600 text-white rounded-xl shadow p-6 gap-4">
                    <Text className="text-white">Welcome back,</Text>
                    <Text className="text-4xl text-white font-bold">{household?.fullname ?? "—"}!</Text>

                    <View className="flex-row items-center gap-2">
                        <Feather name="award" size={20} color="white" />
                        <Text className="font-semibold text-white">Total Points Earned</Text>
                    </View>
                    <View className="flex-row justify-between items-center">
                        <View>
                            <Text className="text-4xl font-bold text-white">{household?.points?.total ?? 0}</Text>
                            <Text className="text-green-100">Total Points Earned</Text>
                        </View>
                        <View className="bg-green-600 p-2 rounded-xl border border-green-700 items-center justify-center">
                            <Text className="text-2xl font-bold text-white">#{myRank ?? "—"}</Text>
                            <Text className="text-white text-center">Current rank</Text>
                        </View>
                    </View>
                    <View className="flex-row justify-between text-sm">
                        <Text className="text-white">This Month</Text>
                        <Text className="font-semibold text-white">+{household?.points?.thisMonth ?? 0} points</Text>
                    </View>
                </View>

                {/* Rules Section */}
                <View className="bg-white rounded-xl p-6 shadow mt-10">
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

                    {!!rulesError && <Text className="text-red-500 mb-2">{rulesError}</Text>}

                    <FlatList
                        data={rulesForDisplay}
                        keyExtractor={(item) => item._id}
                        numColumns={2}
                        scrollEnabled={false}
                        columnWrapperStyle={{ gap: 10 }}
                        contentContainerStyle={{ gap: 10 }}
                        ListEmptyComponent={
                            !rulesLoading && !rulesError ? (
                                <Text className="text-gray-500 text-center py-6 w-full">No rules found.</Text>
                            ) : null
                        }
                        renderItem={({ item: r, index }) => (
                            r.__filler ? (
                                <View className="flex-1 h-56" style={{ opacity: 0 }} />
                            ) : (
                                <View className="flex-1 bg-gray-50 rounded-xl shadow-lg overflow-hidden">
                                    {r.image ? (
                                        <Image source={{ uri: r.image }} className="w-full h-40" resizeMode="cover" />
                                    ) : (
                                        <View className="w-full h-40 bg-gray-200 items-center justify-center">
                                            <Text className="text-gray-400">No image</Text>
                                        </View>
                                    )}
                                    <View className="p-3 gap-1">
                                        <Text className="text-sm font-bold">Rule {(rulesPage - 1) * RULES_PER_PAGE + index + 1}</Text>
                                        <Text className="text-xs text-gray-500">{r.name}</Text>
                                        <Text className="text-xs text-gray-400">{r.description}</Text>
                                        <Text className="text-xs text-gray-400">{r.frequency}</Text>
                                    </View>
                                    <View className="absolute top-2 right-2 bg-white rounded-lg p-1 shadow-md">
                                        <Text className="text-green-500 font-bold text-sm text-center">+{r.points}</Text>
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

                {/* RA 9003 */}
                <View className="bg-white rounded-xl p-6 shadow mt-10">
                    <View className="flex flex-col sm:flex-row sm:justify-between gap-4 mt-5">
                        <View className="flex-row items-start gap-4">
                            <View>
                                <Text className="text-xl font-bold text-gray-800">Republic Act No. 9003</Text>
                                <Text className="text-green-700 text-sm">Ecological Solid Waste Management Act of 2000</Text>
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
                                {" "}It promotes waste reduction, mandatory segregation at source, recycling, composting,
                                and the closure of open dumpsites, while requiring local government units to take primary
                                responsibility for implementation under the supervision of the Department of Environment
                                and Natural Resources.
                            </Text>
                            {" "}The law aims to protect public health and the environment by shifting the country from improper
                            disposal practices to an ecological and community-based waste management approach.
                        </Text>
                    </View>
                </View>

                <TouchableOpacity
                    onPress={() => Linking.openURL("https://www.officialgazette.gov.ph/2001/01/26/republic-act-no-9003/")}
                    className="flex-row items-center gap-2"
                >
                    <Text className="text-green-600 font-medium">See full text of RA 9003</Text>
                </TouchableOpacity>

                {/* Recent Activity — now from the database */}
                <View className="bg-white rounded-xl p-6 shadow mt-5 mb-5">
                    <Text className="text-lg font-semibold mb-4">Recent Activity</Text>

                    {activityLoading && (
                        <View className="items-center py-6">
                            <ActivityIndicator color="#16A34A" />
                        </View>
                    )}

                    {paginatedActivity.map((a, i) => (
                        <View key={i} className="flex-row justify-between items-center mb-2">
                            <View>
                                <Text className="font-medium">{a.type}</Text>
                                <Text className="text-xs">
                                    {a.via}
                                    {a.amount ? ` - ${a.amount}` : ""}
                                </Text>
                                <Text className="text-xs text-gray-500">{new Date(a.date).toLocaleDateString()}</Text>
                            </View>
                            <Text className={`font-semibold ${a.points > 0 ? "text-green-600" : "text-red-500"}`}>
                                {a.points > 0 ? `+${a.points}` : a.points}
                            </Text>
                        </View>
                    ))}

                    {Array.from({ length: activityFillerCount }).map((_, i) => (
                        <View key={`filler-${i}`} className="h-11 mb-2" style={{ opacity: 0 }} />
                    ))}

                    {!activityLoading && activity.length === 0 && (
                        <Text className="text-gray-500 text-center py-6">No activity yet.</Text>
                    )}

                    {!activityLoading && activity.length > 0 && (
                        <Pagination
                            currentPage={activityPage}
                            totalItems={activity.length}
                            itemsPerPage={ACTIVITY_PER_PAGE}
                            onPageChange={setActivityPage}
                        />
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}