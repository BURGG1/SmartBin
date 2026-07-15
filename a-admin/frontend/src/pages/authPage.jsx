import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, Mail, Lock, Eye, EyeOff } from "lucide-react";
import BASE_URL from "../config";
import ForgotPasswordModal from "../components/ForgotPasswordModal";

export default function AuthPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleLogin = async () => {
    if (!form.email || !form.password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email.trim().toLowerCase(),
          password: form.password,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || "Invalid credentials.");
        return;
      }

      if (data.role !== "admin") {
        setError("Access denied. This portal is for admins only.");
        return;
      }

      // Store token
      sessionStorage.setItem("token", data.token);
      sessionStorage.setItem("user", JSON.stringify(data.user));
      sessionStorage.setItem("role", data.role);

      if (data.role === "admin") {
        sessionStorage.setItem("token", data.token);
        sessionStorage.setItem("user", JSON.stringify(data.user));
        sessionStorage.setItem("role", data.role);
        navigate("/dashboard");
      } else if (data.role === "collector") {
        sessionStorage.setItem("token", data.token);
        sessionStorage.setItem("user", JSON.stringify(data.user));
        sessionStorage.setItem("role", data.role);
        navigate("/collector");
      } else if (data.role === "household") {
        sessionStorage.setItem("token", data.token);
        sessionStorage.setItem("user", JSON.stringify(data.user));
        sessionStorage.setItem("role", data.role);
        navigate("/home");
      } else {
        setError("Access denied.");
      }
    } catch (err) {
      setError("Cannot connect to server. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !loading) {
      handleLogin();
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md text-center space-y-6">

        {/* LOGO */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center">
            <Trash2 className="text-white" size={32} />
          </div>
          <h1 className="text-xl font-semibold">
            Smart bin Waste Management with Segregation and Gamified System
          </h1>
          <p className="text-gray-500 text-sm">
            Manage waste collection efficiently
          </p>
        </div>

        {/* CARD */}
        <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6">

          <h2 className="text-lg font-medium">Welcome Back!</h2>

          {/* Email */}
          <div className="space-y-1">
            <label className="block text-start text-bold text-sm mb-1">Email</label>
            <div className="flex items-center gap-2 rounded-lg px-3 py-2 bg-gray-50">
              <span><Mail size={18} /></span>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                placeholder="Enter your email"
                className="w-full bg-transparent outline-none pl-4"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="relative">
            <label className="block text-sm text-start mb-1">Password</label>
            <div className="flex items-center gap-2 rounded-lg px-3 py-2 bg-gray-50">
              <span><Lock size={18} /></span>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                placeholder="Enter your password"
                className="w-full bg-transparent outline-none pl-4"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="text-gray-500 hover:text-gray-700 cursor-pointer"
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <p className="text-red-500 text-sm text-left">{error}</p>
          )}

          <button
            onClick={handleLogin}
            disabled={loading}
            type="button"
            className="w-full cursor-pointer bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-lg transition disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <p className="text-sm text-gray-500">
            Forgot your password?{" "}
            <span
              onClick={() => setIsForgotPasswordOpen(true)}
              className="text-green-600 font-medium cursor-pointer hover:underline"
            >
              Reset here
            </span>
          </p>

        </div>
      </div>

      <ForgotPasswordModal
        isOpen={isForgotPasswordOpen}
        onClose={() => setIsForgotPasswordOpen(false)}
      />
    </div>
  );
}