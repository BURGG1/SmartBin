import { X } from "lucide-react";
import { useState } from "react";
import ConfirmationModal from "./confirmationModal";
import SuccessToast from "../assets/Toast";

const PROVISION = {
    id: 4,
    title: "Mixing of segregated waste once it has already been separated",
};

// 🧠 MOCK DATABASE (temporary)
const mockHouseholds = [
    { id: 1, name: "Household A", violations: [] },
    { id: 2, name: "Household B", violations: [1, 2] }, // already 2 violations
];

export default function ViolationModal({ isOpen, onClose, householdId = 2 }) {
    const [active, setActive] = useState(false);
    const [showToast, setShowToast] = useState(false);

    // 🧠 simulate DB lookup
    const [households, setHouseholds] = useState(mockHouseholds);

    const household = households.find(h => h.id === householdId);

    if (!isOpen || !household) return null;

    // ✅ AUTO OFFENSE COUNT
    const offenseCount = household.violations.length + 1;

    // ✅ PENALTY LOGIC (clean)
    const getPenalty = (offense) => {
        if (offense === 1) {
            return {
                type: "Point Deduction",
                points: 500,
                fine: 0,
                service: ""
            };
        }

        if (offense === 2) {
            return {
                type: "Fine",
                points: 0,
                fine: 300,
                service: ""
            };
        }

        return {
            type: "Fine + Community Service",
            points: 0,
            fine: 800,
            service: "15 Days Community Service"
        };
    };

    const penalty = getPenalty(offenseCount);

    // ✅ APPLY PENALTY (updates mock DB)
    const handleConfirm = () => {
        const updated = households.map(h => {
            if (h.id === household.id) {
                return {
                    ...h,
                    violations: [...h.violations, PROVISION.id]
                };
            }
            return h;
        });

        setHouseholds(updated);
        setActive(false);
        setShowToast(true);
        onClose();

        console.log("Updated Household:", updated);
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-lg flex flex-col overflow-hidden">

                {/* HEADER */}
                <div className="flex justify-between items-center px-6 py-4 border-b">
                    <h2 className="text-xl font-bold">
                        {household.name}
                    </h2>
                    <button onClick={onClose}>
                        <X className="cursor-pointer text-gray-500 hover:text-gray-800" />
                    </button>
                </div>

                {/* BODY */}
                <div className="overflow-y-auto px-6 py-6 flex flex-col gap-6">

                    {/* Violation */}
                    <div className="bg-gray-50 p-4 rounded-lg border">
                        <h3 className="font-semibold mb-2">Violation</h3>
                        <p className="text-gray-600">{PROVISION.title}</p>
                    </div>

                    {/* AUTO OFFENSE DISPLAY */}
                    <div className="bg-blue-50 p-4 rounded-lg border">
                        <p className="font-semibold">
                            Offense Level: {offenseCount}
                        </p>
                        <p className="text-sm text-gray-600">
                            (Automatically calculated from previous violations)
                        </p>
                    </div>

                    {/* PENALTY */}
                    <div className="bg-red-100 p-4 rounded-lg border border-red-200">
                        <h3 className="font-semibold text-red-700 mb-3">
                            Penalty Details
                        </h3>

                        <div className="flex flex-col gap-2 text-sm">
                            <p><strong>Type:</strong> {penalty.type}</p>

                            {penalty.points > 0 && (
                                <p><strong>Points:</strong> -{penalty.points}</p>
                            )}

                            {penalty.fine > 0 && (
                                <p><strong>Fine:</strong> ₱{penalty.fine}</p>
                            )}

                            {penalty.service && (
                                <p><strong>Community Service:</strong> {penalty.service}</p>
                            )}
                        </div>
                    </div>

                    {/* BUTTON */}
                    <button
                        onClick={() => setActive(true)}
                        className="bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition"
                    >
                        Assign Penalty
                    </button>

                </div>

                <ConfirmationModal
                    isOpen={active}
                    onClose={() => setActive(false)}
                    onConfirm={handleConfirm}
                />

                <SuccessToast
                    show={showToast}
                    onClose={() => setShowToast(false)}
                    message="Penalty successfully assigned!"
                />

            </div>
        </div>
    );
}