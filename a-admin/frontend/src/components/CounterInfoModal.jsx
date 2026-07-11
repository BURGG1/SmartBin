import { X, Calendar } from "lucide-react";
import { useState, useEffect } from "react";
import ViolationModal from "./ViolationModal";
import Pagination from "./Pagination";

const API = "http://localhost:5000/api";
const LOGS_LIMIT = 7;

export default function CounterInfoModal({ isOpen, onClose, bin }) {

    const [openModal, setOpenModal]   = useState(false);
    const [activeHH, setActiveHH]     = useState(null);
    const [fromDate, setFromDate]     = useState("");
    const [disposalLogs, setDisposalLogs] = useState([]);
    const [loading, setLoading]       = useState(false);
    const [error, setError]           = useState("");
    const [page, setPage]             = useState(1);

    useEffect(() => {
        if (!isOpen || !bin?.id) return;

        const fetchLogs = async () => {
            setLoading(true);
            setError("");
            try {
                const res  = await fetch(`${API}/rfid/logs?binId=${bin.id}&action=dispose`);
                const data = await res.json();
                if (data.success) {
                    setDisposalLogs(data.data);
                } else {
                    setError("Failed to load logs.");
                }
            } catch (err) {
                setError("Network error. Could not load logs.");
            } finally {
                setLoading(false);
            }
        };

        fetchLogs();
        setPage(1);
        setFromDate("");
    }, [isOpen, bin?.id]);

    useEffect(() => {
        setPage(1);
    }, [fromDate]);

    if (!isOpen || !bin) return null;

    const filteredLogs = disposalLogs.filter((log) => {
        if (!fromDate) return true;
        const logDate = new Date(log.scannedAt).toISOString().split("T")[0];
        return logDate === fromDate;
    });

    const paginatedLogs = filteredLogs.slice(
        (page - 1) * LOGS_LIMIT,
        page * LOGS_LIMIT
    );
    const emptyRows = Math.max(0, LOGS_LIMIT - paginatedLogs.length);

    return (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
            <div className="bg-white max-h-[90vh] w-full max-w-5xl rounded-2xl shadow-lg flex flex-col overflow-y-auto">

                {/* HEADER */}
                <div className="flex justify-between items-center px-6 py-1 border-b">
                    <h2 className="text-md text-gray-600 font-semi-bold">Counter Information</h2>
                    <button onClick={onClose}>
                        <X className="text-gray-500 cursor-pointer hover:text-gray-800" />
                    </button>
                </div>

                {/* Filter */}
                <div className="w-full flex flex-col justify-between items-center sm:flex-row px-4 py-2 border-b">
                    <div className="flex-1">
                        <h2 className="text-md font-bold md:text-lg">
                            {bin.id} - <span>{bin.type}</span>
                        </h2>
                    </div>
                    <div className="flex items-center gap-2 w-auto">
                        <Calendar className="w-4 h-4 md:w-5 md:h-5" />
                        <p>Date Collected:</p>
                        <input
                            type="date"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                            className="border rounded-lg px-3 py-2 text-sm w-50"
                        />
                    </div>
                </div>

                {/* TABLE */}
                <div className="overflow-x-auto">
                    {loading ? (
                        <p className="text-center py-6 text-gray-400">Loading logs...</p>
                    ) : error ? (
                        <p className="text-center py-6 text-red-500">{error}</p>
                    ) : (
                        <table className="w-full text-sm">
                            <thead className="bg-gray-100 sticky top-0">
                                <tr>
                                    <th className="py-3">Date & Time</th>
                                    <th>Household ID</th>
                                    <th>Disposal Order</th>
                                    <th>Resident</th>
                                    <th>Contact No.</th>
                                    <th>Email</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody className="text-center">
                                {paginatedLogs.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="text-center py-6 text-gray-500">
                                            No records found for selected dates
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedLogs.map((log) => {
                                        const scannedAt = new Date(log.scannedAt);
                                        const date      = scannedAt.toISOString().split("T")[0];
                                        const time      = scannedAt.toLocaleTimeString("en-US", {
                                            hour: "2-digit", minute: "2-digit", second: "2-digit",
                                        });
                                        const hh = log.household;
                                        const householdId = hh?._id
                                            ? `HH-${hh._id.slice(-8).toUpperCase()}`
                                            : "—";
                                        const contact = hh?.contactNumber
                                            ? `+63-${hh.contactNumber}`
                                            : "—";

                                        return (
                                            <tr key={log._id}>
                                                <td>
                                                    <p>{date}</p>
                                                    <p className="text-xs text-gray-500">{time}</p>
                                                </td>
                                                <td>{householdId}</td>
                                                <td className="px-6 py-3 font-medium">
                                                    #{log.disposalOrder ?? "—"}
                                                </td>
                                                <td>{hh?.fullname ?? "—"}</td>
                                                <td>{contact}</td>
                                                <td>{hh?.email ?? "—"}</td>
                                                <td>
                                                    <button
                                                        onClick={() => {
                                                            setActiveHH(log);
                                                            setOpenModal(true);
                                                        }}
                                                        className="bg-red-600 text-white px-2 py-1 rounded-lg cursor-pointer"
                                                    >
                                                        Penalize
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                                {/* Pad remaining slots so table height stays constant at LOGS_LIMIT rows */}
                                {paginatedLogs.length > 0 &&
                                    Array.from({ length: emptyRows }).map((_, i) => (
                                        <tr key={`counter-empty-${i}`} aria-hidden="true">
                                            <td className="py-3" colSpan="7">&nbsp;</td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {!loading && !error && (
                    <div className="px-6 pb-2">
                        <Pagination
                            currentPage={page}
                            totalItems={filteredLogs.length}
                            itemsPerPage={LOGS_LIMIT}
                            onPageChange={setPage}
                        />
                    </div>
                )}
            </div>

            <ViolationModal
                isOpen={openModal}
                onClose={() => setOpenModal(false)}
                household={activeHH}
            />
        </div>
    );
}