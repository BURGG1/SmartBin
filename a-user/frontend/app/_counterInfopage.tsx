// import React, { useState, useMemo } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   FlatList,
//   Alert,
//   SafeAreaView,
// } from "react-native";
// import { Feather } from "@expo/vector-icons";

// // Mock data — replace with your real data source / API call
// const disposalLogs = [
//   {
//     id: 1,
//     date: "2026-02-01",
//     time: "09:52:08",
//     duration: "38s",
//     houseId: "HH-202610001",
//     resident: "Joel Dela Cruz",
//     contact: "+63-917-123-4567",
//     email: "delacruzjoel@gmail.com",
//   },
//   {
//     id: 2,
//     date: "2026-02-01",
//     time: "09:35:12",
//     duration: "41s",
//     houseId: "HH-202610002",
//     resident: "Remedios Delo Santos",
//     contact: "+63-917-123-4567",
//     email: "remydelosantos@gmail.com",
//   },
//   {
//     id: 3,
//     date: "2026-01-31",
//     time: "08:12:44",
//     duration: "52s",
//     houseId: "HH-202610003",
//     resident: "Ramon Reyes",
//     contact: "+63-917-123-4567",
//     email: "rreyes1234@gmail.com",
//   },
//   {
//     id: 4,
//     date: "2026-01-31",
//     time: "08:12:44",
//     duration: "52s",
//     houseId: "HH-202610004",
//     resident: "Cecilia Garcia",
//     contact: "+63-917-123-4567",
//     email: "cecilgarcia13@gmail.com",
//   },
// ];

// export default function CounterInfoScreen({ route, navigation }) {
//   // `bin` would normally arrive via route.params in a real navigator
//   const bin = route?.params?.bin ?? { id: "BIN-001", type: "Biodegradable" };

//   const [fromDate, setFromDate] = useState("");
//   const [toDate, setToDate] = useState("");
//   const [flaggedIds, setFlaggedIds] = useState(new Set());

//   const filteredLogs = useMemo(() => {
//     return disposalLogs.filter((log) => {
//       if (!fromDate && !toDate) return true;
//       const logDate = new Date(log.date);
//       const from = fromDate ? new Date(fromDate) : null;
//       const to = toDate ? new Date(toDate) : null;
//       return (!from || logDate >= from) && (!to || logDate <= to);
//     });
//   }, [fromDate, toDate]);

//   const toggleFlag = (log) => {
//     setFlaggedIds((prev) => {
//       const next = new Set(prev);
//       const alreadyFlagged = next.has(log.id);

//       if (alreadyFlagged) {
//         next.delete(log.id);
//       } else {
//         next.add(log.id);
//         Alert.alert(
//           "Household Flagged",
//           `${log.resident} (${log.houseId}) has been flagged for review.`
//         );
//       }
//       return next;
//     });
//   };

//   const renderItem = ({ item: log }) => {
//     const isFlagged = flaggedIds.has(log.id);
//     return (
//       <View
//         className={`flex-row items-center px-4 py-3 border-b border-gray-100 ${
//           isFlagged ? "bg-red-50" : ""
//         }`}
//       >
//         <View className="w-[90px]">
//           <Text className="text-sm text-gray-900">{log.date}</Text>
//           <Text className="text-xs text-gray-500">{log.time}</Text>
//         </View>

//         <View className="flex-1 px-2">
//           <Text className="text-sm font-semibold text-gray-900">
//             #{log.id} · {log.houseId}
//           </Text>
//           <Text className="text-sm text-gray-800 mt-0.5">{log.resident}</Text>
//           <Text className="text-xs text-gray-500">{log.contact}</Text>
//           <Text className="text-xs text-gray-500">{log.email}</Text>
//         </View>

//         <TouchableOpacity
//           onPress={() => toggleFlag(log)}
//           className={`flex-row items-center gap-1 border rounded-lg px-2.5 py-1.5 ${
//             isFlagged
//               ? "bg-red-600 border-red-600"
//               : "bg-white border-red-600"
//           }`}
//         >
//           <Feather
//             name="flag"
//             size={16}
//             color={isFlagged ? "#fff" : "#dc2626"}
//           />
//           <Text
//             className={`text-xs font-semibold ${
//               isFlagged ? "text-white" : "text-red-600"
//             }`}
//           >
//             {isFlagged ? "Flagged" : "Flag"}
//           </Text>
//         </TouchableOpacity>
//       </View>
//     );
//   };

//   return (
//     <SafeAreaView className="flex-1 bg-white">
//       {/* HEADER */}
//       <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
//         <TouchableOpacity onPress={() => navigation?.goBack?.()}>
//           <Feather name="chevron-left" size={22} color="#4b5563" />
//         </TouchableOpacity>
//         <Text className="text-base font-semibold text-gray-600">
//           Counter Information
//         </Text>
//         <View className="w-[22px]" />
//       </View>

//       {/* BIN INFO */}
//       <View className="px-4 pt-2.5">
//         <Text className="text-base font-bold text-gray-900">
//           {bin.id} - <Text className="font-normal text-gray-700">{bin.type}</Text>
//         </Text>
//       </View>

//       {/* FILTER */}
//       <View className="flex-row items-center flex-wrap gap-1.5 px-4 py-2.5 border-b border-gray-200">
//         <Feather name="calendar" size={16} color="#374151" />
//         <Text className="text-sm text-gray-700 ml-1">From</Text>
//         <TextInput
//           placeholder="YYYY-MM-DD"
//           value={fromDate}
//           onChangeText={setFromDate}
//           className="border border-gray-300 rounded-lg px-2.5 py-1.5 text-sm min-w-[110px]"
//         />
//         <Text className="text-sm text-gray-700 ml-1">To</Text>
//         <TextInput
//           placeholder="YYYY-MM-DD"
//           value={toDate}
//           onChangeText={setToDate}
//           className="border border-gray-300 rounded-lg px-2.5 py-1.5 text-sm min-w-[110px]"
//         />
//       </View>

//       {/* LIST */}
//       <FlatList
//         data={filteredLogs}
//         keyExtractor={(item) => String(item.id)}
//         renderItem={renderItem}
//         ListEmptyComponent={
//           <Text className="text-center text-gray-500 py-6">
//             No records found for selected dates
//           </Text>
//         }
//         contentContainerStyle={{ paddingBottom: 24 }}
//       />
//     </SafeAreaView>
//   );
// }