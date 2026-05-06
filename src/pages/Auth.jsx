import { useState, useEffect } from "react";
import { authApi } from "../services/api";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, Search } from "lucide-react";
 
export default function Auth() {
  const OWNER_ID_BY_EMAIL_KEY = "ownerIdByEmail";
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();
 
  const [formData, setFormData] = useState({
    fullName: "",
    mobileNumber: "",
    email: "",
    password: "",
    role: "", // default empty for Select Role
  });
 
  useEffect(() => {
    const userChannel = new BroadcastChannel("user-auth");
    const adminChannel = new BroadcastChannel("admin-auth");
    const ownerChannel = new BroadcastChannel("owner-auth");
 
    adminChannel.onmessage = (msg) => {
      if (msg.data === "logout") {
        localStorage.removeItem("adminToken");
        navigate("/login");
      }
    };
 
    userChannel.onmessage = (msg) => {
      if (msg.data === "logout") {
        localStorage.removeItem("userToken");
        navigate("/login");
      }
    };
 
    ownerChannel.onmessage = (msg) => {
      if (msg.data === "logout") {
        localStorage.removeItem("ownerToken");
        localStorage.removeItem("ownerId");
        navigate("/login");
      }
    };
 
    const syncLogout = (event) => {
      if (event.key === "adminLogout") {
        localStorage.removeItem("adminToken");
        navigate("/login");
      }
 
      if (event.key === "ownerLogout") {
        localStorage.removeItem("ownerToken");
        localStorage.removeItem("ownerId");
        navigate("/login");
      }
 
      if (event.key === "userLogout") {
        localStorage.removeItem("userToken");
        navigate("/login");
      }
    };
 
    window.addEventListener("storage", syncLogout);
 
    return () => {
      window.removeEventListener("storage", syncLogout);
      userChannel.close();
      adminChannel.close();
      ownerChannel.close();
    };
  }, [navigate]);
 
  const handleChange = (e) => {
    let value = e.target.value;
 
    if (e.target.name === "email") value = value.toLowerCase();
    if (e.target.name === "role") value = value.toUpperCase();
 
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
  };
 
  const validate = () => {
    if (!isLogin) {
      if (!formData.fullName.trim()) return "Full name is required";
 
      if (!/^[A-Za-z ]+$/.test(formData.fullName))
        return "Only letters allowed";
 
      if (!/^\d{10}$/.test(formData.mobileNumber))
        return "Mobile must be 10 digits";
 
      if (!formData.role) return "Please select a role";
    }
 
    if (!formData.email) return "Email required";
 
    if (!/^[A-Za-z0-9._%+-]+@gmail\.com$/.test(formData.email))
      return "Only Gmail allowed";
 
    if (!formData.password || formData.password.length < 6)
      return "Password min 6 characters";
 
    return null;
  };
 
  const handleRegister = async () => {
    const error = validate();
    if (error) return alert(error);
 
    try {
      const res =
        formData.role === "PROPERTY_OWNER"
          ? await authApi.registerOwner(formData)
          : await authApi.registerUser(formData);

      if (formData.role === "PROPERTY_OWNER") {
        const ownerEmail = formData.email.toLowerCase().trim();
        const registeredOwnerId = Number(res?.data?.data?.id);
        if (ownerEmail && Number.isFinite(registeredOwnerId) && registeredOwnerId > 0) {
          const rawMap = localStorage.getItem(OWNER_ID_BY_EMAIL_KEY);
          const ownerIdMap = rawMap ? JSON.parse(rawMap) : {};
          ownerIdMap[ownerEmail] = registeredOwnerId;
          localStorage.setItem(OWNER_ID_BY_EMAIL_KEY, JSON.stringify(ownerIdMap));
          localStorage.setItem(`ownerId:${ownerEmail}`, String(registeredOwnerId));
        }
      }
 
      alert(res.data.message);
 
      setIsLogin(true);
 
      setFormData({
        fullName: "",
        mobileNumber: "",
        email: "",
        password: "",
        role: "",
      });
    } catch (err) {
      alert(err.response?.data?.message || "Registration Failed");
    }
  };
 
  const handleLogin = async () => {
    const error = validate();
    if (error) return alert(error);
 
    try {
      const res = await authApi.login({
        email: formData.email,
        password: formData.password,
        deviceType: "WEB",
      });
 
      const token = res.data.token || res.data.data?.token;
 
      if (!token) {
        alert("Token not received");
        return;
      }
 
      const decoded = jwtDecode(token);
      const role = decoded.role || decoded.roles?.[0];
 
      if (role === "ROLE_ADMIN") {
        localStorage.setItem("adminToken", token);
      } else if (role === "ROLE_PROPERTY_OWNER") {
        localStorage.setItem("ownerToken", token);
 
        const ownerEmail = (decoded?.sub || formData.email || "")
          .toLowerCase()
          .trim();
 
        if (ownerEmail) {
          localStorage.setItem("ownerEmail", ownerEmail);
 
          const rawMap = localStorage.getItem(OWNER_ID_BY_EMAIL_KEY);
          const ownerIdMap = rawMap ? JSON.parse(rawMap) : {};
 
          const knownOwnerId = Number(
            ownerIdMap?.[ownerEmail] || localStorage.getItem(`ownerId:${ownerEmail}`)
          );
 
          if (Number.isFinite(knownOwnerId) && knownOwnerId > 0) {
            localStorage.setItem("ownerId", String(knownOwnerId));
          } else {
            localStorage.removeItem("ownerId");
          }
        }
      } else {
        localStorage.setItem("userToken", token);
      }
 
      alert("Login Successful");
 
      if (role === "ROLE_ADMIN") navigate("/admin");
      else if (role === "ROLE_PROPERTY_OWNER") navigate("/owner");
      else if (role === "ROLE_USER") navigate("/user");
      else alert("Unknown role");
    } catch (err) {
      alert(err.response?.data?.message || "Login Failed");
    }
  };
 
  function handleSubmit(e) {
    e.preventDefault();
    isLogin ? handleLogin() : handleRegister();
  }
 
  const waveLines = Array.from({ length: 4 });
 
  return (
    <div className="min-h-screen flex flex-col lg:flex-row items-center justify-center px-6 lg:px-24 bg-gradient-to-r from-[#1c1c1c] via-[#2a2a2a] to-[#3a2b2b] relative overflow-hidden">
 
      {/* Background animated lines */}
      {waveLines.map((_, i) => (
        <motion.div
          key={i}
          className="absolute h-[2px] bg-[#ff7f50]/20 rounded-full"
          initial={{
            width: `${180 + i * 90}px`,
            x: i % 2 === 0 ? -300 : 1600,
            y: Math.random() * 800,
            rotate: Math.random() * 360,
            opacity: 0,
          }}
          animate={{
            x: i % 2 === 0 ? 1600 : -300,
            y: Math.random() * 800,
            rotate: Math.random() * 360,
            opacity: [0, 0.4, 0],
          }}
          transition={{
            duration: 8 + i * 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
 
      {/* LEFT SECTION */}
      <div className="hidden lg:flex flex-col items-center justify-center flex-1 z-10">
        <motion.div
          animate={{
            y: [0, -6, 0],
            rotate: [0, 2, -2, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
          }}
          className="relative mb-3"
        >
          <div className="relative w-16 h-16">
            <Home className="w-16 h-16 text-[#ff7f50]" strokeWidth={1.8} />
            <Search
              className="absolute bottom-0 right-0 w-5 h-5 text-[#ff9f80]"
              strokeWidth={2}
            />
          </div>
        </motion.div>
 
        <h3 className="text-4xl font-bold text-[#ff7f50] text-center tracking-wide">
          Digital City
        </h3>
 
        <p className="text-[#ffb399]/70 text-base text-center mt-2 max-w-sm leading-relaxed">
          Your Trusted Partner in Every Property Deal.
        </p>
      </div>
 
      {/* AUTH BOX */}
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full lg:w-[420px] bg-[#2b2b2b]/95 backdrop-blur-md rounded-[26px] shadow-[0_20px_50px_rgba(0,0,0,0.55)] border border-[#ff7f50]/30 px-8 py-8 z-10"
      >
        <h2 className="text-3xl font-serif font-semibold text-[#ff7f50] mb-8 text-center">
          {isLogin ? "Welcome Back" : "Create Account"}
        </h2>
 
        <form className="space-y-4" onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              <input
                name="fullName"
                placeholder="Full Name"
                onChange={handleChange}
                className="w-full p-4 rounded-2xl bg-white text-black placeholder:text-black/40 border border-[#ff7f50]/20"
              />
 
              <input
                name="mobileNumber"
                placeholder="Mobile Number"
                onChange={handleChange}
                className="w-full p-4 rounded-2xl bg-white text-black placeholder:text-black/40 border border-[#ff7f50]/20"
              />
            </>
          )}
 
          <input
            name="email"
            placeholder="Email Address"
            onChange={handleChange}
            className="w-full p-4 rounded-2xl bg-white text-black placeholder:text-black/40 border border-[#ff7f50]/20"
          />
 
          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            className="w-full p-4 rounded-2xl bg-white text-black placeholder:text-black/40 border border-[#ff7f50]/20"
          />
 
          {!isLogin && (
            <select
              name="role"
              onChange={handleChange}
              value={formData.role}
              className="w-full p-4 rounded-2xl bg-white text-black border border-[#ff7f50]/20"
            >
              <option value="">Select Role</option>
              <option value="PROPERTY_OWNER">PROPERTY OWNER</option>
              <option value="USER">USER</option>
            </select>
          )}
 
          <button className="w-full bg-[#ff7f50] text-white py-4 rounded-2xl font-bold text-lg shadow-lg hover:scale-[1.02] transition-all duration-300">
            {isLogin ? "SIGN IN" : "SIGN UP"}
          </button>
        </form>
 
        <p className="text-center mt-6 text-gray-300">
          {isLogin
            ? "Don't have an account?"
            : "Already have an account?"}
 
          <span
            onClick={() => setIsLogin(!isLogin)}
            className="text-[#ff7f50] ml-2 cursor-pointer font-bold hover:text-[#ff9f80]"
          >
            {isLogin ? "Sign up" : "Sign in"}
          </span>
        </p>
      </motion.div>
    </div>
  );
}
