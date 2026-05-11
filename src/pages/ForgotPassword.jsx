

import { useState } from "react";
import { authApi } from "../services/api";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [form, setForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);

  const sendOtp = async () => {
    if (!email) {
      alert("Email required");
      return;
    }

    try {
      setLoading(true);

      await authApi.forgotPassword({
        email: email.toLowerCase().trim(),
      });

      alert("OTP sent successfully");
      setStep(2);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!otp) {
      alert("OTP required");
      return;
    }

    try {
      setLoading(true);

      await authApi.verifyOtp({
        email: email.toLowerCase().trim(),
        otp,
      });

      alert("OTP verified");
      setStep(3);
    } catch (err) {
      alert(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async () => {
    if (!form.newPassword || !form.confirmPassword) {
      alert("Fill all fields");
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      await authApi.resetPassword({
        email: email.toLowerCase().trim(),
        newPassword: form.newPassword,
        confirmPassword: form.confirmPassword,
      });

      alert("Password updated successfully");
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-gradient-to-r from-[#1c1c1c] via-[#2a2a2a] to-[#3a2b2b]">
      <motion.div
        initial={{ scale: 0.94, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md bg-[#2b2b2b]/95 rounded-[26px] border border-[#ff7f50]/30 px-8 py-8 shadow-2xl"
      >
        <h2 className="text-3xl text-center font-semibold text-[#ff7f50] mb-8">
          Forgot Password
        </h2>

        {step === 1 && (
          <div className="space-y-4">
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address"
              className="w-full p-4 rounded-2xl bg-white text-black"
            />

            <button
              onClick={sendOtp}
              disabled={loading}
              className="w-full bg-[#ff7f50] text-white py-4 rounded-2xl font-bold"
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <input
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter OTP"
              className="w-full p-4 rounded-2xl bg-white text-black"
            />

            <button
              onClick={verifyOtp}
              disabled={loading}
              className="w-full bg-[#ff7f50] text-white py-4 rounded-2xl font-bold"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                value={form.newPassword}
                onChange={(e) =>
                  setForm({
                    ...form,
                    newPassword: e.target.value,
                  })
                }
                placeholder="New Password"
                className="w-full p-4 pr-12 rounded-2xl bg-white text-black"
              />

              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#ff7f50]"
              >
                {showNewPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>

            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={form.confirmPassword}
                onChange={(e) =>
                  setForm({
                    ...form,
                    confirmPassword: e.target.value,
                  })
                }
                placeholder="Confirm Password"
                className="w-full p-4 pr-12 rounded-2xl bg-white text-black"
              />

              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword(!showConfirmPassword)
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#ff7f50]"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>

            <button
              onClick={resetPassword}
              disabled={loading}
              className="w-full bg-[#ff7f50] text-white py-4 rounded-2xl font-bold"
            >
              {loading ? "Updating..." : "Reset Password"}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}