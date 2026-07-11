import { useState, useEffect, useRef, useCallback } from "react";
import { View, Text, FlatList, ActivityIndicator, RefreshControl } from "react-native";
import { Feather } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE } from "@/config";
import Pagination from "../../components/UserPagination";

const POLL_INTERVAL_MS = 10000;
const RANKINGS_PER_PAGE = 5;

const tierStyles = {
  Gold:   { bg: "bg-yellow-100", text: "text-yellow-700" },
  Silver: { bg: "bg-gray-100",   text: "text-gray-700"   },
  Bronze: { bg: "bg-orange-100", text: "text-orange-700" },
};

const getTierByRank = (rank) => {
  if (rank === 1) return "Gold";
  if (rank === 2) return "Silver";
  if (rank === 3) return "Bronze";
  return null;
};

export default function Leaderboard() {
  const [rankedData, setRankedData]   = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(false);
  const [refreshing, setRefreshing]   = useState(false);
  const [rankingsPage, setRankingsPage] = useState(1);
  const myHouseholdIdRef              = useRef(null);
  const isMountedRef                  = useRef(true);

  useEffect(() => {
    (async () => {
      try {
        const raw  = await AsyncStorage.getItem("user");
        const user = raw ? JSON.parse(raw) : null;
        myHouseholdIdRef.current = user?.id ?? null;
      } catch (err) {
        console.error("Failed to read user from storage:", err);
      }
    })();
  }, []);

  const fetchLeaderboard = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    try {
      const res  = await fetch(`${API_BASE}/api/households/leaderboard?limit=50`);
      const data = await res.json();

      if (!data.success) throw new Error("Failed to fetch leaderboard");

      const ranked = (data.data ?? []).map((hh) => ({
        ...hh,
        householdId: `HH-${hh._id.slice(-8).toUpperCase()}`,
        tier:        getTierByRank(hh.rank),
        isYou:       myHouseholdIdRef.current
                       ? hh._id === myHouseholdIdRef.current
                       : false,
      }));

      if (isMountedRef.current) {
        setRankedData(ranked);
        setError(false);
      }
    } catch (err) {
      console.error("Leaderboard fetch error:", err);
      if (isMountedRef.current) setError(true);
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    fetchLeaderboard();
    const id = setInterval(() => fetchLeaderboard({ silent: true }), POLL_INTERVAL_MS);
    return () => { isMountedRef.current = false; clearInterval(id); };
  }, [fetchLeaderboard]);

  // Clamp the current page if a refresh returns fewer rows than before
  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(rankedData.length / RANKINGS_PER_PAGE));
    if (rankingsPage > totalPages) setRankingsPage(totalPages);
  }, [rankedData.length]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchLeaderboard({ silent: true });
  };

  const podiumData = rankedData.slice(0, 3);

  const paginatedRankingsRaw = rankedData.slice(
    (rankingsPage - 1) * RANKINGS_PER_PAGE,
    rankingsPage * RANKINGS_PER_PAGE
  );
  const rankingsFillerCount = Math.max(0, RANKINGS_PER_PAGE - paginatedRankingsRaw.length);
  const paginatedRankings = [
    ...paginatedRankingsRaw,
    ...Array.from({ length: rankingsFillerCount }, (_, i) => ({
      householdId: `__filler-${i}`,
      __filler: true,
    })),
  ];

  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#16A34A" />
        <Text className="text-gray-400 mt-3">Loading leaderboard...</Text>
      </SafeAreaView>
    );
  }

  if (error && rankedData.length === 0) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-gray-50 px-6">
        <Feather name="alert-triangle" size={28} color="#DC2626" />
        <Text className="text-red-500 mt-3 text-center">Failed to load leaderboard.</Text>
        <Text className="text-gray-400 text-xs mt-1 text-center">Pull down to try again.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1">
      <FlatList
        data={paginatedRankings}
        keyExtractor={(item) => item.householdId}
        className="flex-1 px-4 py-2 bg-gray-50"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={["#16A34A"]} />
        }
        ListHeaderComponent={() => (
          <View className="space-y-6">
            <View>
              <Text className="text-3xl font-bold">Community Leaderboard</Text>
              <Text className="text-gray-500">
                See how you rank among other households in waste management
              </Text>
            </View>

            {rankedData.length === 0 ? (
              <View className="bg-white rounded-xl shadow p-8 items-center">
                <Text className="text-gray-400">No household data yet.</Text>
              </View>
            ) : (
              <>
                {/* Podium */}
                <View className="flex flex-col gap-2 bg-green-50 rounded-xl p-4 shadow space-y-4">
                  {podiumData.map((item) => (
                    <View
                      key={item.rank}
                      className={`bg-white rounded-xl shadow p-4 flex-row items-center gap-4 ${item.isYou ? "border border-green-400" : ""}`}
                    >
                      <View className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                        <Text className="font-bold">#{item.rank}</Text>
                      </View>
                      <View className="flex-1">
                        <Text className="font-semibold">{item.fullname}</Text>
                        <Text className="text-xs text-gray-400">{item.address}</Text>
                        <Text className="text-sm text-green-600 font-bold">{item.points} pts</Text>
                        <Text className="text-xs text-gray-400">{item.disposals} disposals</Text>
                        {item.isYou && (
                          <Text className="mt-1 text-xs bg-green-600 text-white px-2 py-0.5 rounded-full self-start">
                            You
                          </Text>
                        )}
                      </View>
                      {item.rank === 1 && <Feather name="award" size={24} color="#FACC15" />}
                    </View>
                  ))}

                  <View className="mt-4 flex-row justify-center">
                    <View className="flex-row items-center gap-2 bg-white px-4 py-2 rounded-full shadow">
                      <Feather name="star" size={16} color="#FACC15" />
                      <Text>Top performers this month!</Text>
                    </View>
                  </View>
                </View>

                {/* All Rankings Title */}
                <View className="bg-white rounded-tr-xl rounded-tl-xl shadow overflow-hidden mt-5">
                  <View className="p-4 border-b">
                    <Text className="text-xl font-bold">All Rankings</Text>
                  </View>
                </View>
              </>
            )}
          </View>
        )}
        renderItem={({ item }) => (
          item.__filler ? (
            <View className="h-12" style={{ opacity: 0 }} />
          ) : (
          <View className={`flex-row justify-between items-center px-4 py-2 border-b border-gray-100 ${item.isYou ? "bg-green-50" : ""}`}>
            <Text className="font-semibold w-8">#{item.rank}</Text>

            <View className="flex-1 px-2">
              <Text className="font-medium">{item.fullname}</Text>
              <Text className="text-xs text-gray-500">{item.householdId}</Text>
              {item.isYou && (
                <Text className="mt-1 text-xs bg-green-600 text-white px-2 py-0.5 rounded-full self-start">You</Text>
              )}
            </View>

            <View className="px-2">
              {item.tier ? (
                <Text className={`px-3 py-1 rounded-full text-xs font-medium ${tierStyles[item.tier].bg} ${tierStyles[item.tier].text}`}>
                  {item.tier}
                </Text>
              ) : (
                <Text className="text-gray-400 text-xs px-3">—</Text>
              )}
            </View>

            <Text className="px-2 text-gray-500 text-sm">{item.disposals}</Text>
            <Text className="px-2 font-bold text-green-600">{item.points}</Text>

            <View className="px-2">
              <Feather name="trending-up" size={18} color="#16A34A" />
            </View>
          </View>
          )
        )}
        ListFooterComponent={
          rankedData.length > 0 ? (
            <View className="bg-white px-4 pb-4">
              <Pagination
                currentPage={rankingsPage}
                totalItems={rankedData.length}
                itemsPerPage={RANKINGS_PER_PAGE}
                onPageChange={setRankingsPage}
              />
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}