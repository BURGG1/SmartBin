import { useState } from "react";
import { UserPlus, QrCode, Trash2, Gift, Play } from "lucide-react";

import recyc1 from "../resources/recyc1.jpg"

const steps = [
    {
        num: 1,
        icon: <UserPlus className="w-8 h-8 text-green-600" />,
        title: "Register Household",
        desc: "Sign up your household in the SmartBin system through your barangay office.",
    },
    {
        num: 2,
        icon: <QrCode className="w-8 h-8 text-green-600" />,
        title: "Receive QR Code",
        desc: "Get your unique QR code that identifies your household for waste tracking.",
    },
    {
        num: 3,
        icon: <Trash2 className="w-8 h-8 text-green-600" />,
        title: "Dispose Waste Properly",
        desc: "Scan your QR code and segregate waste correctly into the smart bins.",
    },
    {
        num: 4,
        icon: <Gift className="w-8 h-8 text-green-600" />,
        title: "Earn Rewards",
        desc: "Collect points for proper disposal and redeem them for exciting rewards.",
    },
];

const videos = [
    {
        id: 0,
        title: "System Demonstration",
        desc: "Watch how residents interact with SmartBin using QR technology.",
        bg: recyc1,
    },
    {
        id: 1,
        title: "Maintenance & Operations",
        desc: "Learn how barangay personnel manage and maintain the SmartBin system.",
        bg: recyc1,
    },
];

function PlayButton() {
    return (
        <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
                <Play className="w-6 h-6 text-green-600 ml-0.5" fill="currentColor" />
            </div>
        </div>
    );
}

export default function Maintenance() {
    const [activeVideo, setActiveVideo] = useState(null);

    return (

        <>
            {/* HOW IT WORK SECTION---- */}

            <section className="bg-white py-16 sm:py-24">
                <div className="max-w-6xl mx-auto px-4 sm:px-6">
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 text-center mb-12">
                        How SmartBin Works
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {steps.map((step, i) => (
                            <div
                                key={step.num}
                                className="relative flex flex-col items-center text-center bg-white z-50 border border-gray-100 rounded-2xl shadow-sm p-6 pt-10"
                            >
                                {/* Step number bubble */}
                                <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-base shadow">
                                    {step.num}
                                </div>

                                {/* Icon */}
                                <div className="w-14 h-14 bg-green-50 rounded-xl flex items-center justify-center mb-5 mt-1">
                                    {step.icon}
                                </div>

                                <h3 className="font-bold text-gray-900 mb-2 text-base">{step.title}</h3>
                                <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
                            </div>
                        ))}
                    </div>


                </div>
            </section>


            {/*VIDEO SECTION-----  */}

            <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
                <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 text-center mb-12">
                    See SmartBin in Action
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {videos.map((v) => (
                        <div
                            key={v.id}
                            className="rounded-2xl overflow-hidden shadow-md border border-gray-100 bg-white cursor-pointer group"
                            onClick={() => setActiveVideo(activeVideo === v.id ? null : v.id)}
                        >
                            {/* Thumbnail */}
                            <div className="relative h-52 sm:h-64 overflow-hidden">
                                <img
                                    src={v.bg}
                                    alt={v.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                {/* Dark overlay on hover / active */}
                                <div
                                    className={`absolute inset-0 bg-black/30 transition-opacity duration-200 ${activeVideo === v.id ? "opacity-70" : "opacity-0 group-hover:opacity-30"
                                        }`}
                                />
                                <PlayButton />
                                {activeVideo === v.id && (
                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                        <p className="text-white font-medium text-sm px-8 text-center">
                                            Video playback placeholder — connect your video source here.
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Caption */}
                            <div className="p-5">
                                <h3 className="font-bold text-gray-900 mb-1">{v.title}</h3>
                                <p className="text-gray-500 text-sm">{v.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </>
    );
}