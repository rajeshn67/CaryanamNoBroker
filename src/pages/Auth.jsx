import { useState, useEffect } from "react";
import { authApi } from "../services/api";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    mobileNumber: "",
    email: "",
    password: "",
    role: "USER",
  });

  useEffect(() => {
  // ✅ Separate channels
  const userChannel = new BroadcastChannel("user-auth");
  const adminChannel = new BroadcastChannel("admin-auth");

  
    // ✅ user listener
    userChannel.onmessage = (msg) => {
      if (msg.data === "logout") {
        localStorage.removeItem("userToken");
        navigate("/login");
      }
    };

    // ✅ admin listener
    adminChannel.onmessage = (msg) => {
      if (msg.data === "logout") {
        localStorage.removeItem("adminToken");
        navigate("/login");
      }
    };

    // ✅ storage sync
    const syncLogout = (event) => {
      if (event.key === "adminLogout") {
        localStorage.removeItem("adminToken");
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
    };
  }, [navigate]);

  const handleChange = (e) => {
    let value = e.target.value;
    if (e.target.name === "email") value = value.toLowerCase();
    if (e.target.name === "role") value = value.toUpperCase();
    setFormData({ ...formData, [e.target.name]: value });
  };

  const validate = () => {
    if (!isLogin) {
      if (!formData.fullName.trim()) return "Full name is required";
      if (!/^[A-Za-z ]+$/.test(formData.fullName)) return "Only letters allowed";
      if (!/^\d{10}$/.test(formData.mobileNumber)) return "Mobile must be 10 digits";
    }
    if (!formData.email) return "Email required";
    if (!/^[A-Za-z0-9._%+-]+@gmail\.com$/.test(formData.email)) return "Only Gmail allowed";
    if (!formData.password || formData.password.length < 6) return "Password min 6 characters";
    return null;
  };

  const handleRegister = async () => {
    const error = validate();
    if (error) return alert(error);

    try {
      const res =
        formData.role === "ADMIN"
          ? await authApi.registerAdmin(formData)
          : await authApi.registerUser(formData);

      alert(res.data.message);
      setIsLogin(true);
    } catch (err) {
      alert(err.response?.data?.message || "Registration Failed");
    }
  };

  const handleLogin = async () => {
    const error = validate();
    if (error) return alert(error);

    try {

    const deviceType = "WEB";

      const res = await authApi.login({
        email: formData.email,
        password: formData.password,
        devicetype: deviceType,
      });

      console.log("LOGIN RESPONSE:", res.data);
      const token = res.data.token; res.data.data?.token;
      if (!token) {
     alert("Token not received");
      return;
}

      // ✅ decode first
      const decoded = jwtDecode(token);
      const role = decoded.role || decoded.roles?.[0];

      // ✅ separate token
      if (role === "ROLE_ADMIN") {
        localStorage.setItem("adminToken", token);
        
      } else {
        localStorage.setItem("userToken", token);
        
      }

      alert("Login Successful");

      if (role === "ROLE_ADMIN") navigate("/admin");
      else if (role === "ROLE_USER") navigate("/user");
      else if (role === "ROLE_PROPERTY_OWNER") navigate("/owner");
      else alert("Unknown role");

    } catch (err) {
      alert(err.response?.data?.message || "Login Failed");
    }
  };

    const triggerAdminLogout = () => {
    localStorage.removeItem("adminToken");

    // notify other tabs
    localStorage.setItem("adminLogout", Date.now());

    const channel = new BroadcastChannel("admin-auth");
    channel.postMessage("logout");
    };


  function handleSubmit(e) {
    e.preventDefault();
    isLogin ? handleLogin() : handleRegister();
  }

  const formVariants = {
    hidden: { opacity: 0, x: isLogin ? 50 : -50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row items-center lg:items-stretch justify-center lg:justify-between px-4 sm:px-6 md:px-10 lg:px-24 bg-[linear-gradient(to_right,#c026d3_50%,#ffffff_50%)] text-gray-800 overflow-hidden relative">

      {/* LEFT PANEL */}
      <div className="hidden lg:flex flex-col items-center justify-center flex-1 max-w-[700px] xl:max-w-[900px] min-h-[500px] xl:min-h-[700px] bg-gradient-to-b from-[#f0abfc] via-[#c026d3] to-[#4c1d95] p-6 sm:p-10">
        <h3 className="text-3xl text-white mt-6 text-center animate-pulse">Digital City</h3>
        <p className="text-white text-base text-center mt-2 px-4 animate-pulse">
          Your Trusted Partner in Every Property Deal
        </p>
      </div>

      {/* RIGHT PANEL */}
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full lg:flex-1 max-w-[500px] bg-white rounded-2xl shadow-2xl flex flex-col justify-center px-6 sm:px-10"
      >

        <h2 className="text-3xl mb-4">
          {isLogin ? "Start Your Property Journey Today!" : "Create Account"}
        </h2>

        <form className="space-y-4" onSubmit={handleSubmit}>

          {!isLogin && (
            <>
              <input name="fullName" placeholder="Full Name" onChange={handleChange}
                className="w-full p-3 border rounded-2xl" />

              <input name="mobileNumber" placeholder="Mobile Number" onChange={handleChange}
                className="w-full p-3 border rounded-2xl" />
            </>
          )}

          <input name="email" placeholder="Email" onChange={handleChange}
            className="w-full p-3 border rounded-2xl" />

          <input type="password" name="password" placeholder="Password" onChange={handleChange}
            className="w-full p-3 border rounded-2xl" />

          {!isLogin && (
            <select name="role" onChange={handleChange}
              className="w-full p-3 border rounded-2xl">
              <option value="USER">USER</option>
              <option value="ADMIN">ADMIN</option>
              <option value="PROPERTY_OWNER">PROPERTY_OWNER</option>
            </select>
          )}

          <button className="w-full bg-purple-500 text-white py-3 rounded-lg">
            {isLogin ? "SIGN IN" : "SIGN UP"}
          </button>
        </form>

        <p className="text-center mt-4">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <span
            onClick={() => setIsLogin(!isLogin)}
            className="text-purple-500 ml-3 cursor-pointer"
          >
            {isLogin ? "Sign up" : "Sign in"}
          </span>
        </p>
      </motion.div>
    </div>
  );
}