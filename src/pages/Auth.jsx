// import { useState, useEffect } from "react";
// import { authApi } from "../services/api";
// import { jwtDecode } from "jwt-decode";
// import { useNavigate } from "react-router-dom";
// import { motion } from "framer-motion";
// import { Home, Search } from "lucide-react";
 
// export default function Auth() {
//   const OWNER_ID_BY_EMAIL_KEY = "ownerIdByEmail";
//   const [isLogin, setIsLogin] = useState(true);
//   const navigate = useNavigate();
 
//   const [formData, setFormData] = useState({
//     fullName: "",
//     mobileNumber: "",
//     email: "",
//     password: "",
//     role: "", // default empty for Select Role
//   });
 
//   useEffect(() => {
//     const userChannel = new BroadcastChannel("user-auth");
//     const adminChannel = new BroadcastChannel("admin-auth");
//     const ownerChannel = new BroadcastChannel("owner-auth");
 
//     adminChannel.onmessage = (msg) => {
//       if (msg.data === "logout") {
//         localStorage.removeItem("adminToken");
//         navigate("/login");
//       }
//     };
 
//     userChannel.onmessage = (msg) => {
//       if (msg.data === "logout") {
//         localStorage.removeItem("userToken");
//         navigate("/login");
//       }
//     };
 
//     ownerChannel.onmessage = (msg) => {
//       if (msg.data === "logout") {
//         localStorage.removeItem("ownerToken");
//         localStorage.removeItem("ownerId");
//         navigate("/login");
//       }
//     };
 
//     const syncLogout = (event) => {
//       if (event.key === "adminLogout") {
//         localStorage.removeItem("adminToken");
//         navigate("/login");
//       }
 
//       if (event.key === "ownerLogout") {
//         localStorage.removeItem("ownerToken");
//         localStorage.removeItem("ownerId");
//         navigate("/login");
//       }
 
//       if (event.key === "userLogout") {
//         localStorage.removeItem("userToken");
//         navigate("/login");
//       }
//     };
 
//     window.addEventListener("storage", syncLogout);
 
//     return () => {
//       window.removeEventListener("storage", syncLogout);
//       userChannel.close();
//       adminChannel.close();
//       ownerChannel.close();
//     };
//   }, [navigate]);
 
//   const handleChange = (e) => {
//     let value = e.target.value;
 
//     if (e.target.name === "email") value = value.toLowerCase();
//     if (e.target.name === "role") value = value.toUpperCase();
 
//     setFormData({
//       ...formData,
//       [e.target.name]: value,
//     });
//   };
 
//   const validate = () => {
//     if (!isLogin) {
//       if (!formData.fullName.trim()) return "Full name is required";
 
//       if (!/^[A-Za-z ]+$/.test(formData.fullName))
//         return "Only letters allowed";
 
//       if (!/^\d{10}$/.test(formData.mobileNumber))
//         return "Mobile must be 10 digits";
 
//       if (!formData.role) return "Please select a role";
//     }
 
//     if (!formData.email) return "Email required";
 
//     if (!/^[A-Za-z0-9._%+-]+@gmail\.com$/.test(formData.email))
//       return "Only Gmail allowed";
 
//     if (!formData.password || formData.password.length < 6)
//       return "Password min 6 characters";
 
//     return null;
//   };
 
//   const handleRegister = async () => {
//     const error = validate();
//     if (error) return alert(error);
 
//     try {
//       const res =
//         formData.role === "PROPERTY_OWNER"
//           ? await authApi.registerOwner(formData)
//           : await authApi.registerUser(formData);

//       if (formData.role === "PROPERTY_OWNER") {
//         const ownerEmail = formData.email.toLowerCase().trim();
//         const registeredOwnerId = Number(res?.data?.data?.id);
//         if (ownerEmail && Number.isFinite(registeredOwnerId) && registeredOwnerId > 0) {
//           const rawMap = localStorage.getItem(OWNER_ID_BY_EMAIL_KEY);
//           const ownerIdMap = rawMap ? JSON.parse(rawMap) : {};
//           ownerIdMap[ownerEmail] = registeredOwnerId;
//           localStorage.setItem(OWNER_ID_BY_EMAIL_KEY, JSON.stringify(ownerIdMap));
//           localStorage.setItem(`ownerId:${ownerEmail}`, String(registeredOwnerId));
//         }
//       }
 
//       alert(res.data.message);
 
//       setIsLogin(true);
 
//       setFormData({
//         fullName: "",
//         mobileNumber: "",
//         email: "",
//         password: "",
//         role: "",
//       });
//     } catch (err) {
//       alert(err.response?.data?.message || "Registration Failed");
//     }
//   };
 
//   const handleLogin = async () => {
//     const error = validate();
//     if (error) return alert(error);
 
//     try {
//       const res = await authApi.login({
//         email: formData.email,
//         password: formData.password,
//         deviceType: "WEB",
//       });
 
//       const token = res.data.token || res.data.data?.token;
 
//       if (!token) {
//         alert("Token not received");
//         return;
//       }
 
//       const decoded = jwtDecode(token);
//       const role = decoded.role || decoded.roles?.[0];
 
//       if (role === "ROLE_ADMIN") {
//         localStorage.setItem("adminToken", token);
//       } else if (role === "ROLE_PROPERTY_OWNER") {
//         localStorage.setItem("ownerToken", token);
 
//         const ownerEmail = (decoded?.sub || formData.email || "")
//           .toLowerCase()
//           .trim();
 
//         if (ownerEmail) {
//           localStorage.setItem("ownerEmail", ownerEmail);
 
//           const rawMap = localStorage.getItem(OWNER_ID_BY_EMAIL_KEY);
//           const ownerIdMap = rawMap ? JSON.parse(rawMap) : {};
 
//           const knownOwnerId = Number(
//             ownerIdMap?.[ownerEmail] || localStorage.getItem(`ownerId:${ownerEmail}`)
//           );
 
//           if (Number.isFinite(knownOwnerId) && knownOwnerId > 0) {
//             localStorage.setItem("ownerId", String(knownOwnerId));
//           } else {
//             localStorage.removeItem("ownerId");
//           }
//         }
//       } else {
//         localStorage.setItem("userToken", token);
//       }
 
//       alert("Login Successful");
 
//       if (role === "ROLE_ADMIN") navigate("/admin");
//       else if (role === "ROLE_PROPERTY_OWNER") navigate("/owner");
//       else if (role === "ROLE_USER") navigate("/user");
//       else alert("Unknown role");
//     } catch (err) {
//       alert(err.response?.data?.message || "Login Failed");
//     }
//   };
 
//   function handleSubmit(e) {
//     e.preventDefault();
//     isLogin ? handleLogin() : handleRegister();
//   }
 
//   const waveLines = Array.from({ length: 4 });
 
//   return (
//     <div className="min-h-screen flex flex-col lg:flex-row items-center justify-center px-6 lg:px-24 bg-gradient-to-r from-[#1c1c1c] via-[#2a2a2a] to-[#3a2b2b] relative overflow-hidden">
 
//       {/* Background animated lines */}
//       {waveLines.map((_, i) => (
//         <motion.div
//           key={i}
//           className="absolute h-[2px] bg-[#ff7f50]/20 rounded-full"
//           initial={{
//             width: `${180 + i * 90}px`,
//             x: i % 2 === 0 ? -300 : 1600,
//             y: Math.random() * 800,
//             rotate: Math.random() * 360,
//             opacity: 0,
//           }}
//           animate={{
//             x: i % 2 === 0 ? 1600 : -300,
//             y: Math.random() * 800,
//             rotate: Math.random() * 360,
//             opacity: [0, 0.4, 0],
//           }}
//           transition={{
//             duration: 8 + i * 2,
//             repeat: Infinity,
//             ease: "easeInOut",
//           }}
//         />
//       ))}
 
//       {/* LEFT SECTION */}
//       <div className="hidden lg:flex flex-col items-center justify-center flex-1 z-10">
//         <motion.div
//           animate={{
//             y: [0, -6, 0],
//             rotate: [0, 2, -2, 0],
//           }}
//           transition={{
//             duration: 4,
//             repeat: Infinity,
//           }}
//           className="relative mb-3"
//         >
//           <div className="relative w-16 h-16">
//             <Home className="w-16 h-16 text-[#ff7f50]" strokeWidth={1.8} />
//             <Search
//               className="absolute bottom-0 right-0 w-5 h-5 text-[#ff9f80]"
//               strokeWidth={2}
//             />
//           </div>
//         </motion.div>
 
//         <h3 className="text-4xl font-bold text-[#ff7f50] text-center tracking-wide">
//           Digital City
//         </h3>
 
//         <p className="text-[#ffb399]/70 text-base text-center mt-2 max-w-sm leading-relaxed">
//           Your Trusted Partner in Every Property Deal.
//         </p>
//       </div>
 
//       {/* AUTH BOX */}
//       <motion.div
//         initial={{ scale: 0.92, opacity: 0 }}
//         animate={{ scale: 1, opacity: 1 }}
//         transition={{ duration: 0.4 }}
//         className="w-full lg:w-[420px] bg-[#2b2b2b]/95 backdrop-blur-md rounded-[26px] shadow-[0_20px_50px_rgba(0,0,0,0.55)] border border-[#ff7f50]/30 px-8 py-8 z-10"
//       >
//         <h2 className="text-3xl font-serif font-semibold text-[#ff7f50] mb-8 text-center">
//           {isLogin ? "Welcome Back" : "Create Account"}
//         </h2>
 
//         <form className="space-y-4" onSubmit={handleSubmit}>
//           {!isLogin && (
//             <>
//               <input
//                 name="fullName"
//                 placeholder="Full Name"
//                 onChange={handleChange}
//                 className="w-full p-4 rounded-2xl bg-white text-black placeholder:text-black/40 border border-[#ff7f50]/20"
//               />
 
//               <input
//                 name="mobileNumber"
//                 placeholder="Mobile Number"
//                 onChange={handleChange}
//                 className="w-full p-4 rounded-2xl bg-white text-black placeholder:text-black/40 border border-[#ff7f50]/20"
//               />
//             </>
//           )}
 
//           <input
//             name="email"
//             placeholder="Email Address"
//             onChange={handleChange}
//             className="w-full p-4 rounded-2xl bg-white text-black placeholder:text-black/40 border border-[#ff7f50]/20"
//           />
 
//           <input
//             type="password"
//             name="password"
//             placeholder="Password"
//             onChange={handleChange}
//             className="w-full p-4 rounded-2xl bg-white text-black placeholder:text-black/40 border border-[#ff7f50]/20"
//           />
 
//           {!isLogin && (
//             <select
//               name="role"
//               onChange={handleChange}
//               value={formData.role}
//               className="w-full p-4 rounded-2xl bg-white text-black border border-[#ff7f50]/20"
//             >
//               <option value="">Select Role</option>
//               <option value="PROPERTY_OWNER">PROPERTY OWNER</option>
//               <option value="USER">USER</option>
//             </select>
//           )}
 
//           <button className="w-full bg-[#ff7f50] text-white py-4 rounded-2xl font-bold text-lg shadow-lg hover:scale-[1.02] transition-all duration-300">
//             {isLogin ? "SIGN IN" : "SIGN UP"}
//           </button>
//         </form>
 
//         <p className="text-center mt-6 text-gray-300">
//           {isLogin
//             ? "Don't have an account?"
//             : "Already have an account?"}
 
//           <span
//             onClick={() => setIsLogin(!isLogin)}
//             className="text-[#ff7f50] ml-2 cursor-pointer font-bold hover:text-[#ff9f80]"
//           >
//             {isLogin ? "Sign up" : "Sign in"}
//           </span>
//         </p>
//       </motion.div>
//     </div>
//   );
// }



// import { useState, useEffect } from "react";
// import { authApi } from "../services/api";
// import { jwtDecode } from "jwt-decode";
// import { useNavigate } from "react-router-dom";
// import { motion } from "framer-motion";
// import {
//   Home,
//   Search,
//   Eye,
//   EyeOff,
//   Landmark,
//   BadgeCheck,
// } from "lucide-react";

// export default function Auth() {
//   const OWNER_ID_BY_EMAIL_KEY = "ownerIdByEmail";
//   const OWNER_NAME_KEY = "ownerName";
//   const OWNER_NAME_BY_EMAIL_KEY = "ownerNameByEmail";
//   const [isLogin, setIsLogin] = useState(true);
//   const [isPasswordVisible, setIsPasswordVisible] = useState(false);
//   const navigate = useNavigate();

//   const [formData, setFormData] = useState({
//     fullName: "",
//     mobileNumber: "",
//     email: "",
//     password: "",
//     role: "USER",
//   });

//   useEffect(() => {
//     const userChannel = new BroadcastChannel("user-auth");
//     const adminChannel = new BroadcastChannel("admin-auth");
//     const ownerChannel = new BroadcastChannel("owner-auth");

//     adminChannel.onmessage = (msg) => {
//       if (msg.data === "logout") {
//         localStorage.removeItem("adminToken");
//         navigate("/login");
//       }
//     };

//     userChannel.onmessage = (msg) => {
//       if (msg.data === "logout") {
//         localStorage.removeItem("userToken");
//         navigate("/login");
//       }
//     };

//     ownerChannel.onmessage = (msg) => {
//       if (msg.data === "logout") {
//         localStorage.removeItem("ownerToken");
//         localStorage.removeItem("ownerId");
//         navigate("/login");
//       }
//     };

//     const syncLogout = (event) => {
//       if (event.key === "adminLogout") {
//         localStorage.removeItem("adminToken");
//         navigate("/login");
//       }

//       if (event.key === "ownerLogout") {
//         localStorage.removeItem("ownerToken");
//         localStorage.removeItem("ownerId");
//         navigate("/login");
//       }

//       if (event.key === "userLogout") {
//         localStorage.removeItem("userToken");
//         navigate("/login");
//       }
//     };

//     window.addEventListener("storage", syncLogout);

//     return () => {
//       window.removeEventListener("storage", syncLogout);
//       userChannel.close();
//       adminChannel.close();
//       ownerChannel.close();
//     };
//   }, [navigate]);

//   const handleChange = (e) => {
//     let value = e.target.value;

//     if (e.target.name === "email") {
//       value = value.toLowerCase();
//     }

//     setFormData({
//       ...formData,
//       [e.target.name]: value,
//     });
//   };

//   const handleRoleChange = (role) => {
//     setFormData({
//       ...formData,
//       role,
//     });
//   };

//   const validate = () => {
//     if (!isLogin) {
//       if (!formData.fullName.trim()) {
//         return "Full name is required";
//       }

//       if (!/^[A-Za-z ]+$/.test(formData.fullName)) {
//         return "Only letters allowed";
//       }

//       if (!/^\d{10}$/.test(formData.mobileNumber)) {
//         return "Mobile must be 10 digits";
//       }
//     }

//     if (!formData.email) {
//       return "Email required";
//     }

//     if (!/^[A-Za-z0-9._%+-]+@gmail\.com$/.test(formData.email)) {
//       return "Only Gmail allowed";
//     }

//     if (!formData.password || formData.password.length < 6) {
//       return "Password min 6 characters";
//     }

//     if (
//       !isLogin &&
//       !/^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>])(?=\S+$).{8,}$/.test(
//         formData.password
//       )
//     ) {
//       return "Password must contain uppercase & special character";
//     }

//     return null;
//   };

//   const handleRegister = async () => {
//     const error = validate();
//     if (error) return alert(error);

//     try {
//       const res =
//         formData.role === "PROPERTY_OWNER"
//           ? await authApi.registerOwner(formData)
//           : await authApi.registerUser(formData);

//       if (formData.role === "PROPERTY_OWNER") {
//         const ownerEmail = formData.email.toLowerCase().trim();
//         const ownerName = formData.fullName.trim();
//         const registeredOwnerId = Number(res?.data?.data?.id);

//         if (ownerName) {
//           localStorage.setItem(OWNER_NAME_KEY, ownerName);
//         }

//         if (ownerEmail && ownerName) {
//           const rawNames = localStorage.getItem(OWNER_NAME_BY_EMAIL_KEY);
//           const ownerNameMap = rawNames ? JSON.parse(rawNames) : {};
//           ownerNameMap[ownerEmail] = ownerName;
//           localStorage.setItem(OWNER_NAME_BY_EMAIL_KEY, JSON.stringify(ownerNameMap));
//         }

//         if (
//           ownerEmail &&
//           Number.isFinite(registeredOwnerId) &&
//           registeredOwnerId > 0
//         ) {
//           const rawMap = localStorage.getItem(OWNER_ID_BY_EMAIL_KEY);
//           const ownerIdMap = rawMap ? JSON.parse(rawMap) : {};

//           ownerIdMap[ownerEmail] = registeredOwnerId;

//           localStorage.setItem(
//             OWNER_ID_BY_EMAIL_KEY,
//             JSON.stringify(ownerIdMap)
//           );

//           localStorage.setItem(
//             `ownerId:${ownerEmail}`,
//             String(registeredOwnerId)
//           );
//         }
//       }

//       alert(res.data.message);

//       const savedEmail = formData.email;
//       const savedPassword = formData.password;

//       setIsLogin(true);

//       setFormData({
//         fullName: "",
//         mobileNumber: "",
//         email: savedEmail,
//         password: savedPassword,
//         role: "USER",
//       });
//     } catch (err) {
//       alert(err.response?.data?.message || "Registration Failed");
//     }
//   };

//   const handleLogin = async () => {
//     const error = validate();
//     if (error) return alert(error);

//     try {
//       const res = await authApi.login({
//         email: formData.email,
//         password: formData.password,
//         deviceType: "WEB",
//       });

//       const token = res.data.token || res.data.data?.token;

//       if (!token) {
//         alert("Token not received");
//         return;
//       }

//       const decoded = jwtDecode(token);
//       const role = decoded.role || decoded.roles?.[0];

//       if (role === "ROLE_ADMIN") {
//         localStorage.setItem("adminToken", token);
//       } else if (role === "ROLE_PROPERTY_OWNER") {
//         localStorage.setItem("ownerToken", token);

//         const ownerEmail = (decoded?.sub || formData.email || "")
//           .toLowerCase()
//           .trim();
//         const ownerName = String(decoded?.fullName || decoded?.name || "").trim();

//         if (ownerName) {
//           localStorage.setItem(OWNER_NAME_KEY, ownerName);
//         }

//         if (ownerEmail) {
//           localStorage.setItem("ownerEmail", ownerEmail);

//           if (ownerName) {
//             const rawNames = localStorage.getItem(OWNER_NAME_BY_EMAIL_KEY);
//             const ownerNameMap = rawNames ? JSON.parse(rawNames) : {};
//             ownerNameMap[ownerEmail] = ownerName;
//             localStorage.setItem(OWNER_NAME_BY_EMAIL_KEY, JSON.stringify(ownerNameMap));
//           }

//           const rawMap = localStorage.getItem(OWNER_ID_BY_EMAIL_KEY);
//           const ownerIdMap = rawMap ? JSON.parse(rawMap) : {};

//           const knownOwnerId = Number(
//             ownerIdMap?.[ownerEmail] ||
//               localStorage.getItem(`ownerId:${ownerEmail}`)
//           );

//           if (Number.isFinite(knownOwnerId) && knownOwnerId > 0) {
//             localStorage.setItem("ownerId", String(knownOwnerId));
//           } else {
//             localStorage.removeItem("ownerId");
//           }
//         }
//       } else {
//         localStorage.setItem("userToken", token);
//       }

//       alert("Login Successful");

//       if (role === "ROLE_ADMIN") navigate("/admin");
//       else if (role === "ROLE_PROPERTY_OWNER") navigate("/owner");
//       else if (role === "ROLE_USER") navigate("/user");
//       else alert("Unknown role");
//     } catch (err) {
//       alert(err.response?.data?.message || "Login Failed");
//     }
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     isLogin ? handleLogin() : handleRegister();
//   };

//   const waveLines = Array.from({ length: 4 });

//   return (
//     <div className="min-h-screen flex flex-col lg:flex-row items-center justify-center px-6 lg:px-24 bg-gradient-to-r from-[#1c1c1c] via-[#2a2a2a] to-[#3a2b2b] relative overflow-hidden">
//       {/* Animated Background */}
//       {waveLines.map((_, i) => (
//         <motion.div
//           key={i}
//           className="absolute h-[2px] bg-[#ff7f50]/20 rounded-full"
//           initial={{
//             width: `${180 + i * 90}px`,
//             x: i % 2 === 0 ? -300 : 1600,
//             y: Math.random() * 800,
//             rotate: Math.random() * 360,
//             opacity: 0,
//           }}
//           animate={{
//             x: i % 2 === 0 ? 1600 : -300,
//             y: Math.random() * 800,
//             rotate: Math.random() * 360,
//             opacity: [0, 0.4, 0],
//           }}
//           transition={{
//             duration: 8 + i * 2,
//             repeat: Infinity,
//             ease: "easeInOut",
//           }}
//         />
//       ))}

//       {/* Left Section */}
//       <div className="hidden lg:flex flex-col items-center justify-center flex-1 z-10">
//         <motion.div
//           animate={{
//             y: [0, -6, 0],
//             rotate: [0, 2, -2, 0],
//           }}
//           transition={{
//             duration: 4,
//             repeat: Infinity,
//           }}
//           className="relative mb-3"
//         >
//           <div className="relative w-16 h-16">
//             <Home className="w-16 h-16 text-[#ff7f50]" strokeWidth={1.8} />
//             <Search
//               className="absolute bottom-0 right-0 w-5 h-5 text-[#ff9f80]"
//               strokeWidth={2}
//             />
//           </div>
//         </motion.div>

//         <h3 className="text-4xl font-bold text-[#ff7f50] text-center tracking-wide">
//           Digital City
//         </h3>

//         <p className="text-[#ffb399]/70 text-base text-center mt-2 max-w-sm leading-relaxed">
//           Your Trusted Partner in Every Property Deal.
//         </p>
//       </div>

//       {/* Auth Card */}
//       <motion.div
//         initial={{ scale: 0.92, opacity: 0 }}
//         animate={{ scale: 1, opacity: 1 }}
//         transition={{ duration: 0.4 }}
//         className="w-full lg:w-[420px] bg-[#2b2b2b]/95 backdrop-blur-md rounded-[26px] shadow-[0_20px_50px_rgba(0,0,0,0.55)] border border-[#ff7f50]/30 px-8 py-8 z-10"
//       >
//         <h2 className="text-3xl font-serif font-semibold text-[#ff7f50] mb-8 text-center">
//           {isLogin ? "Welcome Back" : "Create Account"}
//         </h2>

//         <form className="space-y-4" onSubmit={handleSubmit}>
//           {!isLogin && (
//             <>
//               {/* Role Toggle */}
//               <div className="flex bg-[#1f1f1f] rounded-2xl p-1 border border-[#ff7f50]/20">
//                 <button
//                   type="button"
//                   onClick={() => handleRoleChange("PROPERTY_OWNER")}
//                   className={`w-1/2 py-3 rounded-2xl font-semibold transition-all flex items-center justify-center gap-2 ${
//                     formData.role === "PROPERTY_OWNER"
//                       ? "bg-[#ff7f50] text-white shadow-lg"
//                       : "text-gray-300"
//                   }`}
//                 >
//                   <Landmark className="w-5 h-5" />
//                   Property Owner
//                 </button>

//                 <button
//                   type="button"
//                   onClick={() => handleRoleChange("USER")}
//                   className={`w-1/2 py-3 rounded-2xl font-semibold transition-all flex items-center justify-center gap-2 ${
//                     formData.role === "USER"
//                       ? "bg-[#ff7f50] text-white shadow-lg"
//                       : "text-gray-300"
//                   }`}
//                 >
//                   <BadgeCheck className="w-5 h-5" />
//                   User
//                 </button>
//               </div>

//               <input
//                 name="fullName"
//                 value={formData.fullName}
//                 placeholder="Full Name"
//                 onChange={handleChange}
//                 className="w-full p-4 rounded-2xl bg-white text-black placeholder:text-black/40 border border-[#ff7f50]/20"
//               />

//               <input
//                 name="mobileNumber"
//                 value={formData.mobileNumber}
//                 placeholder="Mobile Number"
//                 onChange={handleChange}
//                 className="w-full p-4 rounded-2xl bg-white text-black placeholder:text-black/40 border border-[#ff7f50]/20"
//               />
//             </>
//           )}

//           <input
//             name="email"
//             value={formData.email}
//             placeholder="Email Address"
//             onChange={handleChange}
//             className="w-full p-4 rounded-2xl bg-white text-black placeholder:text-black/40 border border-[#ff7f50]/20"
//           />

//           <div className="relative">
//             <input
//               type={isPasswordVisible ? "text" : "password"}
//               name="password"
//               value={formData.password}
//               placeholder="Password"
//               onChange={handleChange}
//               className="w-full p-4 pr-12 rounded-2xl bg-white text-black placeholder:text-black/40 border border-[#ff7f50]/20"
//             />

//             <button
//               type="button"
//               onClick={() =>
//                 setIsPasswordVisible(!isPasswordVisible)
//               }
//               className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#ff7f50]"
//             >
//               {isPasswordVisible ? (
//                 <EyeOff className="w-5 h-5" />
//               ) : (
//                 <Eye className="w-5 h-5" />
//               )}
//             </button>
//           </div>

//           <button className="w-full bg-[#ff7f50] text-white py-4 rounded-2xl font-bold text-lg shadow-lg hover:scale-[1.02] transition-all duration-300">
//             {isLogin ? "Login" : "Sign Up"}
//           </button>
//         </form>

//         <p className="text-center mt-6 text-gray-300">
//           {isLogin
//             ? "Don't have an account?"
//             : "Already have an account?"}

//           <span
//             onClick={() => setIsLogin(!isLogin)}
//             className="text-[#ff7f50] ml-2 cursor-pointer font-bold hover:text-[#ff9f80]"
//           >
//             {isLogin ? "Sign Up" : "Login"}
//           </span>
//         </p>
//       </motion.div>
//     </div>
//   );
// }



// import { useState, useEffect } from "react";
// import { authApi } from "../services/api";
// import { jwtDecode } from "jwt-decode";
// import { useNavigate } from "react-router-dom";
// import { motion } from "framer-motion";
// import {
//   Home,
//   Search,
//   Eye,
//   EyeOff,
//   Landmark,
//   BadgeCheck,
// } from "lucide-react";

// export default function Auth() {
//   const OWNER_ID_BY_EMAIL_KEY = "ownerIdByEmail";
//   const OWNER_NAME_KEY = "ownerName";
//   const OWNER_NAME_BY_EMAIL_KEY = "ownerNameByEmail";

//   const [isLogin, setIsLogin] = useState(true);
//   const [isPasswordVisible, setIsPasswordVisible] = useState(false);

//   const navigate = useNavigate();

//   const [formData, setFormData] = useState({
//     fullName: "",
//     mobileNumber: "",
//     email: "",
//     password: "",
//     role: "USER",
//   });

//   useEffect(() => {
//     const userChannel = new BroadcastChannel("user-auth");
//     const adminChannel = new BroadcastChannel("admin-auth");
//     const ownerChannel = new BroadcastChannel("owner-auth");

//     adminChannel.onmessage = (msg) => {
//       if (msg.data === "logout") {
//         localStorage.removeItem("adminToken");
//         navigate("/login");
//       }
//     };

//     userChannel.onmessage = (msg) => {
//       if (msg.data === "logout") {
//         localStorage.removeItem("userToken");
//         navigate("/login");
//       }
//     };

//     ownerChannel.onmessage = (msg) => {
//       if (msg.data === "logout") {
//         localStorage.removeItem("ownerToken");
//         localStorage.removeItem("ownerId");
//         navigate("/login");
//       }
//     };

//     const syncLogout = (event) => {
//       if (event.key === "adminLogout") {
//         localStorage.removeItem("adminToken");
//         navigate("/login");
//       }

//       if (event.key === "ownerLogout") {
//         localStorage.removeItem("ownerToken");
//         localStorage.removeItem("ownerId");
//         navigate("/login");
//       }

//       if (event.key === "userLogout") {
//         localStorage.removeItem("userToken");
//         navigate("/login");
//       }
//     };

//     window.addEventListener("storage", syncLogout);

//     return () => {
//       window.removeEventListener("storage", syncLogout);
//       userChannel.close();
//       adminChannel.close();
//       ownerChannel.close();
//     };
//   }, [navigate]);

//   const handleChange = (e) => {
//     let value = e.target.value;

//     if (e.target.name === "email") {
//       value = value.toLowerCase();
//     }

//     setFormData({
//       ...formData,
//       [e.target.name]: value,
//     });
//   };

//   const handleRoleChange = (role) => {
//     setFormData({
//       ...formData,
//       role,
//     });
//   };

//   const validate = () => {
//     if (!isLogin) {
//       if (!formData.fullName.trim()) {
//         return "Full name is required";
//       }

//       if (!/^[A-Za-z ]+$/.test(formData.fullName)) {
//         return "Only letters allowed";
//       }

//       if (!/^\d{10}$/.test(formData.mobileNumber)) {
//         return "Mobile must be 10 digits";
//       }
//     }

//     if (!formData.email) {
//       return "Email required";
//     }

//     if (!/^[A-Za-z0-9._%+-]+@gmail\.com$/.test(formData.email)) {
//       return "Only Gmail allowed";
//     }

//     if (!formData.password || formData.password.length < 6) {
//       return "Password min 6 characters";
//     }

//     if (
//       !isLogin &&
//       !/^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>])(?=\S+$).{8,}$/.test(
//         formData.password
//       )
//     ) {
//       return "Password must contain uppercase & special character";
//     }

//     return null;
//   };

//   const handleRegister = async () => {
//     const error = validate();
//     if (error) return alert(error);

//     try {
//       const res =
//         formData.role === "PROPERTY_OWNER"
//           ? await authApi.registerOwner(formData)
//           : await authApi.registerUser(formData);

//       if (formData.role === "PROPERTY_OWNER") {
//         const ownerEmail = formData.email.toLowerCase().trim();
//         const ownerName = formData.fullName.trim();
//         const registeredOwnerId = Number(res?.data?.data?.id);

//         if (ownerName) {
//           localStorage.setItem(OWNER_NAME_KEY, ownerName);
//         }

//         if (ownerEmail && ownerName) {
//           const rawNames = localStorage.getItem(OWNER_NAME_BY_EMAIL_KEY);
//           const ownerNameMap = rawNames ? JSON.parse(rawNames) : {};
//           ownerNameMap[ownerEmail] = ownerName;
//           localStorage.setItem(
//             OWNER_NAME_BY_EMAIL_KEY,
//             JSON.stringify(ownerNameMap)
//           );
//         }

//         if (
//           ownerEmail &&
//           Number.isFinite(registeredOwnerId) &&
//           registeredOwnerId > 0
//         ) {
//           const rawMap = localStorage.getItem(OWNER_ID_BY_EMAIL_KEY);
//           const ownerIdMap = rawMap ? JSON.parse(rawMap) : {};

//           ownerIdMap[ownerEmail] = registeredOwnerId;

//           localStorage.setItem(
//             OWNER_ID_BY_EMAIL_KEY,
//             JSON.stringify(ownerIdMap)
//           );

//           localStorage.setItem(
//             `ownerId:${ownerEmail}`,
//             String(registeredOwnerId)
//           );
//         }
//       }

//       alert(res.data.message);

//       const savedEmail = formData.email;
//       const savedPassword = formData.password;

//       setIsLogin(true);

//       setFormData({
//         fullName: "",
//         mobileNumber: "",
//         email: savedEmail,
//         password: savedPassword,
//         role: "USER",
//       });
//     } catch (err) {
//       alert(err.response?.data?.message || "Registration Failed");
//     }
//   };

//   const handleLogin = async () => {
//     const error = validate();
//     if (error) return alert(error);

//     try {
//       const res = await authApi.login({
//         email: formData.email,
//         password: formData.password,
//         deviceType: "WEB",
//       });

//       const token = res.data.token || res.data.data?.token;

//       if (!token) {
//         alert("Token not received");
//         return;
//       }

//       const decoded = jwtDecode(token);
//       const role = decoded.role || decoded.roles?.[0];

//       if (role === "ROLE_ADMIN") {
//         localStorage.setItem("adminToken", token);
//       } else if (role === "ROLE_PROPERTY_OWNER") {
//         localStorage.setItem("ownerToken", token);

//         const ownerEmail = (decoded?.sub || formData.email || "")
//           .toLowerCase()
//           .trim();

//         const ownerName = String(
//           decoded?.fullName || decoded?.name || ""
//         ).trim();

//         if (ownerName) {
//           localStorage.setItem(OWNER_NAME_KEY, ownerName);
//         }

//         if (ownerEmail) {
//           localStorage.setItem("ownerEmail", ownerEmail);

//           if (ownerName) {
//             const rawNames = localStorage.getItem(OWNER_NAME_BY_EMAIL_KEY);
//             const ownerNameMap = rawNames ? JSON.parse(rawNames) : {};
//             ownerNameMap[ownerEmail] = ownerName;
//             localStorage.setItem(
//               OWNER_NAME_BY_EMAIL_KEY,
//               JSON.stringify(ownerNameMap)
//             );
//           }

//           const rawMap = localStorage.getItem(OWNER_ID_BY_EMAIL_KEY);
//           const ownerIdMap = rawMap ? JSON.parse(rawMap) : {};

//           const knownOwnerId = Number(
//             ownerIdMap?.[ownerEmail] ||
//               localStorage.getItem(`ownerId:${ownerEmail}`)
//           );

//           if (Number.isFinite(knownOwnerId) && knownOwnerId > 0) {
//             localStorage.setItem("ownerId", String(knownOwnerId));
//           } else {
//             localStorage.removeItem("ownerId");
//           }
//         }
//       } else {
//         localStorage.setItem("userToken", token);
//       }

//       alert("Login Successful");

//       if (role === "ROLE_ADMIN") navigate("/admin");
//       else if (role === "ROLE_PROPERTY_OWNER") navigate("/owner");
//       else if (role === "ROLE_USER") navigate("/user");
//       else alert("Unknown role");
//     } catch (err) {
//       alert(err.response?.data?.message || "Login Failed");
//     }
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     isLogin ? handleLogin() : handleRegister();
//   };

//   const waveLines = Array.from({ length: 4 });

//   return (
//     <div className="min-h-screen flex flex-col lg:flex-row items-center justify-center px-6 lg:px-24 bg-gradient-to-r from-[#1c1c1c] via-[#2a2a2a] to-[#3a2b2b] relative overflow-hidden">
//       {waveLines.map((_, i) => (
//         <motion.div
//           key={i}
//           className="absolute h-[2px] bg-[#ff7f50]/20 rounded-full"
//           initial={{
//             width: `${180 + i * 90}px`,
//             x: i % 2 === 0 ? -300 : 1600,
//             y: Math.random() * 800,
//             rotate: Math.random() * 360,
//             opacity: 0,
//           }}
//           animate={{
//             x: i % 2 === 0 ? 1600 : -300,
//             y: Math.random() * 800,
//             rotate: Math.random() * 360,
//             opacity: [0, 0.4, 0],
//           }}
//           transition={{
//             duration: 8 + i * 2,
//             repeat: Infinity,
//             ease: "easeInOut",
//           }}
//         />
//       ))}

//       <div className="hidden lg:flex flex-col items-center justify-center flex-1 z-10">
//         <motion.div
//           animate={{
//             y: [0, -6, 0],
//             rotate: [0, 2, -2, 0],
//           }}
//           transition={{
//             duration: 4,
//             repeat: Infinity,
//           }}
//           className="relative mb-3"
//         >
//           <div className="relative w-16 h-16">
//             <Home className="w-16 h-16 text-[#ff7f50]" strokeWidth={1.8} />
//             <Search
//               className="absolute bottom-0 right-0 w-5 h-5 text-[#ff9f80]"
//               strokeWidth={2}
//             />
//           </div>
//         </motion.div>

//         <h3 className="text-4xl font-bold text-[#ff7f50] text-center tracking-wide">
//           Digital City
//         </h3>

//         <p className="text-[#ffb399]/70 text-base text-center mt-2 max-w-sm leading-relaxed">
//           Your Trusted Partner in Every Property Deal.
//         </p>
//       </div>

//       <motion.div
//         initial={{ scale: 0.92, opacity: 0 }}
//         animate={{ scale: 1, opacity: 1 }}
//         transition={{ duration: 0.4 }}
//         className="w-full lg:w-[420px] bg-[#2b2b2b]/95 backdrop-blur-md rounded-[26px] shadow-[0_20px_50px_rgba(0,0,0,0.55)] border border-[#ff7f50]/30 px-8 py-8 z-10"
//       >
//         <h2 className="text-3xl font-serif font-semibold text-[#ff7f50] mb-8 text-center">
//           {isLogin ? "Welcome Back" : "Create Account"}
//         </h2>

//         <form className="space-y-4" onSubmit={handleSubmit}>
//           {!isLogin && (
//             <>
//               <div className="flex bg-[#1f1f1f] rounded-2xl p-1 border border-[#ff7f50]/20">
//                 <button
//                   type="button"
//                   onClick={() => handleRoleChange("PROPERTY_OWNER")}
//                   className={`w-1/2 py-3 rounded-2xl font-semibold transition-all flex items-center justify-center gap-2 ${
//                     formData.role === "PROPERTY_OWNER"
//                       ? "bg-[#ff7f50] text-white shadow-lg"
//                       : "text-gray-300"
//                   }`}
//                 >
//                   <Landmark className="w-5 h-5" />
//                   Property Owner
//                 </button>

//                 <button
//                   type="button"
//                   onClick={() => handleRoleChange("USER")}
//                   className={`w-1/2 py-3 rounded-2xl font-semibold transition-all flex items-center justify-center gap-2 ${
//                     formData.role === "USER"
//                       ? "bg-[#ff7f50] text-white shadow-lg"
//                       : "text-gray-300"
//                   }`}
//                 >
//                   <BadgeCheck className="w-5 h-5" />
//                   User
//                 </button>
//               </div>

//               <input
//                 name="fullName"
//                 value={formData.fullName}
//                 placeholder="Full Name"
//                 onChange={handleChange}
//                 className="w-full p-4 rounded-2xl bg-white text-black placeholder:text-black/40 border border-[#ff7f50]/20"
//               />

//               <input
//                 name="mobileNumber"
//                 value={formData.mobileNumber}
//                 placeholder="Mobile Number"
//                 onChange={handleChange}
//                 className="w-full p-4 rounded-2xl bg-white text-black placeholder:text-black/40 border border-[#ff7f50]/20"
//               />
//             </>
//           )}

//           <input
//             name="email"
//             value={formData.email}
//             placeholder="Email Address"
//             onChange={handleChange}
//             className="w-full p-4 rounded-2xl bg-white text-black placeholder:text-black/40 border border-[#ff7f50]/20"
//           />

//           <div className="relative">
//             <input
//               type={isPasswordVisible ? "text" : "password"}
//               name="password"
//               value={formData.password}
//               placeholder="Password"
//               onChange={handleChange}
//               className="w-full p-4 pr-12 rounded-2xl bg-white text-black placeholder:text-black/40 border border-[#ff7f50]/20"
//             />

//             <button
//               type="button"
//               onClick={() => setIsPasswordVisible(!isPasswordVisible)}
//               className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#ff7f50]"
//             >
//               {isPasswordVisible ? (
//                 <EyeOff className="w-5 h-5" />
//               ) : (
//                 <Eye className="w-5 h-5" />
//               )}
//             </button>
//           </div>

//           {isLogin && (
//             <div className="flex justify-end">
//               <button
//                 type="button"
//                 onClick={() => navigate("/forgot-password")}
//                 className="text-sm text-[#ffb399] hover:text-[#ff7f50] transition-colors"
//               >
//                 Forgot Password?
//               </button>
//             </div>
//           )}

//           <button className="w-full bg-[#ff7f50] text-white py-4 rounded-2xl font-bold text-lg shadow-lg hover:scale-[1.02] transition-all duration-300">
//             {isLogin ? "Login" : "Sign Up"}
//           </button>
//         </form>

//         <p className="text-center mt-6 text-gray-300">
//           {isLogin
//             ? "Don't have an account?"
//             : "Already have an account?"}

//           <span
//             onClick={() => setIsLogin(!isLogin)}
//             className="text-[#ff7f50] ml-2 cursor-pointer font-bold hover:text-[#ff9f80]"
//           >
//             {isLogin ? "Sign Up" : "Login"}
//           </span>
//         </p>
//       </motion.div>
//     </div>
//   );
// }

// import { useState, useEffect } from "react";
// import { authApi } from "../services/api";
// import { jwtDecode } from "jwt-decode";
// import { useNavigate } from "react-router-dom";
// import { motion } from "framer-motion";
// import {
//   Home,
//   Search,
//   Eye,
//   EyeOff,
//   Landmark,
//   BadgeCheck,
// } from "lucide-react";

// export default function Auth() {
//   const OWNER_ID_BY_EMAIL_KEY = "ownerIdByEmail";
//   const OWNER_NAME_KEY = "ownerName";
//   const OWNER_NAME_BY_EMAIL_KEY = "ownerNameByEmail";

//   const [isLogin, setIsLogin] = useState(true);
//   const [isPasswordVisible, setIsPasswordVisible] = useState(false);

//   const navigate = useNavigate();

//   const [formData, setFormData] = useState({
//     fullName: "",
//     mobileNumber: "",
//     email: "",
//     password: "",
//     role: "USER",
//   });

//   useEffect(() => {
//     const userChannel = new BroadcastChannel("user-auth");
//     const adminChannel = new BroadcastChannel("admin-auth");
//     const ownerChannel = new BroadcastChannel("owner-auth");

//     adminChannel.onmessage = (msg) => {
//       if (msg.data === "logout") {
//         localStorage.removeItem("adminToken");
//         navigate("/login");
//       }
//     };

//     userChannel.onmessage = (msg) => {
//       if (msg.data === "logout") {
//         localStorage.removeItem("userToken");
//         navigate("/login");
//       }
//     };

//     ownerChannel.onmessage = (msg) => {
//       if (msg.data === "logout") {
//         localStorage.removeItem("ownerToken");
//         localStorage.removeItem("ownerId");
//         navigate("/login");
//       }
//     };

//     const syncLogout = (event) => {
//       if (event.key === "adminLogout") {
//         localStorage.removeItem("adminToken");
//         navigate("/login");
//       }

//       if (event.key === "ownerLogout") {
//         localStorage.removeItem("ownerToken");
//         localStorage.removeItem("ownerId");
//         navigate("/login");
//       }

//       if (event.key === "userLogout") {
//         localStorage.removeItem("userToken");
//         navigate("/login");
//       }
//     };

//     window.addEventListener("storage", syncLogout);

//     return () => {
//       window.removeEventListener("storage", syncLogout);
//       userChannel.close();
//       adminChannel.close();
//       ownerChannel.close();
//     };
//   }, [navigate]);

//   const handleChange = (e) => {
//     let value = e.target.value;

//     if (e.target.name === "email") {
//       value = value.toLowerCase();
//     }

//     setFormData({
//       ...formData,
//       [e.target.name]: value,
//     });
//   };

//   const handleRoleChange = (role) => {
//     setFormData({
//       ...formData,
//       role,
//     });
//   };

//   const validate = () => {
//     if (!isLogin) {
//       if (!formData.fullName.trim()) {
//         return "Full name is required";
//       }

//       if (!/^[A-Za-z ]+$/.test(formData.fullName)) {
//         return "Only letters allowed";
//       }

//       if (!/^\d{10}$/.test(formData.mobileNumber)) {
//         return "Mobile must be 10 digits";
//       }
//     }

//     if (!formData.email) {
//       return "Email required";
//     }

//     if (!/^[A-Za-z0-9._%+-]+@gmail\.com$/.test(formData.email)) {
//       return "Only Gmail allowed";
//     }

//     if (!formData.password || formData.password.length < 6) {
//       return "Password min 6 characters";
//     }

//     if (
//       !isLogin &&
//       !/^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>])(?=\S+$).{8,}$/.test(
//         formData.password
//       )
//     ) {
//       return "Password must contain uppercase & special character";
//     }

//     return null;
//   };

//   const handleRegister = async () => {
//     const error = validate();
//     if (error) return alert(error);

//     try {
//       const res =
//         formData.role === "PROPERTY_OWNER"
//           ? await authApi.registerOwner(formData)
//           : await authApi.registerUser(formData);

//       if (formData.role === "PROPERTY_OWNER") {
//         const ownerEmail = formData.email.toLowerCase().trim();
//         const ownerName = formData.fullName.trim();
//         const registeredOwnerId = Number(res?.data?.data?.id);

//         if (ownerName) {
//           localStorage.setItem(OWNER_NAME_KEY, ownerName);
//         }

//         if (ownerEmail && ownerName) {
//           const rawNames = localStorage.getItem(OWNER_NAME_BY_EMAIL_KEY);
//           const ownerNameMap = rawNames ? JSON.parse(rawNames) : {};
//           ownerNameMap[ownerEmail] = ownerName;
//           localStorage.setItem(
//             OWNER_NAME_BY_EMAIL_KEY,
//             JSON.stringify(ownerNameMap)
//           );
//         }

//         if (
//           ownerEmail &&
//           Number.isFinite(registeredOwnerId) &&
//           registeredOwnerId > 0
//         ) {
//           const rawMap = localStorage.getItem(OWNER_ID_BY_EMAIL_KEY);
//           const ownerIdMap = rawMap ? JSON.parse(rawMap) : {};

//           ownerIdMap[ownerEmail] = registeredOwnerId;

//           localStorage.setItem(
//             OWNER_ID_BY_EMAIL_KEY,
//             JSON.stringify(ownerIdMap)
//           );

//           localStorage.setItem(
//             `ownerId:${ownerEmail}`,
//             String(registeredOwnerId)
//           );
//         }
//       }

//       alert(res.data.message);

//       const savedEmail = formData.email;
//       const savedPassword = formData.password;

//       setIsLogin(true);

//       setFormData({
//         fullName: "",
//         mobileNumber: "",
//         email: savedEmail,
//         password: savedPassword,
//         role: "USER",
//       });
//     } catch (err) {
//       alert(err.response?.data?.message || "Registration Failed");
//     }
//   };

//   const handleLogin = async () => {
//     const error = validate();
//     if (error) return alert(error);

//     try {
//       const res = await authApi.login({
//         email: formData.email,
//         password: formData.password,
//         deviceType: "WEB",
//       });

//       const token = res.data.token || res.data.data?.token;

//       if (!token) {
//         alert("Token not received");
//         return;
//       }

//       const decoded = jwtDecode(token);
//       const role = decoded.role || decoded.roles?.[0];

//       if (role === "ROLE_ADMIN") {
//         localStorage.setItem("adminToken", token);
//       } else if (role === "ROLE_PROPERTY_OWNER") {
//         localStorage.setItem("ownerToken", token);

//         const ownerEmail = (decoded?.sub || formData.email || "")
//           .toLowerCase()
//           .trim();

//         const ownerName = String(
//           decoded?.fullName || decoded?.name || ""
//         ).trim();

//         if (ownerName) {
//           localStorage.setItem(OWNER_NAME_KEY, ownerName);
//         }

//         if (ownerEmail) {
//           localStorage.setItem("ownerEmail", ownerEmail);

//           if (ownerName) {
//             const rawNames = localStorage.getItem(OWNER_NAME_BY_EMAIL_KEY);
//             const ownerNameMap = rawNames ? JSON.parse(rawNames) : {};
//             ownerNameMap[ownerEmail] = ownerName;
//             localStorage.setItem(
//               OWNER_NAME_BY_EMAIL_KEY,
//               JSON.stringify(ownerNameMap)
//             );
//           }

//           const rawMap = localStorage.getItem(OWNER_ID_BY_EMAIL_KEY);
//           const ownerIdMap = rawMap ? JSON.parse(rawMap) : {};

//           const knownOwnerId = Number(
//             ownerIdMap?.[ownerEmail] ||
//               localStorage.getItem(`ownerId:${ownerEmail}`)
//           );

//           if (Number.isFinite(knownOwnerId) && knownOwnerId > 0) {
//             localStorage.setItem("ownerId", String(knownOwnerId));
//           } else {
//             localStorage.removeItem("ownerId");
//           }
//         }
//       } else {
//         localStorage.setItem("userToken", token);
//       }

//       alert("Login Successful");

//       if (role === "ROLE_ADMIN") navigate("/admin");
//       else if (role === "ROLE_PROPERTY_OWNER") navigate("/owner");
//       else if (role === "ROLE_USER") navigate("/user");
//       else alert("Unknown role");
//     } catch (err) {
//       alert(err.response?.data?.message || "Login Failed");
//     }
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     isLogin ? handleLogin() : handleRegister();
//   };

//   return (
//     <div className="min-h-screen flex flex-col lg:flex-row items-center justify-center px-4 lg:px-16 bg-[#050816] relative overflow-hidden">

//       {/* LEFT SIDE */}

//       <div className="hidden lg:flex flex-col items-center justify-center flex-1 z-10 text-center px-10">

//         <motion.div
//           animate={{
//             y: [0, -6, 0],
//             rotate: [0, 2, -2, 0],
//           }}
//           transition={{
//             duration: 4,
//             repeat: Infinity,
//           }}
//           className="relative mb-4"
//         >
//           <div className="relative w-20 h-20">
//             <Home className="w-20 h-20 text-[#ff7a00]" strokeWidth={1.7} />

//             <Search
//               className="absolute bottom-1 right-0 w-6 h-6 text-[#ff9d47]"
//               strokeWidth={2}
//             />
//           </div>
//         </motion.div>

//         <h1 className="text-6xl font-bold leading-none tracking-wide text-white">
//           Digital <span className="text-[#ff7a00]">City</span>
//         </h1>

//         <p className="text-[#e5d7c5] text-xl mt-5 max-w-lg leading-relaxed">
//           Your Trusted Partner in Every Property Deal.
//         </p>

//         <div className="grid grid-cols-4 gap-8 mt-16 text-[#f5e7d6]">

//           <div className="flex flex-col items-center gap-2">
//             <BadgeCheck className="w-10 h-10 text-[#ff7a00]" />
//             <p className="text-sm">Trust</p>
//           </div>

//           <div className="flex flex-col items-center gap-2">
//             <Landmark className="w-10 h-10 text-[#ff7a00]" />
//             <p className="text-sm">Partnership</p>
//           </div>

//           <div className="flex flex-col items-center gap-2">
//             <Home className="w-10 h-10 text-[#ff7a00]" />
//             <p className="text-sm">Secure Deals</p>
//           </div>

//           <div className="flex flex-col items-center gap-2">
//             <Search className="w-10 h-10 text-[#ff7a00]" />
//             <p className="text-sm">Always With You</p>
//           </div>
//         </div>

//         <div className="mt-16">
//           <p className="text-[#f5e7d6] text-2xl font-medium">
//             योग्य घर, योग्य ठिकाण, योग्य किंमत.
//           </p>

//           <p className="text-[#ff7a00] text-3xl font-semibold mt-3">
//             Right Home. Right Place. Right Price.
//           </p>
//         </div>
//       </div>

//       {/* RIGHT SIDE */}

//       <motion.div
//         initial={{ scale: 0.92, opacity: 0 }}
//         animate={{ scale: 1, opacity: 1 }}
//         transition={{ duration: 0.4 }}
//         className="w-full lg:w-[430px] bg-[#f7f0e8] rounded-[24px] shadow-[0_25px_80px_rgba(0,0,0,0.45)] border-2 border-[#d8c2a8] px-8 py-8 z-10"
//       >

//         <h2 className="text-5xl font-bold text-center mb-8 text-[#1a1a1a]">
//           <span className="text-[#ff7a00]">
//             {isLogin ? "Welcome" : "Create"}
//           </span>{" "}
//           {isLogin ? "Back" : "Account"}
//         </h2>

//         <form className="space-y-4" onSubmit={handleSubmit}>

//           {!isLogin && (
//             <>
//               <div className="flex bg-[#efe4d7] rounded-xl p-1 border border-[#d7c4ae]">

//                 <button
//                   type="button"
//                   onClick={() => handleRoleChange("PROPERTY_OWNER")}
//                   className={`w-1/2 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 text-[15px] ${
//                     formData.role === "PROPERTY_OWNER"
//                       ? "bg-[#f97316] text-white shadow-md"
//                       : "text-[#3d3127]"
//                   }`}
//                 >
//                   <Landmark className="w-5 h-5" />
//                   Property Owner
//                 </button>

//                 <button
//                   type="button"
//                   onClick={() => handleRoleChange("USER")}
//                   className={`w-1/2 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 text-[15px] ${
//                     formData.role === "USER"
//                       ? "bg-[#f97316] text-white shadow-md"
//                       : "text-[#3d3127]"
//                   }`}
//                 >
//                   <BadgeCheck className="w-5 h-5" />
//                   User
//                 </button>
//               </div>

//               <input
//                 name="fullName"
//                 value={formData.fullName}
//                 placeholder="Full Name"
//                 onChange={handleChange}
//                 className="w-full h-[56px] px-5 rounded-xl bg-[#f9f3ed] text-[#222] placeholder:text-[#8b8178] border border-[#d9c7b2] focus:outline-none focus:ring-2 focus:ring-[#ff7a00]/30"
//               />

//               <input
//                 name="mobileNumber"
//                 value={formData.mobileNumber}
//                 placeholder="Mobile Number"
//                 onChange={handleChange}
//                 className="w-full h-[56px] px-5 rounded-xl bg-[#f9f3ed] text-[#222] placeholder:text-[#8b8178] border border-[#d9c7b2] focus:outline-none focus:ring-2 focus:ring-[#ff7a00]/30"
//               />
//             </>
//           )}

//           <input
//             name="email"
//             value={formData.email}
//             placeholder="Email Address"
//             onChange={handleChange}
//             className="w-full h-[56px] px-5 rounded-xl bg-[#f9f3ed] text-[#222] placeholder:text-[#8b8178] border border-[#d9c7b2] focus:outline-none focus:ring-2 focus:ring-[#ff7a00]/30"
//           />

//           <div className="relative">

//             <input
//               type={isPasswordVisible ? "text" : "password"}
//               name="password"
//               value={formData.password}
//               placeholder="Password"
//               onChange={handleChange}
//               className="w-full h-[56px] px-5 pr-12 rounded-xl bg-[#f9f3ed] text-[#222] placeholder:text-[#8b8178] border border-[#d9c7b2] focus:outline-none focus:ring-2 focus:ring-[#ff7a00]/30"
//             />

//             <button
//               type="button"
//               onClick={() => setIsPasswordVisible(!isPasswordVisible)}
//               className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8a8178] hover:text-[#ff7a00]"
//             >
//               {isPasswordVisible ? (
//                 <EyeOff className="w-5 h-5" />
//               ) : (
//                 <Eye className="w-5 h-5" />
//               )}
//             </button>
//           </div>

//           {isLogin && (
//             <div className="flex justify-end">
//               <button
//                 type="button"
//                 onClick={() => navigate("/forgot-password")}
//                 className="text-sm text-[#7d6c5c] hover:text-[#ff7a00] transition-colors"
//               >
//                 Forgot Password?
//               </button>
//             </div>
//           )}

//           <button className="w-full bg-[#f97316] hover:bg-[#ea6a0a] text-white py-4 rounded-xl font-bold text-xl shadow-lg transition-all duration-300 mt-2">
//             {isLogin ? "Login" : "Sign Up"}
//           </button>
//         </form>

//         <p className="text-center mt-6 text-[#5d5145] text-[15px]">
//           {isLogin
//             ? "Don't have an account?"
//             : "Already have an account?"}

//           <span
//             onClick={() => setIsLogin(!isLogin)}
//             className="text-[#ff7a00] ml-2 cursor-pointer font-bold hover:text-[#e36a00]"
//           >
//             {isLogin ? "Sign Up" : "Login"}
//           </span>
//         </p>
//       </motion.div>
//     </div>
//   );
// }


// import { useState, useEffect } from "react";
// import { authApi } from "../services/api";
// import { jwtDecode } from "jwt-decode";
// import { useNavigate } from "react-router-dom";
// import { motion } from "framer-motion";
// import {
//   Home,
//   Search,
//   Eye,
//   EyeOff,
//   Landmark,
//   BadgeCheck,
// } from "lucide-react";

// export default function Auth() {
//   const OWNER_ID_BY_EMAIL_KEY = "ownerIdByEmail";
//   const OWNER_NAME_KEY = "ownerName";
//   const OWNER_NAME_BY_EMAIL_KEY = "ownerNameByEmail";

//   const [isLogin, setIsLogin] = useState(true);
//   const [isPasswordVisible, setIsPasswordVisible] = useState(false);

//   // OTP STATES
//   const [emailVerified, setEmailVerified] = useState(false);
//   const [showOtpBox, setShowOtpBox] = useState(false);
//   const [otp, setOtp] = useState("");
//   const [loading, setLoading] = useState(false);

//   const navigate = useNavigate();

//   const [formData, setFormData] = useState({
//     fullName: "",
//     mobileNumber: "",
//     email: "",
//     password: "",
//     role: "USER",
//   });

//   useEffect(() => {
//     const userChannel = new BroadcastChannel("user-auth");
//     const adminChannel = new BroadcastChannel("admin-auth");
//     const ownerChannel = new BroadcastChannel("owner-auth");

//     adminChannel.onmessage = (msg) => {
//       if (msg.data === "logout") {
//         localStorage.removeItem("adminToken");
//         navigate("/login");
//       }
//     };

//     userChannel.onmessage = (msg) => {
//       if (msg.data === "logout") {
//         localStorage.removeItem("userToken");
//         navigate("/login");
//       }
//     };

//     ownerChannel.onmessage = (msg) => {
//       if (msg.data === "logout") {
//         localStorage.removeItem("ownerToken");
//         localStorage.removeItem("ownerId");
//         navigate("/login");
//       }
//     };

//     const syncLogout = (event) => {
//       if (event.key === "adminLogout") {
//         localStorage.removeItem("adminToken");
//         navigate("/login");
//       }

//       if (event.key === "ownerLogout") {
//         localStorage.removeItem("ownerToken");
//         localStorage.removeItem("ownerId");
//         navigate("/login");
//       }

//       if (event.key === "userLogout") {
//         localStorage.removeItem("userToken");
//         navigate("/login");
//       }
//     };

//     window.addEventListener("storage", syncLogout);

//     return () => {
//       window.removeEventListener("storage", syncLogout);
//       userChannel.close();
//       adminChannel.close();
//       ownerChannel.close();
//     };
//   }, [navigate]);

//   const handleChange = (e) => {
//     let value = e.target.value;

//     if (e.target.name === "email") {
//       value = value.toLowerCase();

//       // RESET OTP VERIFY WHEN EMAIL CHANGES
//       setEmailVerified(false);
//       setShowOtpBox(false);
//     }

//     setFormData({
//       ...formData,
//       [e.target.name]: value,
//     });
//   };

//   const handleRoleChange = (role) => {
//     setFormData({
//       ...formData,
//       role,
//     });
//   };

//   const validate = () => {
//     if (!isLogin) {
//       if (!formData.fullName.trim()) {
//         return "Full name is required";
//       }

//       if (!/^[A-Za-z ]+$/.test(formData.fullName)) {
//         return "Only letters allowed";
//       }

//       if (!/^\d{10}$/.test(formData.mobileNumber)) {
//         return "Mobile must be 10 digits";
//       }

//       // EMAIL VERIFY CHECK
//       if (!emailVerified) {
//         return "Please verify email first";
//       }
//     }

//     if (!formData.email) {
//       return "Email required";
//     }

//     if (!/^[A-Za-z0-9._%+-]+@gmail\.com$/.test(formData.email)) {
//       return "Only Gmail allowed";
//     }

//     if (!formData.password || formData.password.length < 6) {
//       return "Password min 6 characters";
//     }

//     // if (
//     //   !isLogin &&
//     //   !/^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>])(?=\S+$).{8,}$/.test(
//     //     formData.password
//     //   )
//     // ) {
//     //   return "Password must contain uppercase & special character";
//     // }

//     return null;
//   };

//   // SEND EMAIL OTP
//   const sendEmailOtp = async () => {
//     if (!formData.email) {
//       alert("Enter Email First");
//       return;
//     }

//     if (!/^[A-Za-z0-9._%+-]+@gmail\.com$/.test(formData.email)) {
//       alert("Only Gmail allowed");
//       return;
//     }

//     try {
//       setLoading(true);

//       const res = await authApi.sendRegisterOtp({
//         email: formData.email,
//       });

//       alert(res.data.message);

//       setShowOtpBox(true);
//     } catch (err) {
//       alert(err.response?.data?.message || "Failed To Send OTP");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // VERIFY OTP
//   const verifyOtp = async () => {
//     if (!otp) {
//       alert("Enter OTP");
//       return;
//     }

//     try {
//       setLoading(true);

//       const res = await authApi.verifyRegisterOtp({
//         email: formData.email,
//         otp: otp,
//       });

//       alert(res.data.message);

//       setEmailVerified(true);

//       setShowOtpBox(false);
//     } catch (err) {
//       alert(err.response?.data?.message || "Invalid OTP");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleRegister = async () => {
//     const error = validate();

//     if (error) return alert(error);

//     try {
//       const res =
//         formData.role === "PROPERTY_OWNER"
//           ? await authApi.registerOwner(formData)
//           : await authApi.registerUser(formData);

//       if (formData.role === "PROPERTY_OWNER") {
//         const ownerEmail = formData.email.toLowerCase().trim();
//         const ownerName = formData.fullName.trim();
//         const registeredOwnerId = Number(res?.data?.data?.id);

//         if (ownerName) {
//           localStorage.setItem(OWNER_NAME_KEY, ownerName);
//         }

//         if (ownerEmail && ownerName) {
//           const rawNames = localStorage.getItem(OWNER_NAME_BY_EMAIL_KEY);
//           const ownerNameMap = rawNames ? JSON.parse(rawNames) : {};

//           ownerNameMap[ownerEmail] = ownerName;

//           localStorage.setItem(
//             OWNER_NAME_BY_EMAIL_KEY,
//             JSON.stringify(ownerNameMap)
//           );
//         }

//         if (
//           ownerEmail &&
//           Number.isFinite(registeredOwnerId) &&
//           registeredOwnerId > 0
//         ) {
//           const rawMap = localStorage.getItem(OWNER_ID_BY_EMAIL_KEY);

//           const ownerIdMap = rawMap ? JSON.parse(rawMap) : {};

//           ownerIdMap[ownerEmail] = registeredOwnerId;

//           localStorage.setItem(
//             OWNER_ID_BY_EMAIL_KEY,
//             JSON.stringify(ownerIdMap)
//           );

//           localStorage.setItem(
//             `ownerId:${ownerEmail}`,
//             String(registeredOwnerId)
//           );
//         }
//       }

//       alert(res.data.message);

//       const savedEmail = formData.email;
//       const savedPassword = formData.password;

//       setIsLogin(true);

//       // RESET OTP STATES
//       setEmailVerified(false);
//       setOtp("");
//       setShowOtpBox(false);

//       setFormData({
//         fullName: "",
//         mobileNumber: "",
//         email: savedEmail,
//         password: savedPassword,
//         role: "USER",
//       });
//     } catch (err) {
//       alert(err.response?.data?.message || "Registration Failed");
//     }
//   };

//   const handleLogin = async () => {
//     const error = validate();

//     if (error) return alert(error);

//     try {
//       const res = await authApi.login({
//         email: formData.email,
//         password: formData.password,
//         deviceType: "WEB",
//       });

//       const token = res.data.token || res.data.data?.token;

//       if (!token) {
//         alert("Token not received");
//         return;
//       }

//       const decoded = jwtDecode(token);
//       const role = decoded.role || decoded.roles?.[0];

//       if (role === "ROLE_ADMIN") {
//         localStorage.setItem("adminToken", token);
//       } else if (role === "ROLE_PROPERTY_OWNER") {
//         localStorage.setItem("ownerToken", token);

//         const ownerEmail = (decoded?.sub || formData.email || "")
//           .toLowerCase()
//           .trim();

//         const ownerName = String(
//           decoded?.fullName || decoded?.name || ""
//         ).trim();

//         if (ownerName) {
//           localStorage.setItem(OWNER_NAME_KEY, ownerName);
//         }

//         if (ownerEmail) {
//           localStorage.setItem("ownerEmail", ownerEmail);

//           if (ownerName) {
//             const rawNames = localStorage.getItem(OWNER_NAME_BY_EMAIL_KEY);
//             const ownerNameMap = rawNames ? JSON.parse(rawNames) : {};

//             ownerNameMap[ownerEmail] = ownerName;

//             localStorage.setItem(
//               OWNER_NAME_BY_EMAIL_KEY,
//               JSON.stringify(ownerNameMap)
//             );
//           }

//           const rawMap = localStorage.getItem(OWNER_ID_BY_EMAIL_KEY);

//           const ownerIdMap = rawMap ? JSON.parse(rawMap) : {};

//           const knownOwnerId = Number(
//             ownerIdMap?.[ownerEmail] ||
//               localStorage.getItem(`ownerId:${ownerEmail}`)
//           );

//           if (Number.isFinite(knownOwnerId) && knownOwnerId > 0) {
//             localStorage.setItem("ownerId", String(knownOwnerId));
//           } else {
//             localStorage.removeItem("ownerId");
//           }
//         }
//       } else {
//         localStorage.setItem("userToken", token);
//       }

//       alert("Login Successful");

//       if (role === "ROLE_ADMIN") navigate("/admin");
//       else if (role === "ROLE_PROPERTY_OWNER") navigate("/owner");
//       else if (role === "ROLE_USER") navigate("/user");
//       else alert("Unknown role");
//     } catch (err) {
//       alert(err.response?.data?.message || "Login Failed");
//     }
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     isLogin ? handleLogin() : handleRegister();
//   };

//   return (
//     <div className="min-h-screen flex flex-col lg:flex-row items-center justify-center px-4 lg:px-16 bg-[#050816] relative overflow-hidden">

//       {/* LEFT SIDE */}

//       <div className="hidden lg:flex flex-col items-center justify-center flex-1 z-10 text-center px-10">

//         <motion.div
//           animate={{
//             y: [0, -6, 0],
//             rotate: [0, 2, -2, 0],
//           }}
//           transition={{
//             duration: 4,
//             repeat: Infinity,
//           }}
//           className="relative mb-4"
//         >
//           <div className="relative w-20 h-20">
//             <Home className="w-20 h-20 text-[#ff7a00]" strokeWidth={1.7} />

//             <Search
//               className="absolute bottom-1 right-0 w-6 h-6 text-[#ff9d47]"
//               strokeWidth={2}
//             />
//           </div>
//         </motion.div>

//         <h1 className="text-6xl font-bold leading-none tracking-wide text-white">
//           Digital <span className="text-[#ff7a00]">City</span>
//         </h1>

//         <p className="text-[#e5d7c5] text-xl mt-5 max-w-lg leading-relaxed">
//           Your Trusted Partner in Every Property Deal.
//         </p>

//         <div className="grid grid-cols-4 gap-8 mt-16 text-[#f5e7d6]">

//           <div className="flex flex-col items-center gap-2">
//             <BadgeCheck className="w-10 h-10 text-[#ff7a00]" />
//             <p className="text-sm">Trust</p>
//           </div>

//           <div className="flex flex-col items-center gap-2">
//             <Landmark className="w-10 h-10 text-[#ff7a00]" />
//             <p className="text-sm">Partnership</p>
//           </div>

//           <div className="flex flex-col items-center gap-2">
//             <Home className="w-10 h-10 text-[#ff7a00]" />
//             <p className="text-sm">Secure Deals</p>
//           </div>

//           <div className="flex flex-col items-center gap-2">
//             <Search className="w-10 h-10 text-[#ff7a00]" />
//             <p className="text-sm">Always With You</p>
//           </div>
//         </div>

//         <div className="mt-16">
//           <p className="text-[#f5e7d6] text-2xl font-medium">
//             योग्य घर, योग्य ठिकाण, योग्य किंमत.
//           </p>

//           <p className="text-[#ff7a00] text-3xl font-semibold mt-3">
//             Right Home. Right Place. Right Price.
//           </p>
//         </div>
//       </div>

//       {/* RIGHT SIDE */}

//       <motion.div
//         initial={{ scale: 0.92, opacity: 0 }}
//         animate={{ scale: 1, opacity: 1 }}
//         transition={{ duration: 0.4 }}
//         className="w-full lg:w-[430px] bg-[#f7f0e8] rounded-[24px] shadow-[0_25px_80px_rgba(0,0,0,0.45)] border-2 border-[#d8c2a8] px-8 py-8 z-10"
//       >

//         <h2 className="text-5xl font-bold text-center mb-8 text-[#1a1a1a]">
//           <span className="text-[#ff7a00]">
//             {isLogin ? "Welcome" : "Create"}
//           </span>{" "}
//           {isLogin ? "Back" : "Account"}
//         </h2>

//         <form className="space-y-4" onSubmit={handleSubmit}>

//           {!isLogin && (
//             <>
//               <div className="flex bg-[#efe4d7] rounded-xl p-1 border border-[#d7c4ae]">

//                 <button
//                   type="button"
//                   onClick={() => handleRoleChange("PROPERTY_OWNER")}
//                   className={`w-1/2 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 text-[15px] ${
//                     formData.role === "PROPERTY_OWNER"
//                       ? "bg-[#f97316] text-white shadow-md"
//                       : "text-[#3d3127]"
//                   }`}
//                 >
//                   <Landmark className="w-5 h-5" />
//                   Property Owner
//                 </button>

//                 <button
//                   type="button"
//                   onClick={() => handleRoleChange("USER")}
//                   className={`w-1/2 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 text-[15px] ${
//                     formData.role === "USER"
//                       ? "bg-[#f97316] text-white shadow-md"
//                       : "text-[#3d3127]"
//                   }`}
//                 >
//                   <BadgeCheck className="w-5 h-5" />
//                   User
//                 </button>
//               </div>

//               <input
//                 name="fullName"
//                 value={formData.fullName}
//                 placeholder="Full Name"
//                 onChange={handleChange}
//                 className="w-full h-[56px] px-5 rounded-xl bg-[#f9f3ed] text-[#222] placeholder:text-[#8b8178] border border-[#d9c7b2] focus:outline-none focus:ring-2 focus:ring-[#ff7a00]/30"
//               />

//               <input
//                 name="mobileNumber"
//                 value={formData.mobileNumber}
//                 placeholder="Mobile Number"
//                 onChange={handleChange}
//                 className="w-full h-[56px] px-5 rounded-xl bg-[#f9f3ed] text-[#222] placeholder:text-[#8b8178] border border-[#d9c7b2] focus:outline-none focus:ring-2 focus:ring-[#ff7a00]/30"
//               />
//             </>
//           )}

//           <input
//             name="email"
//             value={formData.email}
//             placeholder="Email Address"
//             onChange={handleChange}
//             className="w-full h-[56px] px-5 rounded-xl bg-[#f9f3ed] text-[#222] placeholder:text-[#8b8178] border border-[#d9c7b2] focus:outline-none focus:ring-2 focus:ring-[#ff7a00]/30"
//           />

//           {/* OTP SECTION */}

//           {!isLogin && (
//             <>
//               {!emailVerified && (
//                 <button
//                   type="button"
//                   onClick={sendEmailOtp}
//                   disabled={loading}
//                   className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl font-bold transition-all"
//                 >
//                   {loading ? "Sending OTP..." : "Verify Email"}
//                 </button>
//               )}

//               {showOtpBox && (
//                 <>
//                   <input
//                     type="text"
//                     placeholder="Enter OTP"
//                     value={otp}
//                     onChange={(e) => setOtp(e.target.value)}
//                     className="w-full h-[56px] px-5 rounded-xl bg-[#f9f3ed] text-[#222] placeholder:text-[#8b8178] border border-[#d9c7b2] focus:outline-none focus:ring-2 focus:ring-[#ff7a00]/30"
//                   />

//                   <button
//                     type="button"
//                     onClick={verifyOtp}
//                     disabled={loading}
//                     className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-bold transition-all"
//                   >
//                     {loading ? "Verifying..." : "Verify OTP"}
//                   </button>
//                 </>
//               )}

//               {emailVerified && (
//                 <p className="text-green-600 text-sm font-semibold">
//                   Email Verified Successfully
//                 </p>
//               )}
//             </>
//           )}

//           <div className="relative">

//             <input
//               type={isPasswordVisible ? "text" : "password"}
//               name="password"
//               value={formData.password}
//               placeholder="Password"
//               onChange={handleChange}
//               className="w-full h-[56px] px-5 pr-12 rounded-xl bg-[#f9f3ed] text-[#222] placeholder:text-[#8b8178] border border-[#d9c7b2] focus:outline-none focus:ring-2 focus:ring-[#ff7a00]/30"
//             />

//             <button
//               type="button"
//               onClick={() => setIsPasswordVisible(!isPasswordVisible)}
//               className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8a8178] hover:text-[#ff7a00]"
//             >
//               {isPasswordVisible ? (
//                 <EyeOff className="w-5 h-5" />
//               ) : (
//                 <Eye className="w-5 h-5" />
//               )}
//             </button>
//           </div>

//           {isLogin && (
//             <div className="flex justify-end">
//               <button
//                 type="button"
//                 onClick={() => navigate("/forgot-password")}
//                 className="text-sm text-[#7d6c5c] hover:text-[#ff7a00] transition-colors"
//               >
//                 Forgot Password?
//               </button>
//             </div>
//           )}

//           <button className="w-full bg-[#f97316] hover:bg-[#ea6a0a] text-white py-4 rounded-xl font-bold text-xl shadow-lg transition-all duration-300 mt-2">
//             {isLogin ? "Login" : "Sign Up"}
//           </button>
//         </form>

//         <p className="text-center mt-6 text-[#5d5145] text-[15px]">
//           {isLogin
//             ? "Don't have an account?"
//             : "Already have an account?"}

//           <span
//             onClick={() => setIsLogin(!isLogin)}
//             className="text-[#ff7a00] ml-2 cursor-pointer font-bold hover:text-[#e36a00]"
//           >
//             {isLogin ? "Sign Up" : "Login"}
//           </span>
//         </p>
//       </motion.div>
//     </div>
//   );
// }



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