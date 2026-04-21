import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import apiClient from "../services/apiClient";
import { cn } from "../lib/utils";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await apiClient.post('/api/users/admin', {
        email,
        password,
      });

      if (response.data.success) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("isAdmin", "true");
        toast.success("Welcome back, Admin!");
        navigate("/dashboard");
      } else {
        toast.error(response.data.message || "Login failed");
      }
    } catch (error) {
      console.error("Error logging in:", error);
      toast.error(error.response?.data?.message || "Invalid admin credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF8F4] px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl border border-[#E6D5C3] shadow-lg p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-[#1C1B1A] mb-1">Admin Login</h2>
            <p className="text-sm text-[#5A5856]">Sign in to your admin account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-[#1C1B1A] mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className={cn(
                    "h-4.5 w-4.5 transition-colors duration-200",
                    focusedField === "email" ? "text-[#2E3192]" : "text-[#9CA3AF]"
                  )} />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="admin@example.com"
                  className={cn(
                    "w-full pl-11 pr-4 py-3.5 bg-[#FAF8F4] border rounded-xl text-[#1C1B1A] placeholder-[#9CA3AF] text-sm transition-all duration-200 outline-none",
                    focusedField === "email"
                      ? "border-[#D4755B] ring-3 ring-[#D4755B]/15"
                      : "border-[#E6D5C3] hover:border-[#D4755B]/50"
                  )}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-[#1C1B1A] mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className={cn(
                    "h-4.5 w-4.5 transition-colors duration-200",
                    focusedField === "password" ? "text-[#2E3192]" : "text-[#9CA3AF]"
                  )} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Enter your password"
                  className={cn(
                    "w-full pl-11 pr-12 py-3.5 bg-[#FAF8F4] border rounded-xl text-[#1C1B1A] placeholder-[#9CA3AF] text-sm transition-all duration-200 outline-none",
                    focusedField === "password"
                      ? "border-[#D4755B] ring-3 ring-[#D4755B]/15"
                      : "border-[#E6D5C3] hover:border-[#D4755B]/50"
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#9CA3AF] hover:text-[#2E3192] transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                </button>
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.01 }}
              whileTap={{ scale: loading ? 1 : 0.99 }}
              className="w-full flex items-center justify-center gap-2.5 bg-[#2E3192] hover:bg-[#1E2163] text-white py-3.5 px-6 rounded-xl font-semibold text-sm transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4.5 h-4.5 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4.5 h-4.5" />
                </>
              )}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
