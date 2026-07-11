
import {
    CheckCircle,
    Award,
    Home,
    Star,
    Gift,
    BookCheck,
    Gavel,
    ClipboardCheck,
    MapPin,
    Phone,
    Users,
    Search,
    Calendar,
    ExternalLink,
    TrendingUp,
    BookOpen,
    Leaf,
    ShieldCheck,
    Scale,
    Recycle,
    Building2,

} from "lucide-react";

import { useState } from "react";

import Navbar from "../../components/Navbar";
import NavigationShell from "../../navigation/mainNav";


// household information
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
        label: "Total Disposals",
        value: `${household.totalDisposals} times`,
        icon: TrendingUp,
    },
];

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




import pandisplay from "../../resources/pandisplay.jpg"
import plasticBrick from "../../resources/plastic-brick.jpg"
import recyc1 from "../../resources/recyc1.jpg"
import tenStreak from "../../resources/tenStreak.png"
import oneMonth from "../../resources/oneMonth.jpg"
import RulesModal from "../../components/RulesModal";

const RULES = [
    {
        image: recyc1,
        id: 1,
        name: "Recyclable Materials",
        decs: "Earn points by recycling normal materials such as plastic, paper, glass, and metal",
        points: 15,
        freq: "per kilo"
    },
    {
        image: tenStreak,
        id: 2,
        name: "10-Day Consistency Streak",
        decs: "Maintain proper bin usage without any violation for 10 consecutive days",
        points: 30,
        freq: "per streak"
    },
    {
        image: plasticBrick,
        id: 3,
        name: "Plastic Bottle Bricks",
        decs: "Create eco-bricks by filling plastic bottles with non-recyclable plastic waste to be used for construction",
        points: 50,
        freq: "per brick"
    },
    {
        image: oneMonth,
        id: 4,
        name: "1 month Consistency Streak",
        decs: "Maintain proper bin usage without any violation for 1 month",
        points: 100,
        freq: "per streak"
    },
    {
        image: pandisplay,
        id: 5,
        name: "Recycled Items or Accessories",
        decs: "Already recycled items transformed into display pieces or accessories. Points vary based on design creativity and quality",
        points: "50-200",
        freq: "per item"
    },
];
export default function HomePage() {

    const [search, setSearch] = useState("")


    return (

        <div className="flex-1">
            <Navbar />
            <div className="flex min-h-screen bg-gray-50">
                <NavigationShell />

                <main className="w-full flex flex-col gap-4 pb-20 px-4 sm:p-6">
                    {/* Page Header */}
                    <div>
                        <h1 className="text-2xl font-bold">Home</h1>
                        <p className="text-gray-500 mb-6">
                            Keep up the great work with waste segregation
                        </p>

                    </div>

                    <section>


                        {/* Reward Points */}
                        <div className="flex flex-col gap-5 bg-green-600 mt-8 text-white rounded-xl shadow p-6">

                            <div className="border-b">
                                <h2>Welcome back,</h2>
                                <h1 className="text-4xl font-bold mb-2">
                                    {household.name}!
                                </h1>

                            </div>

                            <div className="flex flex-col">
                                <div className="flex items-center mb-2">
                                    <Award size={20} />
                                    <h3 className="font-semibold">Total Points Earned</h3>
                                </div>
                                <div>
                                    <h2 className="text-4xl font-bold mb-5">
                                        {household.points.total}
                                    </h2>
                                </div>

                                <div className="flex justify-between text-sm">
                                    <span>This Month</span>
                                    <span className="font-semibold">
                                        +{household.points.thisMonth} points
                                    </span>
                                </div>
                            </div>

                        </div>
                    </section>

                    <section className="bg-white rounded-xl p-6 shadow max-h-[600px] flex flex-col lg:max-h-[800px]">

                        {/* HEADER */}
                        <div className="flex flex-col lg:flex-row justify-between py-4 shrink-0">
                            <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                                <ClipboardCheck className="text-green-600" />
                                How to Earn Points
                            </h2>

                            <div className="relative w-full sm:w-64">
                                <Search
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                    size={18}
                                />
                                <input
                                    type="text"
                                    placeholder="Search reward"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-10 pr-4 py-2 border rounded-lg w-full focus:ring-2 focus:ring-green-500"
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto pr-2">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {RULES.map((r) => (
                                    <div
                                        key={r.id}
                                        className="relative bg-gray-50 rounded-xl flex flex-col shadow-lg"
                                    >
                                        <div className="overflow-hidden">
                                            <img
                                                src={r.image}
                                                alt={r.name}
                                                className="w-full h-80 object-cover rounded-t-xl"
                                            />
                                        </div>

                                        <div className="flex flex-col p-4 gap-2">
                                            <div className="flex justify-between items-center">
                                                <h1 className="text-lg font-bold">
                                                    <span>Rule {r.id}</span> - {r.name}
                                                </h1>
                                                <p className="text-sm text-gray-400 font-semibold px-3 py-1 rounded-full">
                                                    -{r.freq}
                                                </p>
                                            </div>

                                            <p className="text-gray-500">{r.decs}</p>
                                        </div>

                                        <div className="bg-white absolute top-2 right-2 rounded-lg p-2 shadow-md">
                                            <h2 className="flex flex-col text-center text-green-500 font-bold text-xl">
                                                +{r.points}
                                                <span className="text-gray-500 text-sm font-semibold">
                                                    points
                                                </span>
                                            </h2>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </section>

                    <section className="bg-white rounded-xl p-6 shadow">

                        {/* HEADER */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

                            <div className="flex items-start gap-4">
                                <div className="bg-green-100 text-green-600 p-3 rounded-xl">
                                    <BookOpen size={22} />
                                </div>

                                <div>
                                    <h2 className="text-xl font-bold text-gray-800">
                                        Republic Act No. 9003
                                    </h2>
                                    <p className="text-green-700 text-sm">
                                        Ecological Solid Waste Management Act of 2000
                                    </p>
                                </div>
                            </div>

                            <span className="flex gap-1 items-center bg-green-100 text-green-700 text-xs font-medium px-3 py-1 rounded-full self-start sm:self-auto">
                                <Scale className="text-green-600" size={12} />
                                Philippine Law
                            </span>
                        </div>

                        {/* DESCRIPTION */}
                        <div className="bg-green-100/60 border border-green-200 text-justify rounded-xl p-4 mt-6 text-sm text-gray-700 leading-relaxed">
                            The Ecological Solid Waste Management Act of 2000, officially known as Republic Act No. 9003,
                            is a Philippine environmental law enacted to establish a comprehensive and sustainable system
                            for managing solid waste nationwide. <span className="font-semibold"> It promotes waste reduction, mandatory segregation at source,
                                recycling, composting, and the closure of open dumpsites,while requiring local government units
                            to take primary responsibility for implementation under the supervision of the Department of Environment
                            and Natural Resources.</span>  The law aims to protect public health and the environment by shifting the country
                            from improper
                            disposal practices to an ecological and community-based waste management approach.
                        </div>

                        {/* KEY PROVISIONS */}
                        <div className="mt-8">
                            <h3 className="text-sm font-semibold tracking-wide text-gray-500 mb-4">
                                KEY PROVISIONS
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                                {/* Card 1 */}
                                <div className="bg-white p-4 rounded-xl border border-green-400 shadow-sm">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div>
                                            <Recycle className="text-green-600" size={18} />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-800">Mandatory Segregation</h4>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-600">
                                        Households and establishments are required to segregate waste at the source
                                        into biodegradable, non-biodegradable, and special waste categories.
                                    </p>
                                </div>

                                {/* Card 2 */}
                                <div className="bg-white p-4 rounded-xl border border-green-400 shadow-sm">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div>
                                            <Leaf className="text-green-600" size={18} />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-800">Composting & Recovery</h4>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-600">
                                        Local Government Units (LGUs) must establish MRFs (Material Recovery
                                        Facilities) and composting centers to divert waste from landfills.
                                    </p>
                                </div>

                                {/* Card 3 */}
                                <div className="bg-white p-4 rounded-xl border border-green-400 shadow-sm">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div>
                                            <ShieldCheck className="text-green-600" size={18} />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-800">Prohibited Acts & Penalties</h4>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-600">
                                        Littering, open burning, and improper disposal of solid waste are
                                        prohibited and subject to fines or imprisonment.
                                    </p>
                                </div>

                                {/* Card 4 */}
                                <div className="bg-white p-4 rounded-xl border border-green-400 shadow-sm">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div>
                                            <Building2 className="text-green-600" size={18} />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-800">Barangay Responsibility</h4>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-600">
                                        Barangays must implement waste ordinances and ensure compliance at
                                        the household level within their jurisdiction.
                                    </p>
                                </div>

                                {/* Card 5 */}
                                <div className="bg-white p-4 rounded-xl border border-green-400 shadow-sm">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div>
                                            <Scale className="text-green-600" size={18} />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-800">The National Solid Waste Management Commission</h4>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-600">
                                        RA 9003 created the National Solid Waste Management Commission
                                        to oversee policy, standards, and nationwide implementation.
                                    </p>
                                </div>

                                {/* Card 6 */}
                                <div className="bg-white p-4 rounded-xl border border-green-400  shadow-sm">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div>
                                            <TrendingUp className="text-green-600" size={18} />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-800">Waste Diversion Goals</h4>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-600">
                                        LGUs must achieve progressive waste diversion targets to reduce
                                        dependency on sanitary landfills.
                                    </p>
                                </div>

                            </div>
                        </div>

                        {/* FULL PAGE */}
                        <div className="flex flex-col sm:flex-row sm:justify-between mt-6 text-gray-500 gap-2">
                            <span>Source: Official Gazette of the Republic of the Philippines</span>
                            <a
                                href="https://www.officialgazette.gov.ph/2001/01/26/republic-act-no-9003/"
                                target="_blank"
                                className="flex items-center text-green-600 hover:underline font-medium"
                            >
                                See full text of RA 9003
                                <ExternalLink size={18} />
                            </a>
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
