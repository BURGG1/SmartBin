import { Recycle, LogOut, Bell } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ConfirmationModal from "./confirmationModal";

export default function Navbar() {
  const [OpenConModal, setOpenConModal] = useState(false);
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate("/");
  };

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("role");
    sessionStorage.removeItem("user");
    navigate("/");
};

  return (
    <header className="w-full bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-full px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-green-500 rounded-lg flex items-center justify-center">
            <Recycle className="text-white" size={20} />
          </div>
          <span className="font-bold text-lg text-black">SmartBin</span>
        </div>

        <div className="flex gap-10">
          <div>
            {/* <Bell className="text-black cursor" size={20} /> */}
          </div>
          <button
            onClick={() => setOpenConModal(true)}
            className="flex items-center gap-1 text-red-500 cursor-pointer font-medium"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </div>
      <ConfirmationModal
        isOpen={OpenConModal}
        onClose={()=> {
          setOpenConModal(false)}
        }
        onConfirm={handleLogout}
      />
    </header>

  );
}
