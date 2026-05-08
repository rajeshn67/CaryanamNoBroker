

// import {
//   useEffect,
//   useMemo,
//   useState,
//   useCallback,
// } from "react";

// import {
//   useParams,
//   useNavigate,
// } from "react-router-dom";

// import Navbar from "../components/Navbar";

// import {
//   motion,
//   AnimatePresence,
// } from "framer-motion";

// import { STATIC_BASE_URL } from "../services/api";

// import {
//   MapPin,
//   Phone,
//   ArrowLeft,
//   Home,
//   Maximize,
//   Sofa,
//   MessageCircle,
//   ChevronLeft,
//   ChevronRight,
//   ShieldCheck,
//   BedDouble,
// } from "lucide-react";

// const FALLBACK_IMAGE =
//   "https://images.unsplash.com/photo-1568605114967-8130f3a36994?q=80&w=1200";


import {
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";

import {
  useParams,
  useNavigate,
} from "react-router-dom";

import Navbar from "../components/Navbar";
import ChatDrawer from "../components/ChatDrawer";
import { motion, AnimatePresence } from "framer-motion";
import { STATIC_BASE_URL } from "../services/api";

import {
  MapPin,
  Phone,
  ArrowLeft,
  Home,
  Maximize,
  Sofa,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  BedDouble,
} from "lucide-react";
import { getUserIdFromToken } from "../utlis/authSync";

const FALLBACK_IMAGE = "/no-image.png";

const PropertyDetails = () => {
  const { id } = useParams();

  const navigate = useNavigate();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatCount, setChatCount] = useState(0);
  const [selectedPropertyForChat, setSelectedPropertyForChat] = useState(null);
  const currentUserId = getUserIdFromToken();

  useEffect(() => {
    let cancelled = false;

    async function loadProperty() {
      try {
        setLoading(true);

        setError("");

        const token =
          localStorage.getItem(
            "userToken"
          );

        if (!token) {
          navigate("/buy-premium");

          return;
        }

        const payload = JSON.parse(
          atob(token.split(".")[1])
        );

        const userId =
          payload.id ||
          payload.userId ||
          payload.sub;

        const response = await fetch(
          `http://localhost:8080/api/user/properties/${userId}`,
          {
            method: "GET",

            headers: {
              Authorization: `Bearer ${token}`,

              "Content-Type":
                "application/json",
            },
          }
        );

        const result =
          await response.json();

        if (
          !response.ok ||
          result.status >= 400
        ) {
          throw new Error(
            result.message ||
              "Failed to fetch properties"
          );
        }

        const propertyList =
          result.data || [];

        const selectedProperty =
          propertyList.find(
            (item) =>
              String(item.id) ===
                String(id) ||
              String(
                item.propertyId
              ) === String(id)
          );

        if (!selectedProperty) {
          throw new Error(
            "Property not found"
          );
        }

        if (!cancelled) {
          setProperty(
            selectedProperty
          );
        }
      } catch (err) {
        console.error(
          "PROPERTY DETAILS ERROR:",
          err
        );

        if (!cancelled) {
          setError(
            err.message ||
              "Something went wrong"
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadProperty();

    return () => {
      cancelled = true;
    };
  }, [id, navigate]);

  

  const imageUrls = useMemo(() => {
    if (!property)
      return [FALLBACK_IMAGE];

    if (
      Array.isArray(property.images) &&
      property.images.length > 0
    ) {
      return property.images.map(
        (img) =>
          `${STATIC_BASE_URL}/${img}`
      );
    }

    if (property.doctypeImages) {
      return property.doctypeImages
        .replace(/^\[|\]$/g, "")
        .split(",")
        .map(
          (img) =>
            `${STATIC_BASE_URL}/${img.trim()}`
        );
    }

    if (property.image) {
      return [property.image];
    }

    return [FALLBACK_IMAGE];
  }, [property]);

  

  const nextSlide = useCallback(() => {
    if (imageUrls.length <= 1)
      return;

    setCurrentIndex((prev) =>
      prev === imageUrls.length - 1
        ? 0
        : prev + 1
    );
  }, [imageUrls]);

 
  const prevSlide = () => {
    if (imageUrls.length <= 1)
      return;

    setCurrentIndex((prev) =>
      prev === 0
        ? imageUrls.length - 1
        : prev - 1
    );
  };

  
  useEffect(() => {
    if (imageUrls.length <= 1)
      return;

    const interval = setInterval(
      nextSlide,
      4000
    );

    return () =>
      clearInterval(interval);
  }, [imageUrls, nextSlide]);

  

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4f7fb] font-poppins">
        <Navbar />

        <div className="h-[80vh] flex items-center justify-center">
          <div className="w-12 h-12 rounded-full border-4 border-slate-300 border-t-black animate-spin"></div>
        </div>
      </div>
    );
  }

 

  if (error) {
    return (
      <div className="min-h-screen bg-[#f4f7fb] font-poppins">
        <Navbar />

        <div className="max-w-2xl mx-auto py-20 px-5">
          <div className="bg-red-50 border border-red-200 rounded-3xl p-8 text-red-500">
            <h2 className="text-3xl font-black mb-4">
              Failed to Load
              Property
            </h2>

            <p>{error}</p>

            <button
              onClick={() =>
                navigate(-1)
              }
              className="mt-6 bg-black text-white px-6 py-3 rounded-2xl"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f7fb] font-inter">
      <Navbar onOpenChat={() => setChatOpen(true)} chatCount={chatCount} />

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        {/* BACK BUTTON */}

        <button
          onClick={() =>
            navigate(-1)
          }
          className="flex items-center gap-2 text-slate-700 font-semibold mb-6"
        >
          <ArrowLeft size={18} />

          Back to Properties
        </button>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          {/* LEFT SIDE */}

          <div className="xl:col-span-8 space-y-8">
            {/* IMAGE SECTION */}

            <div className="bg-white rounded-[32px] overflow-hidden shadow-xl">
              <div className="relative h-[300px] md:h-[550px] overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={currentIndex}
                    src={
                      imageUrls[
                        currentIndex
                      ]
                    }
                    onError={(e) => {
                      e.currentTarget.src =
                        FALLBACK_IMAGE;
                    }}
                    className="w-full h-full object-cover"
                    initial={{
                      opacity: 0,
                      scale: 1.05,
                    }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                    }}
                    exit={{
                      opacity: 0,
                    }}
                    transition={{
                      duration: 0.6,
                    }}
                  />
                </AnimatePresence>

                {/* DARK OVERLAY */}

                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent z-10"></div>

                {/* SLIDER BUTTONS */}

                {imageUrls.length >
                  1 && (
                  <>
                    <button
                      onClick={
                        prevSlide
                      }
                      className="absolute left-5 top-1/2 -translate-y-1/2 bg-white p-3 rounded-full shadow-xl z-20"
                    >
                      <ChevronLeft />
                    </button>

                    <button
                      onClick={
                        nextSlide
                      }
                      className="absolute right-5 top-1/2 -translate-y-1/2 bg-white p-3 rounded-full shadow-xl z-20"
                    >
                      <ChevronRight />
                    </button>
                  </>
                )}

                {/* IMAGE DOTS */}

                {imageUrls.length >
                  1 && (
                  <div className="absolute bottom-7 left-1/2 -translate-x-1/2 flex gap-3 z-20">
                    {imageUrls.map(
                      (_, index) => (
                        <button
                          key={index}
                          onClick={() =>
                            setCurrentIndex(
                              index
                            )
                          }
                          className={`rounded-full transition-all duration-300 ${
                            currentIndex ===
                            index
                              ? "w-8 h-3 bg-white"
                              : "w-3 h-3 bg-white/50"
                          }`}
                        />
                      )
                    )}
                  </div>
                )}

                {/* PROPERTY TITLE */}

                <div className="absolute bottom-8 left-8 text-white z-20">
                  <h1 className="text-4xl md:text-6xl font-black drop-shadow-2xl">
                    {
                      property?.title
                    }
                  </h1>

                  <div className="flex items-center gap-2 mt-3 text-white/90">
                    <MapPin
                      size={18}
                    />

                    <span className="text-lg">
                      {
                        property?.location
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* PROPERTY OVERVIEW */}

            <div className="bg-white rounded-[32px] p-8 shadow-xl border border-slate-200">
              {/* TOP */}

              <div className="flex items-start justify-between flex-wrap gap-5 mb-10">
                <div>
                  <h2 className="text-[28px] font-black text-[#0f172a] leading-tight">
                    Property Overview
                  </h2>

                  <p className="text-slate-500 mt-2 text-[15px]">
                    Premium property
                    information
                  </p>
                </div>

                {/* PRICE CARD */}

                <div className="bg-[#0b132b] text-white px-7 py-5 rounded-[24px] shadow-lg min-w-[170px]">
                  <p className="text-xs uppercase tracking-[3px] text-slate-300 mb-1">
                    Price
                  </p>

                  <h2 className="text-4xl font-black">
                    ₹
                    {property?.price ||
                      "25,000"}
                  </h2>
                </div>
              </div>

              {/* INFO GRID */}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <OverviewCard
                  icon={
                    <Home
                      size={24}
                    />
                  }
                  title="Property Type"
                  value={
                    property?.propertyType
                  }
                />

                <OverviewCard
                  icon={
                    <BedDouble
                      size={24}
                    />
                  }
                  title="BHK"
                  value={
                    property?.bhkType
                  }
                />

                <OverviewCard
                  icon={
                    <Sofa
                      size={24}
                    />
                  }
                  title="Furnishing"
                  value={
                    property?.furnishing
                  }
                />

                <OverviewCard
                  icon={
                    <Maximize
                      size={24}
                    />
                  }
                  title="Carpet Area"
                  value={
                    property?.carpetArea
                  }
                />
              </div>

              {/* ABOUT PROPERTY */}

              <div className="mt-12">
                <h2 className="text-[34px] font-black text-[#0f172a] mb-5">
                  About Property
                </h2>

                <p className="text-slate-600 leading-8 text-[16px]">
                  {property?.description ||
                    "No description available"}
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE */}

          <div className="xl:col-span-4">
            <div className="sticky top-5 space-y-6">
              {/* CONTACT CARD */}

              <div className="bg-gradient-to-br from-[#081028] to-[#0b1d4d] text-white rounded-[32px] p-8 shadow-2xl">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center text-2xl font-black">
                    {property?.ownerName?.charAt(
                      0
                    ) || "O"}
                  </div>

                  <div>
                    <h3 className="text-xl font-bold">
                      {property?.ownerName ||
                        "Owner"}
                    </h3>

                    <p className="flex items-center gap-1 text-sm text-emerald-300">
                      <ShieldCheck
                        size={16}
                      />
                      Verified
                      Seller
                    </p>
                  </div>
                </div>

                <div className="bg-white/10 border border-white/10 rounded-3xl p-5 mb-6 backdrop-blur-xl">
                  <p className="text-xs uppercase tracking-[3px] text-slate-300 mb-2">
                    Direct Contact
                  </p>

                  <div className="flex items-center gap-3">
                    <Phone
                      size={20}
                    />

                    <span className="text-3xl font-black">
                      {property?.mobileNumber ||
                        "N/A"}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedPropertyForChat({
                      id: property?.id,
                      title: property?.title,
                      ownerName: property?.ownerName,
                      ownerId: property?.ownerId || property?.userId,
                      _raw: property,
                    });
                    setChatOpen(true);
                  }}
                  className="w-full bg-white text-[#0f172a] py-4 rounded-2xl font-black text-lg hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-3"
                >
                  <MessageCircle
                    size={22}
                  />

                  Chat with Owner
                </button>
              </div>

              {/* SAFETY */}

              <div className="bg-white rounded-[32px] p-6 shadow-lg border border-slate-200">
                <h3 className="text-2xl font-black mb-5 text-[#0f172a]">
                  Safety Tips
                </h3>

                <div className="space-y-4 text-slate-600">
                  <p>
                    ✅ Visit property
                    before making
                    payment
                  </p>

                  <p>
                    ✅ Verify owner
                    identity and
                    documents
                  </p>

                  <p>
                    ✅ Never share OTP
                    or banking details
                  </p>
                </div>
              </div>

              {/* QUICK INFO */}

              <div className="bg-white rounded-[32px] p-6 shadow-lg border border-slate-200">
                <h3 className="text-2xl font-black mb-5 text-[#0f172a]">
                  Quick Info
                </h3>

                <div className="space-y-5">
                  <QuickItem
                    icon={<BedDouble />}
                    label="BHK Type"
                    value={
                      property?.bhkType
                    }
                  />

                  <QuickItem
                    icon={<Sofa />}
                    label="Furnishing"
                    value={
                      property?.furnishing
                    }
                  />

                  <QuickItem
                    icon={<Home />}
                    label="Property Type"
                    value={
                      property?.propertyType
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <ChatDrawer
        isOpen={chatOpen}
        onClose={() => {
          setChatOpen(false);
          setSelectedPropertyForChat(null);
        }}
        currentRole="USER"
        currentUserId={currentUserId}
        selectedProperty={selectedPropertyForChat}
        onCountChange={setChatCount}
      />
    </div>
  );
};



const OverviewCard = ({
  icon,
  title,
  value,
}) => (
  <div className="bg-[#f8fafc] border border-slate-200 rounded-[20px] p-6 hover:shadow-xl transition-all duration-300">
    <div className="w-14 h-14 rounded-2xl bg-[#0b132b] text-white flex items-center justify-center mb-6">
      {icon}
    </div>

    <p className="text-slate-500 text-[15px] mb-2">
      {title}
    </p>

    <h3 className="text-[22px] font-black text-[#0f172a] break-words leading-tight uppercase">
      {value || "N/A"}
    </h3>
  </div>
);



const QuickItem = ({
  icon,
  label,
  value,
}) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-3 text-slate-700">
      {icon}

      <span>{label}</span>
    </div>

    <span className="font-bold text-slate-900 uppercase">
      {value || "N/A"}
    </span>
  </div>
);

export default PropertyDetails;