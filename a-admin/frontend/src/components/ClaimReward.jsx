import { X, Asterisk } from "lucide-react";
import { useState } from "react";
import SuccessToast from "../assets/Toast";

export default function ClaimReward({ isOpen, onClose, rName, rPoints  }) {
    const [rfid, setRfid] = useState("");
    const [toast, setToast] = useState(false);

    if (!isOpen) return null;

  

    const handleRegister = () =>{
        onClose();
    }

    return (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-lg overflow-hidden">

                {/* HEADER */}
                <div className="flex justify-between items-center px-6 py-4 border-b">
                    <h2 className="text-lg font-bold">Claim Reward</h2>
                    <button onClick={onClose}>
                        <X className="text-gray-500 hover:text-gray-800" />
                    </button>
                </div>

                {/* BODY */}
                <div className="p-6 flex flex-col gap-4">

                    <div className="flex flex-col items-center">
                        <div className="flex items-center">

                            <h3 className="text-lg font-semibold">{rName}</h3>
                            <Asterisk className="text-red-500 w-3 h-3" />
                        </div>

                        <p className="text-sm text-green-600">
                                {rPoints}
                        </p>

                    </div>

                    {/* RFID INPUT */}
                    <div className="flex items-center">

                        <input
                            type="text"
                            placeholder="Enter the cuipon code"
                            className="w-full px-3 py-2 border rounded-lg"
                        />
                    </div>

                    {/* BUTTONS */}
                    <div className="flex gap-2 mt-4">

                        <button
                            onClick={() => handleRegister()}
                            className="flex-1 bg-green-600 cursor-pointer text-white py-2 rounded-lg"
                        >
                            Claim
                        </button>
                    </div>

                

                </div>
            </div>
        </div>
    );
}