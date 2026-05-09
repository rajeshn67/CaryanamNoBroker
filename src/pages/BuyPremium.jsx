

// import axios from "axios";
// import { jwtDecode } from "jwt-decode";
// import { useNavigate } from "react-router-dom";
// import qrImage from "../assets/QR.jpeg";

// const BuyPremium = () => {

//   const navigate = useNavigate();

//   const handlePremiumRequest = async () => {

//     try {

//       const token =
//         localStorage.getItem("userToken");

//       if (!token) {

//         alert("Please login first");

//         return;
//       }

//       const decoded =
//         jwtDecode(token);

//       const userId =
//         decoded.id ||
//         decoded.userId ||
//         decoded.sub;

//       const response =
//         await axios.post(
//           `http://localhost:8080/api/user/buyPremium/${userId}`,
//           {},
//           {
//             headers: {
//               Authorization: `Bearer ${token}`,
//             },
//           }
//         );

//       console.log(
//         "BUY PREMIUM RESPONSE:",
//         response.data
//       );

//       alert(
//         "Premium request sent successfully"
//       );

//       // ✅ REDIRECT TO BROWSE PROPERTIES
//       navigate("/user");

//     } catch (error) {

//       console.log(
//         "BUY PREMIUM ERROR:",
//         error.response?.data
//       );

//       // already pending
//       if (
//         error.response?.data?.message ===
//         "Payment already in process"
//       ) {

//         alert(
//           "Your premium request is already pending"
//         );

//         // ✅ redirect to browse properties
//         navigate("/user");

//         return;
//       }

//       alert(
//         error.response?.data?.message ||
//         "Failed to send request"
//       );
//     }
//   };

//   return (
//     <div className="flex flex-col items-center justify-center h-screen">

//       <h1 className="text-2xl font-bold mb-4">
//         Buy Premium to Continue
//       </h1>

//       <img
//         src={qrImage}
//         alt="QR Code"
//         className="w-64 h-64"
//       />

//       <p className="mt-4 text-gray-600">
//         Scan QR and upgrade to premium
//       </p>

//       <button
//         onClick={handlePremiumRequest}
//         className="mt-4 px-4 py-2 bg-black text-white rounded"
//       >
//         Send Request
//       </button>

//     </div>
//   );
// };

// export default BuyPremium;





// import axios from "axios";
// import { jwtDecode } from "jwt-decode";
// import { useNavigate } from "react-router-dom";
// import { motion } from "framer-motion";
// import { Crown, ShieldCheck } from "lucide-react";
// import qrImage from "../assets/QR.jpeg";

// const BuyPremium = () => {
//   const navigate = useNavigate();

//   const handlePremiumRequest = async () => {
//     try {
//       const token = localStorage.getItem("userToken");

//       if (!token) {
//         alert("Please login first");
//         return;
//       }

//       const decoded = jwtDecode(token);

//       const userId =
//         decoded.id ||
//         decoded.userId ||
//         decoded.sub;

//       const response = await axios.post(
//         `http://localhost:8080/api/user/buyPremium/${userId}`,
//         {},
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       console.log(
//         "BUY PREMIUM RESPONSE:",
//         response.data
//       );

//       alert("Premium request sent successfully");

//       navigate("/user");
//     } catch (error) {
//       console.log(
//         "BUY PREMIUM ERROR:",
//         error.response?.data
//       );

//       if (
//         error.response?.data?.message ===
//         "Payment already in process"
//       ) {
//         alert("Your premium request is already pending");
//         navigate("/user");
//         return;
//       }

//       alert(
//         error.response?.data?.message ||
//           "Failed to send request"
//       );
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-100 flex items-center justify-center px-4">
//       <motion.div
//         initial={{ opacity: 0, y: 35 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.45 }}
//         className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 text-center border border-amber-100"
//       >
//         <div className="flex justify-center mb-4">
//           <div className="bg-amber-500 text-white p-4 rounded-full shadow-lg">
//             <Crown size={30} />
//           </div>
//         </div>

//         <h1 className="text-3xl font-bold text-amber-900">
//           Upgrade to Premium
//         </h1>

//         <p className="text-amber-700 mt-2 mb-6 text-sm">
//           Unlock premium properties and contact
//           details instantly.
//         </p>

//         <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100">
//           <img
//             src={qrImage}
//             alt="QR Code"
//             className="w-56 h-56 mx-auto rounded-xl shadow-md"
//           />
//         </div>

//         <div className="flex items-center justify-center gap-2 mt-4 text-sm text-amber-700">
//           <ShieldCheck size={16} />
//           Secure payment via QR scan
//         </div>

//         <button
//           onClick={handlePremiumRequest}
//           className="w-full mt-6 py-3 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 transition duration-200 shadow-md"
//         >
//           Send Premium Request
//         </button>

//         <button
//           onClick={() => navigate("/user")}
//           className="w-full mt-3 py-3 border border-amber-200 rounded-xl text-amber-800 hover:bg-amber-50 transition duration-200"
//         >
//           Back to Browse
//         </button>
//       </motion.div>
//     </div>
//   );
// };

// export default BuyPremium;






// ✅ BuyPremium.jsx UPDATED

import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Crown,
  ShieldCheck,
} from "lucide-react";
import qrImage from "../assets/QR.jpeg";

const BuyPremium = () => {
  const navigate = useNavigate();

  const handlePremiumRequest =
    async () => {
      try {
        const token =
          localStorage.getItem(
            "userToken"
          );

        if (!token) {
          alert(
            "Please login first"
          );
          return;
        }

        const decoded =
          jwtDecode(token);

        const userId =
          decoded.id ||
          decoded.userId ||
          decoded.sub;

        // ✅ CHECK USER PREMIUM STATUS
        const statusResponse =
          await axios.get(
            `http://localhost:8080/api/user/${userId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

        const userData =
          statusResponse.data?.data;

        // ✅ IF ALREADY APPROVED
        if (
          userData?.premiumStatus ===
            "APPROVED" ||
          userData?.premiumActive ===
            true
        ) {
          alert(
            "Premium already activated"
          );

          navigate("/user");
          return;
        }

        // ✅ SEND REQUEST
        const response =
          await axios.post(
            `http://localhost:8080/api/user/buyPremium/${userId}`,
            {},
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

        console.log(
          "BUY PREMIUM RESPONSE:",
          response.data
        );

        alert(
          "Premium request sent successfully"
        );

        navigate("/user");
      } catch (error) {
        console.log(
          "BUY PREMIUM ERROR:",
          error.response?.data
        );

        if (
          error.response?.data
            ?.message ===
          "Payment already in process"
        ) {
          alert(
            "Your premium request is already pending"
          );

          navigate("/user");
          return;
        }

        alert(
          error.response?.data
            ?.message ||
            "Failed to send request"
        );
      }
    };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-100 flex items-center justify-center px-4">
      <motion.div
        initial={{
          opacity: 0,
          y: 35,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.45,
        }}
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 text-center border border-amber-100"
      >
        <div className="flex justify-center mb-4">
          <div className="bg-amber-500 text-white p-4 rounded-full shadow-lg">
            <Crown size={30} />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-amber-900">
          Upgrade to Premium
        </h1>

        <p className="text-amber-700 mt-2 mb-6 text-sm">
          Unlock premium properties and
          contact details instantly.
        </p>

        <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100">
          <img
            src={qrImage}
            alt="QR Code"
            className="w-56 h-56 mx-auto rounded-xl shadow-md"
          />
        </div>

        <div className="flex items-center justify-center gap-2 mt-4 text-sm text-amber-700">
          <ShieldCheck size={16} />
          Secure payment via QR scan
        </div>

        <button
          onClick={
            handlePremiumRequest
          }
          className="w-full mt-6 py-3 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 transition duration-200 shadow-md"
        >
          Send Premium Request
        </button>

        <button
          onClick={() =>
            navigate("/user")
          }
          className="w-full mt-3 py-3 border border-amber-200 rounded-xl text-amber-800 hover:bg-amber-50 transition duration-200"
        >
          Back to Browse
        </button>
      </motion.div>
    </div>
  );
};

export default BuyPremium;