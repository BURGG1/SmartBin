import {
    Users,
    CheckCircle,
    AlertTriangle,
    XCircle,
    Medal, Trophy, Star
} from "lucide-react";
import {
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";


const householdRecords = [
    {
        id: "HH-24680135",
        name: "Dela Cruz Family",
        address: "Green St.",
        disposals: 48,
        points: 1240,
        status: "compliant",
    },
    {
        id: "HH-13579246",
        name: "Santos Family",
        address: "Sunshine Ave.",
        disposals: 35,
        points: 920,
        status: "compliant",
    },
    {
        id: "HH-86420975",
        name: "Reyes Household",
        address: "Eco Lane",
        disposals: 22,
        points: 450,
        status: "warning",
    },
    {
        id: "HH-97531468",
        name: "Garcia Family",
        address: "Clean Rd.",
        disposals: 12,
        points: 180,
        status: "non-compliant",
    },
    {
        id: "HH-75391482",
        name: "Martinez Family",
        address: "Fresh Blvd.",
        disposals: 41,
        points: 1050,
        status: "compliant",
    },
    {
        id: "HH-15948673",
        name: "Lopez Household",
        address: "Nature St.",
        disposals: 18,
        points: 380,
        status: "warning",
    },
    {
        id: "HH-25948673",
        name: "Lopez Household",
        address: "Nature St.",
        disposals: 18,
        points: 380,
        status: "warning",
    },
];


// STAT CARD
const stats = [
    {
        title: "Total Households",
        value: 6,
        icon: Users,
        iconBg: "bg-blue-100",
        iconColor: "text-blue-600",
        percentage: null,
    },
    {
        title: "Properly Segregating",
        value: 3,
        icon: CheckCircle,
        iconBg: "bg-green-100",
        iconColor: "text-green-600",
        percentage: "50%",
        percentColor: "text-green-600",
    },
    {
        title: "For Improvement",
        value: 1,
        icon: XCircle,
        iconBg: "bg-red-100",
        iconColor: "text-red-600",
        percentage: "17%",
        percentColor: "text-red-600",
    },
];

// Pie chart data
const wasteDistribution = [
    { name: "Biodegradable", value: 45, color: "#10b981" },
    { name: "Non-biodegradable", value: 30, color: "#f97316" },
    { name: "Recyclable", value: 25, color: "#3b82f6" },
];

// Bar chart data
const monthlyCompliance = [
    { month: "Jan", compliant: 85, nonCompliant: 15 },
    { month: "Feb", compliant: 88, nonCompliant: 12 },
    { month: "Mar", compliant: 92, nonCompliant: 8 },
    { month: "Apr", compliant: 90, nonCompliant: 10 },
];

const statusStyles = {
    compliant: "bg-green-100 text-green-700",
    warning: "bg-yellow-100 text-yellow-700",
    "non-compliant": "bg-red-100 text-red-700",
};

const statusIcons = {
    compliant: <CheckCircle size={16} />,
    warning: <AlertTriangle size={16} />,
    "non-compliant": <XCircle size={16} />,
};

const rawData = [
    {
        family: "Santos Family",
        householdId: "HH-13579246",
        disposals: 62,
        points: 1580,
        trend: "up",
        isYou: false,
    },
    {
        family: "Martinez Family",
        householdId: "HH-75391482",
        disposals: 54,
        points: 1350,
        trend: "up",
        isYou: false,
    },
    {
        family: "Dela Cruz Family",
        householdId: "HH-24680135",
        disposals: 48,
        points: 1240,
        trend: "up",
        isYou: true,
    },
    {
        family: "Lopez Household",
        householdId: "HH-15948673",
        disposals: 38,
        points: 920,
        trend: "down",
        isYou: false,
    },
];


const medalStyles = {
    Gold: {
        ring: "border-yellow-400 text-yellow-500",
        podium: "bg-yellow-400",
    },
    Silver: {
        ring: "border-gray-300 text-gray-400",
        podium: "bg-gray-300",
    },
    Bronze: {
        ring: "border-orange-400 text-orange-500",
        podium: "bg-orange-400",
    },
};

const tierStyles = {
    Gold: "bg-yellow-100 text-yellow-700",
    Silver: "bg-gray-100 text-gray-700",
    Bronze: "bg-orange-100 text-orange-700",
};

const getTierByRank = (rank) => {
    if (rank === 1) return "Gold";
    if (rank === 2) return "Silver";
    if (rank === 3) return "Bronze";
    return null;
};




export default function AdminDashboard() {

    const rankedData = [...rawData]
        .sort((a, b) => b.points - a.points)
        .map((item, index) => ({
            ...item,
            rank: index + 1,
            tier: getTierByRank(index + 1),
        }));

    const podiumData = rankedData.slice(0, 3);

    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("all");

    const filteredData = householdRecords.filter((h) => {
        const matchSearch =
            h.name.toLowerCase().includes(search.toLowerCase()) ||
            h.id.toLowerCase().includes(search.toLowerCase());

        const matchFilter = filter === "all" || h.status === filter;

        return matchSearch && matchFilter;
    });


    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />

            <div className="flex flex-col min-h-screen bg-gray-50 md:flex-row">

                <main className="flex-1 w-full p-4 sm:p-6 space-y-6">

                    <div className="hidden md:block">
                        <h1 className="text-lg sm:text-3xl font-bold text-gray-900">
                            Dashboard
                        </h1>
                        <p className="text-gray-500 text-xs sm:text-lg ">
                            Monitor overall waste segregation compliance
                        </p>
                    </div>


                    <section className="flex flex-col gap-5">

                        {/* Stat Cards */}
                        <div className="w-full flex flex-col lg:flex-row gap-4">
                            {stats.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <div
                                        key={item.title}
                                        className="w-full bg-white rounded-xl shadow-sm p-5 flex justify-between items-center"
                                    >
                                        <div className="w-full flex flex-col gap-4">

                                            <div className="w-full flex justify-between">
                                                <div className={`p-3 rounded-lg ${item.iconBg}`}>
                                                    <Icon className={`${item.iconColor}`} />
                                                </div>
                                                {item.percentage && (
                                                    <span
                                                        className={`text-sm font-medium ${item.percentColor}`}
                                                    >
                                                        {item.percentage}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex flex-col">
                                                <p className="text-2xl font-bold">{item.value}</p>
                                                <p className="text-sm text-gray-500">{item.title}</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Charts */}
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                            {/* Pie Chart */}
                            <div className="bg-white rounded-xl shadow-sm  p-6">
                                <h3 className="text-lg font-semibold mb-4">
                                    Waste Segregation Distribution
                                </h3>

                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height={256}>
                                        <PieChart>
                                            <Pie
                                                data={wasteDistribution}
                                                dataKey="value"
                                                nameKey="name"
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={90}
                                                label={({ name, value }) => `${name} ${value}%`}
                                            >
                                                {wasteDistribution.map((entry, index) => (
                                                    <Cell
                                                        key={index}
                                                        fill={entry.color}
                                                    />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Bar Chart */}
                            <div className="bg-white rounded-xl shadow-sm p-6">
                                <h3 className="text-lg font-semibold mb-4">
                                    Monthly Compliance Trend
                                </h3>

                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height={256}>
                                        <BarChart data={monthlyCompliance}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="month" />
                                            <YAxis />
                                            <Tooltip />
                                            <Bar
                                                dataKey="compliant"
                                                fill="#10b981"
                                                name="Compliant %"
                                                radius={[6, 6, 0, 0]}
                                            />
                                            <Bar
                                                dataKey="nonCompliant"
                                                fill="#ef4444"
                                                name="Non-Compliant %"
                                                radius={[6, 6, 0, 0]}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                    </section>

                    <section className="w-full bg-gradient-to-b from-green-50 to-white rounded-xl p-4 sm:p-6 shadow">

                        {/* ===== MOBILE PODIUM ===== */}
                        <div className="flex flex-col gap-4 lg:hidden">
                            <h3 className="text-lg font-semibold mb-4">
                                Leaderboard
                            </h3>

                            {[1, 2, 3].map((pos) => {
                                const item = podiumData.find((i) => i.rank === pos);
                                if (!item) return null;

                                return (
                                    <div
                                        key={item.rank}
                                        className="bg-white rounded-xl shadow p-4 flex items-center gap-4"
                                    >
                                        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center font-bold">
                                            #{item.rank}
                                        </div>

                                        <div className="flex-1">
                                            <h3 className="font-semibold">{item.family}</h3>
                                            <p className="text-sm text-green-600 font-bold">
                                                {item.points} pts
                                            </p>
                                        </div>

                                        {item.rank === 1 && <Trophy className="text-yellow-500" />}
                                    </div>
                                );
                            })}
                        </div>

                        {/* ===== DESKTOP PODIUM ===== */}
                        <div className="hidden lg:flex w-full justify-center items-end gap-6 p-10">
                            {[2, 1, 3].map((pos) => {
                                const item = podiumData.find((i) => i.rank === pos);
                                if (!item) return null;

                                const style = medalStyles[item.tier];

                                return (
                                    <div
                                        key={item.rank}
                                        className={`flex flex-col items-center ${item.rank === 1 ? "-mt-6" : ""
                                            }`}
                                    >
                                        <div
                                            className={`w-20 h-20 rounded-full border-4 flex items-center justify-center mb-3 ${style.ring}`}
                                        >
                                            {item.rank === 1 ? <Trophy /> : <Medal />}
                                        </div>

                                        <div className="bg-white rounded-xl shadow px-6 py-4 text-center min-w-[180px]">
                                            <p className="text-2xl font-bold">
                                                {item.rank === 1 ? "1st" : item.rank === 2 ? "2nd" : "3rd"}
                                            </p>
                                            <h3 className="font-semibold">{item.family}</h3>
                                            <p className="text-green-600 font-bold mt-1">
                                                {item.points} pts
                                            </p>
                                        </div>

                                        <div
                                            className={`w-full mt-4 rounded-t-xl ${style.podium}`}
                                            style={{
                                                height:
                                                    item.rank === 1 ? "120px" : item.rank === 2 ? "90px" : "70px",
                                            }}
                                        />
                                    </div>


                                );
                            })}
                        </div>

                        <div className="mt-8 flex justify-center">
                            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow text-sm font-medium">
                                <Star className="text-yellow-400" size={16} />
                                Top performers this month!
                            </div>
                        </div>
                    </section>


                </main>
            </div>
            <Footer/>
        </div>
    );
}
