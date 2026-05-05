

import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import qrImage from "../assets/QR.jpeg";

const BuyPremium = () => {

  const navigate = useNavigate();

  const handlePremiumRequest = async () => {

    try {

      const token =
        localStorage.getItem("userToken");

      if (!token) {

        alert("Please login first");

        return;
      }

      const decoded =
        jwtDecode(token);

      const userId =
        decoded.id ||
        decoded.userId ||
        decoded.sub;

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

      // ✅ REDIRECT TO BROWSE PROPERTIES
      navigate("/user");

    } catch (error) {

      console.log(
        "BUY PREMIUM ERROR:",
        error.response?.data
      );

      // already pending
      if (
        error.response?.data?.message ===
        "Payment already in process"
      ) {

        alert(
          "Your premium request is already pending"
        );

        // ✅ redirect to browse properties
        navigate("/user");

        return;
      }

      alert(
        error.response?.data?.message ||
        "Failed to send request"
      );
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">

      <h1 className="text-2xl font-bold mb-4">
        Buy Premium to Continue
      </h1>

      <img
        src={qrImage}
        alt="QR Code"
        className="w-64 h-64"
      />

      <p className="mt-4 text-gray-600">
        Scan QR and upgrade to premium
      </p>

      <button
        onClick={handlePremiumRequest}
        className="mt-4 px-4 py-2 bg-black text-white rounded"
      >
        Send Request
      </button>

    </div>
  );
};

export default BuyPremium;