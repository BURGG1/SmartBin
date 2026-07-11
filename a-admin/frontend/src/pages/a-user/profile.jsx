
import {
    CheckCircle,
    Award,
    Home,
    MapPin,
    Phone,
    Users,
    Calendar,
    Mail,
    TrendingUp,
} from "lucide-react";

import Navbar from "../../components/Navbar";
import NavigationShell from "../../navigation/mainNav";
import EditHousehold from "../../components/EditHouseholdModal";
import { useState } from "react";


// household information
const household = {
    id: "HH-202610001",
    name: "Joel Dela Cruz",
    address: "0543, Rizal Street",
    contact: "+63 917 123 4567",
    members: 5,
    email: "joelpogidelacruz@gmail.com",
    registeredSince: "January 15, 2026",
    totalDisposals: 48,
    compliance: "Excellent",
    points: {
        total: 1240,
        thisMonth: 280,
    },
};

// waste stats
const wasteStats = [
    {
        type: "Biodegradable",
        count: 28,
        points: 560,
        percent: 58,
        color: "green",
    },
    {
        type: "Non-biodegradable",
        count: 12,
        points: 240,
        percent: 25,
        color: "orange",
    },
    {
        type: "Recyclable",
        count: 8,
        points: 440,
        percent: 17,
        color: "blue",
    },
];

// for household information to
const infoItems = [
    {
        label: "Household Name",
        value: household.name,
        icon: Home,
    },
    {
        label: "Address",
        value: household.address,
        icon: MapPin,
    },
    {
        label: "Contact Number",
        value: household.contact,
        icon: Phone,
    },
    {
        label: "Members",
        value: `${household.members} people`,
        icon: Users,
    },
    {
        label: "Registered Since",
        value: household.registeredSince,
        icon: Calendar,
    },
    {
        label: "Email",
        value: `${household.email}`,
        icon: Mail,
    },
];


export default function HouseholdProfile() {
    const [operEditModal, setEditModal] = useState(false);


    return (

        <div className="flex-1">
            <Navbar />
            <div className="flex min-h-screen bg-gray-50">
                <NavigationShell />

                <main className="w-full pb-20 px-4 sm:p-6">
                    {/* Page Header */}
                    <h1 className="text-2xl font-bold">Household Profile</h1>
                    <p className="text-gray-500 mb-6">
                        View and manage your household information
                    </p>

                    {/* Household Information */}
                    <div className="mt-8 bg-white rounded-xl shadow p-6">
                        <h2 className="text-lg font-semibold mb-6">
                            Household Information
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {infoItems.map((item) => (
                                <div
                                    key={item.label}
                                    className="flex items-start gap-4"
                                >
                                    <div className="p-3 bg-green-100 rounded-lg text-green-600">
                                        <item.icon size={20} />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">
                                            {item.label}
                                        </p>
                                        <p className="font-semibold">{item.value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="w-full flex items-center justify-center mt-4">

                        <button
                            onClick={() => setEditModal(true)}
                            className="text-gray-400 cursor-pointer hover:underline" >
                            Update information
                        </button>

                    </div>

                    <EditHousehold
                        isOpen={operEditModal}
                        onClose={() => setEditModal(false)}
                    />
                    {/* Waste Segregation Statistics */}
                    {/* <div className="mt-8 bg-white rounded-xl shadow p-6">
                        <h2 className="text-lg font-semibold mb-6">
                            Waste Segregation Statistics
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {wasteStats.map((stat) => (
                                <div
                                    key={stat.type}
                                    className="bg-gray-50 rounded-xl p-5"
                                >
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="font-semibold">{stat.type}</h3>
                                        <span
                                            className={`text-2xl font-bold text-${stat.color}-500`}
                                        >
                                            {stat.count}
                                        </span>
                                    </div>

                                    <p className="text-sm text-gray-500 mb-2">
                                        Points Earned
                                    </p>
                                    <p
                                        className={`font-semibold text-${stat.color}-500 mb-3`}
                                    >
                                        +{stat.points}
                                    </p>

                                    <div className="w-full bg-gray-200 h-2 rounded-full">
                                        <div
                                            className={`h-2 rounded-full bg-${stat.color}-500`}
                                            style={{ width: `${stat.percent}%` }}
                                        />
                                    </div>

                                    <p className="text-xs text-gray-500 mt-2">
                                        {stat.percent}% of total disposals
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div> */}
                </main>
            </div>
        </div>
    );
}
