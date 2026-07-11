import Navbar from "../../components/Navbar";
import { Star, TrendingUp, Award, Gift } from "lucide-react";
import NavigationShell from "../../navigation/mainNav";

// household information
const household = {
    id: "HH-202610002",
    name: "Remedios Delo Santos",
    address: "0543, Mabini Street",
    contact: "+63 917 123 4567",
    members: 5,
    email: "remediosdelosantos@gmail.com",
    registeredSince: "January 15, 2026",
    totalDisposals: 48,
    streak:2,
    compliance: "Excellent",
    points: {
        total: 1240,
        thisMonth: 280,
    },
};

// Points summary
const POINTS = {
    total: 1240,
    tier: "Silver",
    maxTierPoints: 1500,
    remaining: 260,
};

// Monthly stats
const MONTHLY = {
    earned: 280,
    redeemed: 200,
    net: 80,
};

// Redeemable items
const REWARDS = [
    { name: "Eco Bag", points: 200, left: 15 },
    { name: "Reusable Water Bottle", points: 350, left: 8 },
    { name: "Plant Seedlings", points: 150, left: 20 },
    { name: "Compost Bin", points: 500, left: 5 },
];

// Derived values
const progressPercent = Math.round(
    (POINTS.total / POINTS.maxTierPoints) * 100
);

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

// recentActivityData
const recentActivityData = [
    {
        type: "Earned points",
        via: "Rule 1. Return of recyclable material",
        amount: "2kg",
        date: "2026-01-24",
        points: 30,
    },
    {
        type: "Redeemed Reward",
        via: "Vitamins/Medicine",
        amount: "1pc",
        date: "2026-01-23",
        points: -500,
    },
    {
        type: "Earned points",
        via: "Rule 2. 10-days Streak",
        date: "2026-01-22",
        points: 30,
    },
    {
        type: "Earned points",
        via: "Rule 1. Return of recyclable material",
        amount: "3kg",
        date: "2026-01-22",
        points: 45,
    },
];


export default function Rewards() {
    return (
        <div className="flex-1">
            <Navbar />

            <div className="flex min-h-screen bg-gray-50">
                <NavigationShell />

                <main className="w-full pb-20 px-4 sm:p-6 space-y-8">
                    {/* Header */}
                    <div>
                        <h1 className="text-2xl font-bold">Rewards & Achievements</h1>
                        <p className="text-gray-500">Redeem your points for eco-friendly items</p>
                    </div>

                    {/* Top Section */}
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                        {/* Reward Points */}
                        <div className="bg-green-600 mt-8 text-white rounded-xl shadow p-6">

                            <div className="flex items-center gap-2 mb-6">
                                <Award size={20} />
                                <h3 className="font-semibold">Reward Points</h3>
                            </div>

                            <div className="flex justify-between">

                                <div>
                                    <h2 className="text-4xl font-bold mb-2">
                                        {household.points.total}
                                    </h2>
                                    <p className="text-green-100 mb-8">
                                        Total Points Earned
                                    </p>

                                </div>
                                {/* Streak */}
                                <div className="bg-green-600 w-fit h-full p-2 rounded-xl border">
                                    <h2 className="text-2xl font-bold mb-2">
                                        {household.streak} days
                                    </h2>
                                    <p className="text-white text-center">
                                        Streak
                                    </p>
                                </div>
                            </div>


                            <div className="flex justify-between text-sm">
                                <span>This Month</span>
                                <span className="font-semibold">
                                    +{household.points.thisMonth} points
                                </span>
                            </div>
                        </div>

                        {/* This Month */}
                        <div className="bg-white rounded-xl p-6 shadow">
                            <div className="flex items-center gap-2 mb-4">
                                <TrendingUp className="text-green-600" />
                                <h3 className="font-semibold">This Month</h3>
                            </div>

                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span>Points Earned</span>
                                    <span className="text-green-600 font-semibold">
                                        +{MONTHLY.earned}
                                    </span>
                                </div>

                                <div className="flex justify-between">
                                    <span>Points Redeemed</span>
                                    <span className="text-red-500 font-semibold">
                                        -{MONTHLY.redeemed}
                                    </span>
                                </div>

                                {/* <div className="flex justify-between border-t pt-3 font-semibold">
                                    <span>Net Gain</span>
                                    <span className="text-green-600">
                                        +{MONTHLY.net}
                                    </span>
                                </div> */}
                            </div>
                        </div>
                    </div>

                    {/* Redeemable Items */}
                    <section className="bg-white rounded-xl p-6 shadow">
                        <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                            <Gift className="text-green-600" />
                            Redeemable Items
                        </h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {REWARDS.map((item) => (
                                <div
                                    key={item.name}
                                    className="bg-gray-50 rounded-xl p-4 flex flex-col"
                                >
                                    <div className="h-24 bg-gray-200 rounded mb-4 flex items-center justify-center">
                                        ICON
                                    </div>

                                    <h3 className="font-semibold">{item.name}</h3>

                                    <div className="flex justify-between text-sm my-2">
                                        <span className="text-green-600 font-semibold">
                                            {item.points} pts
                                        </span>
                                        <span className="text-gray-500">
                                            {item.left} left
                                        </span>
                                    </div>

                                    <button className="mt-auto bg-green-600 text-white rounded-lg py-2 hover:bg-green-700 transition">
                                        Redeem
                                    </button>
                                </div>
                            ))}
                        </div>
                    </section>


                    {/* Penalties & Deductions */}
                    <section className="bg-red-50 border border-red-200 rounded-xl p-6 space-y-4">
                        <div>
                            <h2 className="text-lg font-semibold text-red-700 flex items-center gap-2">
                                Penalties & Deductions
                            </h2>
                            <p className="text-sm text-red-600 mt-1">
                                Based on Republic Act No. 9003 - Ecological Solid Waste Management Act
                            </p>
                        </div>

                        {penaltiesData.records.map((item, index) => (
                            <div
                                key={index}
                                className="bg-white border border-red-200 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                            >
                                <div>
                                    <p className="font-medium">{item.reason}</p>
                                    <p className="text-xs text-gray-500">{item.date}</p>
                                </div>

                                <div className="text-right">
                                    <p className="text-red-600 font-semibold">
                                        {item.points} pts
                                    </p>
                                    <p className="text-xs text-gray-400">{item.law}</p>
                                </div>
                            </div>
                        ))}

                        <div className="bg-white border border-red-300 rounded-lg p-3 text-sm text-red-600">
                            <strong>Note:</strong> {penaltiesData.note}
                        </div>
                    </section>

                    {/* Recent Activity */}
                    <section className="h-[300px] bg-white rounded-xl p-6 shadow flex flex-col">
                        <h2 className="text-lg font-semibold mb-4">
                            Recent Activity
                        </h2>

                        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                            {recentActivityData.map((activity, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between"
                                >
                                    <div>
                                        <p className="font-medium">{activity.type}</p>
                                        <p className="text-xs">{activity.via}
                                            <span className={activity.amount == null ? "hidden" : "inline-flex"}> - {activity.amount}</span></p>
                                        <p className="text-xs text-gray-500">{activity.date}</p>
                                    </div>

                                    <span
                                        className={`font-semibold ${activity.points > 0
                                            ? "text-green-600"
                                            : "text-red-500"
                                            }`}
                                    >
                                        {activity.points > 0
                                            ? `+${activity.points}`
                                            : activity.points}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </section>


                </main>
            </div>
        </div>
    );
}
