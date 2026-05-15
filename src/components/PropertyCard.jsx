
import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  MapPin,
  Phone,
  Info,
  MessageCircle,
  Eye,
  Crown,
  X,
} from "lucide-react";

const PropertyCard = ({
  property,
  premiumStatus,
  approvalStatus,
  onChatClick,
}) => {
  const navigate = useNavigate();
  const [showPremiumChatPopup, setShowPremiumChatPopup] =
    useState(false);

  const effectivePremiumStatus =
    premiumStatus ??
    approvalStatus ??
    null;

  // IMAGE FALLBACK
  const imageSrc =
    property.image &&
    property.image.trim() !== ""
      ? property.image
      : "/no-image.png";

  // IMAGE CLICK
  const handleImageClick = () => {
    navigate(`/property/${property.id}`, {
      state: {
        previewOnly:
          premiumStatus !==
          "APPROVED",
      },
    });
  };

  // DETAILS CLICK
  const handleDetailsClick = () => {
    if (
      premiumStatus ===
      "APPROVED"
    ) {
      navigate(
        `/property/${property.id}`
      );
      return;
    }

    if (
      premiumStatus ===
      "PENDING"
    ) {
      toast.info(
        "Your premium request is pending approval"
      );
      return;
    }

    navigate("/buy-premium");
  };

  const handleChatClick = () => {
    if (effectivePremiumStatus === "APPROVED") {
      onChatClick?.(property);  
      return;
    }

    if (effectivePremiumStatus === "PENDING") {
      setShowPremiumChatPopup(true);
      return;
    }

    navigate("/buy-premium");
  };

  return (
    <>
    <motion.div
      initial={{
        opacity: 0,
        y: 40,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.5,
      }}
      whileHover={{
        y: -10,
      }}
      className="group relative bg-white rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] hover:shadow-[0_20px_60px_rgba(249,115,22,0.18)] overflow-hidden border border-[#E5E7EB] transition-all duration-300"
    >
      <div className="relative z-10 m-[2px] bg-white rounded-[22px] overflow-hidden">
        {/* IMAGE */}
        <div
          className="relative overflow-hidden cursor-pointer"
          onClick={handleImageClick}
        >
          <motion.img
            whileHover={{
              scale: 1.12,
            }}
            transition={{
              duration: 0.7,
              ease: "easeOut",
            }}
            src={imageSrc}
            className="h-60 w-full object-cover"
            alt={property.title}
            loading="lazy"
            onError={(e) => {
              if (
                !e.currentTarget.src.includes(
                  "no-image.png"
                )
              ) {
                e.currentTarget.src =
                  "/no-image.png";
              }
            }}
          />

          {/* PREMIUM STATUS */}
          {effectivePremiumStatus && (
            <div
              className={`absolute top-4 right-4 px-3 py-1 text-xs font-bold rounded-lg shadow-md
              ${
                effectivePremiumStatus ===
                "APPROVED"
                  ? "bg-gradient-to-r from-[#F97316] to-[#EA580C] text-white"
                  : ""
              }
              ${
                effectivePremiumStatus ===
                "PENDING"
                  ? "bg-yellow-400 text-black"
                  : ""
              }
              ${
                effectivePremiumStatus ===
                "REJECTED"
                  ? "bg-red-500 text-white"
                  : ""
              }`}
            >
              {effectivePremiumStatus}
            </div>
          )}

          {/* PROPERTY TYPE */}
          <div className="absolute top-4 left-4 bg-gradient-to-r from-[#F97316] to-[#EA580C] backdrop-blur-sm text-white text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-lg">
            {property.propertyType ||
              property.type ||
              "PROPERTY"}
          </div>

          {/* PRICE */}
          <div className="absolute bottom-4 left-4 bg-[#f97316] text-white px-4 py-2 rounded-xl font-bold shadow-xl border border-[#ea6a0a]">
            ₹
            {Number(
              property.price || 0
            ).toLocaleString()}
          </div>
        </div>

        {/* CONTENT */}
        <div className="p-6 bg-[#FFFFFF]">
          {/* TITLE */}
          <h2 className="text-xl font-black text-[#111827] truncate">
            {property.title ||
              "Untitled Property"}
          </h2>

          <div className="mt-4 space-y-3">
            {/* LOCATION */}
            <div className="flex items-center text-[#6B7280] text-sm">
              <MapPin
                size={16}
                className="mr-2 text-[#F97316] flex-shrink-0"
              />

              <span className="truncate font-medium">
                {property.location ||
                  property.address ||
                  property.city ||
                  "Location Not Available"}
              </span>
            </div>

            {/* PHONE */}
            <div className="flex items-center text-[#6B7280] text-sm">
              <Phone
                size={16}
                className="mr-2 text-[#F97316] flex-shrink-0"
              />

              <span className="font-medium">
                {property.phone ||
                  "Not Available"}
              </span>
            </div>

            {/* BHK TYPE */}
            <div className="flex items-center text-[#6B7280] text-sm">
              <Info
                size={16}
                className="mr-2 text-[#F97316] flex-shrink-0"
              />

              <span className="font-medium">
                {property.bhkType ||
                  property.bhk ||
                  "BHK Not Available"}
              </span>
            </div>
          </div>

          {/* BUTTONS */}
          <div className="flex flex-col min-[420px]:flex-row gap-3 mt-6">
            {/* DETAILS BUTTON */}
            <button
              onClick={
                handleDetailsClick
              }
              className="flex-1 bg-[#F8FAFC] hover:bg-[#E2E8F0] border border-[#E2E8F0] text-[#111827] py-3 rounded-xl font-semibold transition-all duration-200"
            >
              <Eye
                size={18}
                className="inline mr-2"
              />
              Details
            </button>

            {/* CHAT BUTTON */}
            <button
              onClick={handleChatClick}
            className="flex-1 bg-gradient-to-r from-[#F97316] to-[#EA580C] hover:opacity-95 text-white py-3 rounded-xl font-semibold transition-all duration-200 shadow-[0_10px_25px_rgba(249,115,22,0.35)]"
            >
              <MessageCircle
                size={18}
                className="inline mr-2"
              />
              Chat
            </button>
          </div>
        </div>
      </div>
      </motion.div>

      {showPremiumChatPopup && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 px-4"
          onClick={() => setShowPremiumChatPopup(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md rounded-3xl bg-white p-5 sm:p-8 shadow-[0_25px_80px_rgba(0,0,0,0.25)] border border-[#E5E7EB]"
          >
            <button
              type="button"
              onClick={() => setShowPremiumChatPopup(false)}
              className="absolute top-4 right-4 p-2 rounded-full text-[#6B7280] hover:bg-[#F3F4F6] transition-colors"
              aria-label="Close"
            >
              <X size={20} />
            </button>

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: "spring" }}
              className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-[#F97316] to-[#EA580C] shadow-[0_10px_25px_rgba(249,115,22,0.35)]"
            >
              <Crown size={32} className="text-white" />
            </motion.div>

            <h3 className="text-xl font-black text-[#111827] text-center">
              Premium required to chat
            </h3>

            <p className="mt-3 text-center text-sm text-[#6B7280] leading-relaxed">
              Please get premium first, then you can chat with property owners.
              Your premium request is currently pending approval.
            </p>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => {
                setShowPremiumChatPopup(false);
                navigate("/buy-premium");
              }}
              className="mt-6 w-full rounded-xl bg-gradient-to-r from-[#F97316] to-[#EA580C] py-3.5 font-bold text-white shadow-[0_10px_25px_rgba(249,115,22,0.35)]"
            >
              Get Premium
            </motion.button>

            <button
              type="button"
              onClick={() => setShowPremiumChatPopup(false)}
              className="mt-3 w-full rounded-xl border border-[#E2E8F0] py-3 font-semibold text-[#374151] hover:bg-[#F8FAFC] transition-colors"
            >
              Close
            </button>
          </motion.div>
        </motion.div>
      )}
    </>
  );
};

export default PropertyCard;
