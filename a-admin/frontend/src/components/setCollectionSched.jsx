import { useState } from "react";


export default function SetSched({ isOpen, onClose, onConfirm }) {

    const [personel, setPersonel] = useState("");
    const [sched, setSched] = useState("");

    const handleSchedData = () => {
        if (!personel || !sched) return;

        onConfirm({
            personel,
            date: sched
        });

        onClose();
    }

    if (!isOpen) return null;

    return (
        <>
            <div
                className="fixed inset-0 z-40"
                onClick={onClose}
            />

            <div className="absolute top-full flex flex-col left-0 mt-2 w-80 bg-white border shadow-lg rounded-xl p-4 z-100">

                <h4 className="font-semibold mb-3 text-sm">
                    Schedule Collection
                </h4>

                <select
                    value={personel}
                    onChange={(e) => setPersonel(e.target.value)}
                    className="w-full border rounded-md px-3 py-2 text-sm mb-3"
                >
                    <option value="">Collection Personnel</option>
                    <option value="Jeffry Agustin">Jeffry Agustin</option>
                    <option value="Queenie Legaspi">Queenie Legaspi</option>
                    <option value="Masaki Saito">Masaki Saito</option>
                </select>

                <input
                    value={sched}
                    onChange={(e) => setSched(e.target.value)}
                    type="date"
                    className="w-full border rounded-md px-3 py-2 text-sm mb-3"
                />

                <button
                    className="w-full cursor-pointer bg-green-600 text-white py-2 rounded-md text-sm"
                    onClick={handleSchedData}
                >
                    Confirm
                </button>
            </div>
        </>
    );
}