import { X, Calendar } from "lucide-react";
import { useState } from "react";
import Pagination from "./Pagination";

const REWARD_LIMIT = 7;

const rewardLogs = [
    { id: 1, date: "2026-02-18", rewardName: "Free Clinical Checkup", householdId: "HH-202610001", householdName: "Joel Dela Cruz", stockUpdate: -1 },
    { id: 2, date: "2026-02-18", rewardName: "Vitamins/Medicine", householdId: "HH-202610002", householdName: "Martin Lopez", stockUpdate: -1 },
    { id: 3, date: "2026-02-17", rewardName: "Free Clinical Checkup", householdId: "HH-202610003", householdName: "Ramon Reyes", stockUpdate: -1 },
    { id: 4, date: "2026-02-16", rewardName: "50% off to Barangay Clearance", householdId: "HH-202610004", householdName: "Remedio Delo Santos", stockUpdate: -1 },
    { id: 5, date: "2026-02-15", rewardName: "50% off to Business Permit", householdId: "HH-202610005", householdName: "Cecilia Garcia", stockUpdate: -1 },
    { id: 6, date: "2026-02-14", rewardName: "50% off to Business Permit", householdId: "HH-202610006", householdName: "Rolando Martinez", stockUpdate: -1 },
    { id: 7, date: "2026-02-13", rewardName: "50% off to Barangay Clearance", householdId: "HH-202610007", householdName: "Rolando Martinez", stockUpdate: -1 },
    { id: 8, date: "2026-02-12", rewardName: "Vitamins/Medicine", householdId: "HH-202610008", householdName: "Joel Dela Cruz", stockUpdate: -1 },
];

export function ViewRewardModal({ isOpen, onClose, rName }) {
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate]     = useState("");
    const [page, setPage]         = useState(1);

    if (!isOpen) return null;

    const filteredLogs = rewardLogs.filter((log) => {
        const matchesReward = !rName || log.rewardName === rName;

        const logDate = new Date(log.date);
        const matchesDate =
            (!fromDate || logDate >= new Date(fromDate)) &&
            (!toDate || logDate <= new Date(toDate));

        return matchesReward && matchesDate;
    });

    const paginatedLogs = filteredLogs.slice(
        (page - 1) * REWARD_LIMIT,
        page * REWARD_LIMIT
    );
    const emptyRows = Math.max(0, REWARD_LIMIT - paginatedLogs.length);

    const handleDateChange = (value) => {
        setFromDate(value);
        setPage(1);
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
            <div className="bg-white w-full max-h-[90vh] overflow-y-auto max-w-5xl rounded-2xl shadow-lg overflow-hidden">

                {/* HEADER */}
                <div className="flex justify-between items-center px-6 py-4 border-b">
                    <h2 className="text-lg font-bold">Reward History</h2>
                    <button onClick={onClose}>
                        <X className="text-gray-500 cursor-pointer hover:text-gray-800" />
                    </button>
                </div>

                {/* FILTER */}
                <div className="w-full flex flex-col sm:flex-row gap-4 px-6 py-4 border-b">
                    <div className=" flex items-center gap-2 w-auto sm:w-full">
                        <Calendar size={16} />
                        <p>Date Collected:</p>
                        <input
                            type="date"
                            value={fromDate}
                            onChange={(e) => handleDateChange(e.target.value)}
                            className="border rounded-lg px-3 py-2 text-sm w-50"
                        />
                    </div>
                </div>

                {/* TABLE */}
                <div className="px-2">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-100 sticky top-0">
                                <tr>
                                    <th className="py-3">Date</th>
                                    <th>Reward Name</th>
                                    <th>Household ID</th>
                                    <th>Resident</th>
                                    <th className="px-4">Stock</th>
                                </tr>
                            </thead>

                            <tbody className="text-center">
                                {paginatedLogs.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="text-center py-6 text-gray-500">
                                            No records found for selected dates
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedLogs.map((log) => (
                                        <tr key={log.id}>
                                            <td className="py-3 font-medium">{log.date}</td>
                                            <td>{log.rewardName}</td>
                                            <td>{log.householdId}</td>
                                            <td>{log.householdName}</td>
                                            <td className="text-red-500">{log.stockUpdate}</td>
                                        </tr>
                                    ))
                                )}
                                {/* Pad remaining slots so table height stays constant at REWARD_LIMIT rows */}
                                {paginatedLogs.length > 0 &&
                                    Array.from({ length: emptyRows }).map((_, i) => (
                                        <tr key={`reward-empty-${i}`} aria-hidden="true">
                                            <td className="py-3" colSpan="5">&nbsp;</td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>

                    <Pagination
                        currentPage={page}
                        totalItems={filteredLogs.length}
                        itemsPerPage={REWARD_LIMIT}
                        onPageChange={setPage}
                    />
                </div>

            </div>
        </div>
    );
}