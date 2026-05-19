import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { authApi } from "../services/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import {
  Home,
  Search,
  Eye,
  EyeOff,
  Shield,
  Handshake,
  House,
  User,
  Mail,
  Lock,
  Phone,
  Landmark,
} from "lucide-react";

export default function PremiumAuthUI() {
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);
const [emailVerified, setEmailVerified] = useState(false);
const [showOtpBox, setShowOtpBox] = useState(false);
const [otp, setOtp] = useState("");


    const [typedCity, setTypedCity] = useState("");

  const [formData, setFormData] = useState({
    fullName: "",
    mobileNumber: "",
    email: "",
    password: "",
    role: "USER",
  });

  const handleChange = (e) => {
  let value = e.target.value;

  if (e.target.name === "email") {
    value = value.toLowerCase();

    // reset OTP when email changes
    setEmailVerified(false);
    setShowOtpBox(false);
    setOtp("");
  }

  setFormData({
    ...formData,
    [e.target.name]: value,
  });
};

  const validate = () => {
  if (!isLogin) {
    if (!formData.fullName.trim()) {
      return "Please enter full name";
    }

    if (!/^[A-Za-z ]+$/.test(formData.fullName)) {
      return "Full name should contain only letters";
    }

    if (!formData.mobileNumber.trim()) {
      return "Please enter mobile number";
    }

    if (!/^\d+$/.test(formData.mobileNumber)) {
      return "Mobile number should contain only digits";
    }

    if (formData.mobileNumber.length !== 10) {
      return "Mobile number must be 10 digits";
    }

    if (!formData.email.trim()) {
      return "Please enter email";
    }

    if (!/^[A-Za-z0-9._%+-]+@gmail\.com$/.test(formData.email)) {
      return "Only Gmail addresses are allowed";
    }

    if (!formData.password.trim()) {
      return "Please enter password";
    }

    if (formData.password.length < 6) {
      return "Password must be at least 6 characters";
    }

    if (!emailVerified) {
      return "Please verify email first";
    }
  } else {
    if (!formData.email.trim()) {
      return "Please enter email";
    }

    if (!formData.password.trim()) {
      return "Please enter password";
    }
  }

  return null;
};

const sendEmailOtp = async () => {
  if (!formData.email) {
    toast.error("Enter email first");
    return;
  }

  if (!/^[A-Za-z0-9._%+-]+@gmail\.com$/.test(formData.email)) {
    toast.error("Only Gmail addresses allowed");
    return;
  }

  try {
    setLoading(true);

    const res = await authApi.sendRegisterOtp({
      email: formData.email,
    });

    toast.success(res.data.message || "OTP Sent");
    setShowOtpBox(true);
  } catch (err) {
    toast.error(
      err?.response?.data?.message || "Failed to send OTP"
    );
  } finally {
    setLoading(false);
  }
};

const verifyOtp = async () => {
  if (!otp) {
    toast.error("Enter OTP");
    return;
  }

  try {
    setLoading(true);

    const res = await authApi.verifyRegisterOtp({
      email: formData.email,
      otp: otp,
    });

    toast.success(res.data.message || "Email verified");

    setEmailVerified(true);
    setShowOtpBox(false);
  } catch (err) {
    toast.error(
      err?.response?.data?.message || "Invalid OTP"
    );
  } finally {
    setLoading(false);
  }
};

  const handleRegister = async () => {
    const error = validate();

    if (error) {
      toast.error(error);
      return;
    }

    try {
      setLoading(true);

      const payload = {
  fullName: formData.fullName,
  mobileNumber: formData.mobileNumber,
  email: formData.email,
  password: formData.password,
  role: formData.role,
};

      const res =
        formData.role ===
        "PROPERTY_OWNER"
          ? await authApi.registerOwner(
              payload
            )
          : await authApi.registerUser(
              payload
            );

      toast.success(
  res.data.message || "Registration Successful"
);

      setIsLogin(true);

      setEmailVerified(false);
setShowOtpBox(false);
setOtp("");

      setFormData({
        fullName: "",
        mobileNumber: "",
        email: formData.email,
        password: "",
        role: "USER",
      });
    } catch (err) {
      toast.error(
  err?.response?.data?.message ||
    "Registration Failed"
);
    } finally {
      setLoading(false);
    }
  };
// useEffect(() => {
//   const word = "City";
//   let index = 0;
//   let deleting = false;

//   const interval = setInterval(() => {
//     if (!deleting) {
//       setTypedCity(word.slice(0, index + 1));
//       index++;

//       if (index === word.length) {
//         deleting = true;
//       }
//     } else {
//       setTypedCity(word.slice(0, index - 1));
//       index--;

//       if (index === 0) {
//         deleting = false;
//       }
//     }
//   }, deleting ? 500 : 700);

//   return () => clearInterval(interval);
// }, 
// []);



  const handleLogin = async () => {
  const error = validate();

  if (error) {
    toast.error(error);  
    return;
  }

    try {
      setLoading(true);

      const res = await authApi.login({
        email: formData.email,
        password: formData.password,
        deviceType: "WEB",
      });

      const token =
        res.data.token ||
        res.data.data?.token;

      if (!token) {
        toast.error("Token not received");
        return;
      }

      const decoded = jwtDecode(token);

      const role =
        decoded.role ||
        decoded.roles?.[0];

      if (role === "ROLE_ADMIN") {
        localStorage.setItem(
          "adminToken",
          token
        );

        navigate("/admin");
      } else if (
        role ===
        "ROLE_PROPERTY_OWNER"
      ) {
        localStorage.setItem(
          "ownerToken",
          token
        );

        navigate("/owner");
      } else {
        localStorage.setItem(
          "userToken",
          token
        );

        navigate("/user");
      }

      toast.success("Login Successful");
    } catch (err) {
      toast.error(
  err?.response?.data?.message ||
    "Login Failed"
);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isLogin) {
      handleLogin();
    } else {
      handleRegister();
    }
  };
useEffect(() => {
  const word = "City";
  let index = 0;

  const interval = setInterval(() => {
    setTypedCity(word.slice(0, index + 1));
    index++;

    if (index === word.length) {
      clearInterval(interval);
    }
  }, 250);

  return () => clearInterval(interval);
}, []);
 return (
<motion.div
  className="relative min-h-screen bg-black overflow-hidden"
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.6 }}
>
  <ToastContainer
  position="top-right"
  autoClose={2500}
  hideProgressBar={false}
  newestOnTop
  closeOnClick
  pauseOnHover
  draggable
  limit={1}
  theme="dark"
  toastStyle={{
    background: "#111111",
    color: "#fff8ef",
    border: "1px solid #ff7b32",
    borderRadius: "14px",
  }}
/>
  
  {/* Page reflection sweep */}
  <motion.div
    initial={{ x: "-120%" }}
    animate={{ x: "120%" }}
    transition={{
      duration: 1.3,
      ease: "easeInOut",
      delay: 0.2,
    }}
    className="absolute inset-y-0 left-0 z-50 w-[35%] 
               bg-gradient-to-r 
               from-transparent 
               via-white/20 
               to-transparent 
               skew-x-[-20deg] 
               pointer-events-none"
  />

  {/* TOP LEFT STAR DOT PATTERN */}
<div className="absolute top-0 left-0 w-[220px] h-[220px] sm:w-[140px] sm:h-[180px] pointer-events-none overflow-hidden">

  {/* dot pattern (pure, no glow bleed) */}
  <div
    className="absolute inset-0"
    style={{
      backgroundImage: `
        radial-gradient(circle, #ff8c00 1.4px, transparent 1.8px)
      `,
      backgroundSize: "23px 20px",

      /* keep ONLY fade, no blending glow effect */
      maskImage: `
        linear-gradient(
          to bottom,
          rgba(0,0,0,1) 0%,
          rgba(0,0,0,1) 55%,
          rgba(0,0,0,0.45) 75%,
          rgba(0,0,0,0) 100%
        ),
        linear-gradient(
          to right,
          rgba(0,0,0,1) 0%,
          rgba(0,0,0,1) 60%,
          rgba(0,0,0,0.4) 82%,
          rgba(0,0,0,0) 100%
        )
      `,
      WebkitMaskImage: `
        linear-gradient(
          to bottom,
          rgba(0,0,0,1) 0%,
          rgba(0,0,0,1) 55%,
          rgba(0,0,0,0.45) 75%,
          rgba(0,0,0,0) 100%
        ),
        linear-gradient(
          to right,
          rgba(0,0,0,1) 0%,
          rgba(0,0,0,1) 60%,
          rgba(0,0,0,0.4) 82%,
          rgba(0,0,0,0) 100%
        )
      `,

      maskComposite: "intersect",
      WebkitMaskComposite: "source-in",
    }}
  />

</div>

<div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
  {/* LEFT SECTION */}
  <div className="relative flex flex-col justify-center items-center px-5 sm:px-8 md:px-10 xl:px-14 py-8 md:py-10 text-center overflow-hidden">
        {/* Logo */}
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="relative"
        >
          <Home className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 xl:w-20 xl:h-20 text-[#ff7b32]" />
          <Search className="absolute bottom-0 right-[-4px] w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-[#ff7b32]" />
        </motion.div>

        {/* Title */}
<h2 className="mt-2 text-3xl sm:text-4xl md:text-5xl xl:text-6xl font-semibold flex justify-center items-center gap-2">
  <span className="text-[#f6e9dc]">Digital</span>

  <span
  className="text-[#ff7b32] animate-cityGlow"
  style={{
    WebkitTextStroke: "0.4px rgba(255, 255, 255, 0.7)",
  }}
>
  City
</span>
</h2>

        {/* Divider */}
        <div className="flex items-center gap-3 mt-1">
          <div className="w-16 h-[1px] bg-gradient-to-r from-transparent to-[#ff7b32]" />
          <div className="w-2 h-2 rounded-full bg-[#ff7b32]" />
          <div className="w-16 h-[1px] bg-gradient-to-l from-transparent to-[#ff7b32]" />
        </div>

        

        {/* Tagline */}
<p className="mt-4 text-[#f4ece5] text-sm sm:text-base xl:text-lg max-w-md leading-relaxed px-2">        
          Your Trusted Partner in Every Property Deal.
        </p>

        <p
className="text-[#f6e9dc] text-sm sm:text-base md:text-lg font-medium px-2"
  style={{ fontFamily: "'Tiro Devanagari Marathi', serif" }}
>
  तुमच्या प्रत्येक प्रॉपर्टी डीलमध्ये विश्वासाची साथ.
        </p>

        {/* Features */}
{/* Features */}
<div className="grid grid-cols-2 md:grid-cols-4 gap-y-5 mt-7 w-full max-w-4xl">
  {[
    {
      icon: Shield,
      title: "विश्वास",
      sub: "Trust",
    },
    {
      icon: Handshake,
      title: "सहभाग",
      sub: "Partnership",
    },
    {
      icon: House,
      title: "सुरक्षित व्यवहार",
      sub: "Secure Deals",
    },
    {
      icon: User,
      title: "नेहमी तुमच्या सोबत",
      sub: "Always With You",
    },
  ].map((item, i) => (
    <motion.div
      key={i}
      whileHover={{
        y: -4,
        scale: 1.5,
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 18,
      }}
      className={`flex flex-col items-center px-3 py-2 rounded-xl cursor-pointer transition-all duration-300 ${
        i !== 3 ? "border-r border-[#2a2a2a]" : ""
      } hover:bg-white/5`}
    >
      <item.icon
        className="w-7 h-7 text-[#ff7b32] drop-shadow-[0_0_6px_rgba(255,123,50,0.5)]"
        strokeWidth={1.8}
      />

<p className="mt-2 text-[10px] sm:text-[11px] text-white text-center">
          {item.title}
      </p>

<p className="mt-1 text-[10px] sm:text-[11px] text-[#d7c9be] text-center">
          {item.sub}
      </p>
    </motion.div>
  ))}
</div>

{/* PREMIUM LEFT EDGE LIGHT FLARE */}
<div className="absolute left-0 top-[32%] md:top-[20%] -translate-y-1/2 w-[180px] h-[180px] sm:w-[220px] sm:h-[220px] md:w-[300px] md:h-[300px] pointer-events-none">

  {/* Soft circular fade mask */}
  <div className="absolute inset-0 rounded-full bg-transparent blur-3xl" />

  {/* Main diagonal golden beam */}
  <div
    className="absolute left-[-40px] top-1/2 w-[220px] h-[220px] -translate-y-1/2 rotate-[-35deg] rounded-full blur-[80px]"
    style={{
      background:
        "radial-gradient(circle, rgba(255,165,60,0.55) 0%, rgba(255,140,0,0.22) 35%, rgba(255,140,0,0.08) 55%, transparent 75%)",
    }}
  />

  {/* Core hotspot */}
  <div
    className="absolute left-[70px] top-1/2 w-24 h-24 -translate-y-1/2 rounded-full blur-3xl"
    style={{
      background:
        "radial-gradient(circle, rgba(255,190,90,0.95) 0%, rgba(255,140,0,0.35) 45%, transparent 75%)",
    }}
  />

  {/* Horizontal flare */}
  <div
    className="absolute left-[10px] top-1/2 w-[200px] h-[2px] -translate-y-1/2 blur-sm"
    style={{
      background:
        "linear-gradient(90deg, transparent, rgba(255,190,100,0.9), transparent)",
    }}
  />

  {/* Vertical flare */}
  <div
    className="absolute left-[95px] top-1/2 w-[1px] h-[180px] -translate-y-1/2 blur-sm"
    style={{
      background:
        "linear-gradient(180deg, transparent, rgba(255,180,90,0.7), transparent)",
    }}
  />

  {/* Ambient outer glow */}
  <div className="absolute left-[-80px] top-[28%] w-56 h-56 rounded-full bg-orange-500/10 blur-[120px]" />
</div>


{/* Home icon */}


<div className="relative flex items-center justify-center mt-6 md:mt-8 w-full max-w-[320px] sm:max-w-[420px] md:max-w-[520px] mx-auto">
  
  {/* LEFT LINE */}
  <div className="flex items-center flex-1 justify-end">
    <div className="h-[1.5px] w-full max-w-[90px] sm:max-w-[130px] md:max-w-[180px] 
      bg-gradient-to-r from-transparent via-[#ff7b32] to-[#d95f14]" />
  </div>

  {/* CENTER HOME ICON */}
  <div className="relative mx-6 flex items-center justify-center">
    
    {/* glow */}
    <div className="absolute w-14 h-14 rounded-full bg-[#ff7b32]/15 blur-xl" />

    <Home
      className="relative z-10 w-7 h-7 text-[#ff7b32]"
      strokeWidth={1.9}
    />
  </div>

  {/* RIGHT LINE */}
  <div className="flex items-center flex-1">
    <div className="h-[1.5px] w-full max-w-[90px] sm:max-w-[130px] md:max-w-[180px] 
      bg-gradient-to-l from-transparent via-[#ff7b32] to-[#d95f14]" />
  </div>
</div>      

 {/* Footer Text */}
        {/* Footer Text Headline Effect */}
<div className="mt-5 w-full max-w-md h-[55px] relative overflow-hidden">

  {/* English */}
  <motion.p
    className="absolute top-0 left-0 w-full text-center text-[#f6e9dc] text-xs sm:text-sm whitespace-nowrap"
    animate={{
      x: ["-100%", "0%", "0%", "100%", "100%", "-100%"],
      opacity: [0, 1, 1, 0, 0, 0],
    }}
    transition={{
      duration: 8,
      repeat: Infinity,
      times: [0, 0.15, 0.45, 0.6, 1, 1],
      ease: "easeInOut",
    }}
  >
    Rental Homes Just One Click Away.
  </motion.p>

  {/* Marathi */}
  <motion.p
    className="absolute bottom-0 left-0 w-full text-center text-[#f6e9dc] text-sm sm:text-base md:text-lg font-medium whitespace-nowrap"
    style={{ fontFamily: "'Tiro Devanagari Marathi', serif" }}
    animate={{
      x: ["-100%", "-100%", "0%", "0%", "100%", "100%"],
      opacity: [0, 0, 1, 1, 0, 0],
    }}
    transition={{
      duration: 8,
      repeat: Infinity,
      times: [0, 0.45, 0.6, 0.85, 1, 1],
      ease: "easeInOut",
    }}
  >
    भाड्याचं घर आता एका क्लिकवर.
  </motion.p>
</div>
      </div>
      {/* FOOTER WAVE EFFECT */}
<div className="hidden md:block absolute bottom-0 left-0 w-full overflow-hidden pointer-events-none">  <svg
    viewBox="0 0 900 240"
    className="w-full h-[190px]"
    preserveAspectRatio="none"
  >
    <defs>
      <linearGradient id="footerWave" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#ff8c00" stopOpacity="0.55" />
        <stop offset="40%" stopColor="#ffb347" stopOpacity="0.35" />
        <stop offset="70%" stopColor="#ffd700" stopOpacity="0.15" />
        <stop offset="100%" stopColor="#000000" stopOpacity="0" />
      </linearGradient>

      <filter id="softGlow">
        <feGaussianBlur stdDeviation="4" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>

    {[
      {
        d: "M0 195 C120 195,180 165,260 145 C340 125,430 150,520 170 C610 190,700 205,900 220",
        w: 1.2,
        o: 0.18,
      },
      {
        d: "M0 188 C130 188,190 155,270 132 C350 110,440 138,530 160 C620 182,710 198,900 215",
        w: 1.5,
        o: 0.24,
      },
      {
        d: "M0 180 C125 180,195 145,285 120 C365 98,455 128,545 150 C635 172,720 190,900 210",
        w: 1.8,
        o: 0.32,
      },
      {
        d: "M0 170 C135 170,210 135,300 108 C390 82,470 115,560 140 C650 165,735 185,900 205",
        w: 2.2,
        o: 0.4,
      },
      {
        d: "M0 160 C145 160,220 122,310 95 C400 70,485 105,575 130 C665 155,750 178,900 198",
        w: 2.5,
        o: 0.5,
      },
      {
        d: "M0 150 C155 150,230 108,320 82 C410 58,495 95,585 120 C675 145,760 170,900 190",
        w: 3,
        o: 0.58,
      },
    ].map((wave, i) => (
      <path
        key={i}
        d={wave.d}
        fill="none"
        stroke="url(#footerWave)"
        strokeWidth={wave.w}
        strokeOpacity={wave.o}
        strokeLinecap="round"
        filter="url(#softGlow)"
      />
    ))}
  </svg>
</div>

      {/* RIGHT SECTION */}
<div className="flex justify-center items-center px-4 sm:px-6 py-8 md:py-10">
<div className="w-full max-w-sm sm:max-w-md">
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
className="bg-[#fff8ef] border border-[#ead8c4] rounded-3xl shadow-2xl p-5 sm:p-6 md:p-8"          >
            {/* Heading */}
            <div className="relative flex items-center justify-center mb-7 w-full">

  {/* LEFT LINE */}
  <div className="flex items-center flex-1 justify-end">
    <div className="h-[1px] w-full max-w-[90px] bg-gradient-to-r from-transparent via-[#ff7b32]/60 to-[#ff7b32]" />
  </div>

  {/* CENTER HEADING */}
  <div className="relative mx-4 flex items-center justify-center">
    
    {/* glow */}
    <div className="absolute w-24 h-10 rounded-full bg-[#ff7b32]/10 blur-xl" />

    <h2 className="relative z-10 text-2xl sm:text-3xl font-semibold whitespace-nowrap">
      <span className="text-[#ff7b32]">
        {isLogin ? "Login" : "Create"}
      </span>{" "}
      <span className="text-black">Account</span>
    </h2>
  </div>

  {/* RIGHT LINE */}
  <div className="flex items-center flex-1">
    <div className="h-[1px] w-full max-w-[90px] bg-gradient-to-l from-transparent via-[#ff7b32]/60 to-[#ff7b32]" />
  </div>
</div>

            {/* Role Selector */}
            {!isLogin && (
              <div className="flex rounded-xl overflow-hidden border border-[#e6d4c1] mb-5">
                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      role: "PROPERTY_OWNER",
                    })
                  }
                  className={`w-1/2 h-12 text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                    formData.role === "PROPERTY_OWNER"
                      ? "bg-[#ff7b32] text-black"
                      : "bg-[#f8eee2] text-black hover:bg-[#ffe3d0]"
                  }`}
                >
                  <Landmark className="w-4 h-4" />
                  Owner
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      role: "USER",
                    })
                  }
                  className={`w-1/2 h-12 text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                    formData.role === "USER"
                      ? "bg-[#ff7b32] text-black"
                      : "bg-[#f8eee2] text-black hover:bg-[#ffe3d0]"
                  }`}
                >
                  <User className="w-4 h-4" />
                  Tenant
                </button>
              </div>
            )}

            {/* Inputs */}
            <div className="space-y-4">
              {!isLogin && (
                <>
                  <input
                    type="text"
                    name="fullName"
                    placeholder="Full Name"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full h-11 rounded-xl border border-[#e6d4c1] bg-[#f8eee2] px-4 text-black outline-none focus:border-[#ff7b32]"
                  />

                  <input
                    type="text"
                    name="mobileNumber"
                    placeholder="Mobile Number"
                    value={formData.mobileNumber}
                    onChange={handleChange}
                    className="w-full h-11 rounded-xl border border-[#e6d4c1] bg-[#f8eee2] px-4 text-black outline-none focus:border-[#ff7b32]"
                  />
                </>
              )}

              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                className="w-full h-11 rounded-xl border border-[#e6d4c1] bg-[#f8eee2] px-4 text-black outline-none focus:border-[#ff7b32]"
              />

              {/* OTP SECTION */}
{!isLogin && (
  <>
    {!emailVerified && (
      <div className="flex justify-end">
  <button
    type="button"
    onClick={sendEmailOtp}
    disabled={loading}
    className="px-4 py-2 rounded-lg bg-[#ff7b32] text-white text-sm font-semibold hover:bg-[#e66a1f] transition-colors w-fit"
  >
    {loading ? "Sending OTP..." : "Verify Email"}
  </button>
</div>
    )}

    {showOtpBox && (
      <>
        <input
          type="text"
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          className="w-full h-11 rounded-xl border border-[#e6d4c1] bg-[#f8eee2] px-4 text-black outline-none focus:border-[#ff7b32]"
        />

        <button
          type="button"
          onClick={verifyOtp}
          disabled={loading}
  className="w-full h-11 rounded-xl bg-[#ff7b32] text-white font-semibold hover:bg-[#e66a1f] transition-colors"
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </button>
      </>
    )}

    {emailVerified && (
      <p className="text-green-600 text-sm font-semibold">
        Email Verified Successfully ✓
      </p>
    )}
  </>
)}

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full h-11 rounded-xl border border-[#e6d4c1] bg-[#f8eee2] px-4 pr-12 text-black outline-none focus:border-[#ff7b32]"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>

              {/* Submit */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                disabled={loading}
                type="submit"
                className="w-full h-11 rounded-xl bg-[#ff7b32] text-white font-semibold"
              >
                {loading
                  ? "Please Wait..."
                  : isLogin
                  ? "Login"
                  : "Register"}
              </motion.button>
              {/* Forgot Password */}
{isLogin && (
  <div className="flex justify-end">
    <button
      type="button"
      className="text-sm font-medium text-[#ff7b32] hover:text-[#e66a1f] transition-colors"
      onClick={() => navigate("/forgot-password")}
    >
      Forgot Password?
    </button>
  </div>
)}
            </div>

            {/* Footer */}
            <div className="mt-5 text-center text-sm text-black">
              {isLogin
                ? "Don't have an account?"
                : "Already have an account?"}

              <span
                onClick={() => setIsLogin(!isLogin)}
                className="ml-2 text-[#ff7b32] font-semibold cursor-pointer"
              >
                {isLogin ? "Register here" : "Login"}
              </span>
            </div>
          </motion.form>
        </div>
      </div>
    </div>
</motion.div>  
);
}