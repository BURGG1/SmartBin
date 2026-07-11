import { View, Text, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";

type PaginationProps = {
    currentPage: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
};

export default function Pagination({ currentPage, totalItems, itemsPerPage, onPageChange }: PaginationProps) {
    const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

    if (totalPages <= 1) return null;

    return (
        <View className="flex-row items-end justify-between mt-4 pt-4 border-t border-gray-100">
            <Text className="text-sm font-medium text-gray-600">
                {currentPage} / {totalPages}
            </Text>

            <View className="flex-row items-center gap-2">
                <TouchableOpacity
                    onPress={() => onPageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg"
                    style={{ opacity: currentPage === 1 ? 0.4 : 1 }}
                >
                    <Feather name="chevron-left" size={18} color="#4B5563" />
                </TouchableOpacity>

                <View className="min-w-9 px-3 py-1.5 rounded-lg bg-green-600 items-center justify-center">
                    <Text className="text-white text-sm font-semibold">{currentPage}</Text>
                </View>

                <TouchableOpacity
                    onPress={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg"
                    style={{ opacity: currentPage === totalPages ? 0.4 : 1 }}
                >
                    <Feather name="chevron-right" size={18} color="#4B5563" />
                </TouchableOpacity>
            </View>
        </View>
    );
}