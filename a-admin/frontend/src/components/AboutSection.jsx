import {
    QrCode, Recycle, Trophy, Leaf, ArrowRight,
    Target, Globe, Lightbulb, HandshakeIcon, Sparkles, Users
} from "lucide-react";

import recyc1 from "../resources/recyc1.jpg"


const features = [
    { icon: <Target className="w-5 h-5 text-green-600" />, label: "Smart Tracking" },
    { icon: <Globe className="w-5 h-5 text-green-600" />, label: "Eco-Friendly" },
    { icon: <Lightbulb className="w-5 h-5 text-green-600" />, label: "Smart Technology" },
    { icon: <HandshakeIcon className="w-5 h-5 text-green-600" />, label: "Community-Driven" },
];


export default function AboutSection() {
    return (
        <div className="w-full bg-white">
            <main className="w-full mx-auto">

                <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
                    <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">

                        {/* Left: Image */}
                        <div className="relative w-full lg:w-1/2 flex-shrink-0">
                            <div className="rounded-2xl overflow-hidden shadow-xl w-full aspect-[4/3]">
                                <img
                                    src={recyc1}
                                    alt="SmartBin waste management"
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            {/* Floating badge — top right */}
                            <div className="absolute -top-4 -right-4 w-14 h-14 bg-green-500 rounded-2xl flex items-center justify-center shadow-lg">
                                <Leaf className="w-7 h-7 text-white" />
                            </div>

                            {/* Floating badge — bottom left */}
                            <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-xl border border-gray-100">
                                <Sparkles className="w-8 h-8 text-green-500" />
                            </div>
                        </div>

                        {/* Right: Text */}
                        <div className="w-full lg:w-1/2">
                            <span className="inline-flex items-center gap-2 bg-green-100 text-green-700 text-sm font-medium px-3 py-1.5 rounded-full mb-5">
                                <Users className="w-4 h-4" />
                                About Us
                            </span>

                            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-5 leading-tight">
                                About SmartBin
                            </h2>

                            <p className="text-gray-600 leading-relaxed mb-4">
                                SmartBin is an innovative waste management solution designed to promote proper waste
                                segregation and environmental responsibility within communities. By combining QR
                                technology, smart monitoring, and incentive-based rewards, the system encourages
                                residents to participate actively in maintaining a cleaner and greener environment.
                            </p>

                            <p className="text-gray-600 leading-relaxed mb-8">
                                SmartBin helps local governments improve waste collection efficiency, reduce improper
                                disposal, and build sustainable communities for future generations.
                            </p>

                            <div className="grid grid-cols-2 gap-4">
                                {features.map((f) => (
                                    <div key={f.label} className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                            {f.icon}
                                        </div>
                                        <span className="font-semibold text-gray-800 text-sm sm:text-base">{f.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* FEATURES SECTION
                <section className="w-full">
                    <div className="max-w-7xl mx-auto px-4 pt-20">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                            <div className="bg-green-50 rounded-2xl p-8 text-center shadow-sm hover:shadow-md transition">
                                <div className="w-14 h-14 mx-auto mb-4 bg-green-500 rounded-full flex items-center justify-center">
                                    <QrCode className="text-white" size={28} />
                                </div>
                                <h3 className="text-lg font-semibold mb-2">Scan QR Code</h3>
                                <p className="text-gray-600 text-sm">
                                    Each household gets a unique QR code for tracking waste disposal
                                </p>
                            </div>

                            <div className="bg-green-50 rounded-2xl p-8 text-center shadow-sm hover:shadow-md transition">
                                <div className="w-14 h-14 mx-auto mb-4 bg-green-500 rounded-full flex items-center justify-center">
                                    <Recycle className="text-white" size={28} />
                                </div>
                                <h3 className="text-lg font-semibold mb-2">Segregate Waste</h3>
                                <p className="text-gray-600 text-sm">
                                    Properly sort waste into biodegradable, non-biodegradable, and recyclable
                                </p>
                            </div>

                            <div className="bg-green-50 rounded-2xl p-8 text-center shadow-sm hover:shadow-md transition">
                                <div className="w-14 h-14 mx-auto mb-4 bg-green-500 rounded-full flex items-center justify-center">
                                    <Trophy className="text-white" size={28} />
                                </div>
                                <h3 className="text-lg font-semibold mb-2">Rewards</h3>
                                <p className="text-gray-600 text-sm">
                                    Get points for compliance and redeem for eco-friendly items
                                </p>
                            </div>

                        </div>
                    </div>

                </section> */}

            </main>
        </div>
    );
}
