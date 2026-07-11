import { useEffect } from "react";

export default function SuccessToast({ show, onClose, message }) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 2500); // disappears after 2.5 seconds

      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div className="fixed top-5 right-5 z-[100]">
      <div className="bg-green-400 text-white px-6 py-3 rounded-xl shadow-lg animate-slide-in">
        {message}
      </div>
    </div>
  );
}