import { QrCode, Recycle, Trophy, Leaf, ArrowRight, MailIcon } from "lucide-react";

export default function CTAsection() {
    return (
        <div className="w-ful bg-gradient-to-br from-green-50 to-white">
            <main className="w-full mx-auto">

                <section className="w-full">



                    {/* CTA */}
                    <div className="w-full bg-green-600 text-white">
                        <div className="max-w-full mx-auto px-4 py-20 flex flex-col items-center justify-center">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-5">
                                <Leaf className="text-green-600" size={32} />
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold mb-4">
                                Make a difference!
                            </h2>

                            <h3 className="text-xl md:text-2xl font-bold mb-4">
                                Transform Waste Management in Your Community!
                            </h3>

                            <p className="text-green-100 mb-8 ">
                                Join barangays and communities that are building a cleaner, smarter, and more sustainable future with SmartBin.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">

                                <button className="flex gap-2 cursor-pointer bg-white/20 backdrop-blur text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/30 backdrop-blur">
                                    <MailIcon />
                                    Contact Us
                                </button>

                            </div>
                        </div>
                    </div>
                </section>

            </main>
        </div>
    );
}
