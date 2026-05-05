

import { useEffect, useMemo, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import { propertyApi, STATIC_BASE_URL } from "../services/api";

import {
  MapPin,
  Phone,
  ArrowLeft,
  Home,
  Maximize,
  Layout,
  Sofa,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  BedDouble,
  Bath,
  Share2,
  Heart,
} from "lucide-react";

const formatPropertyType = (type) => {
  const typeMap = {
    'APARTMENT': 'Apartment',
    'INDEPENDENT_HOUSE': 'Independent House',
    'STANDALONE_BUILDING': 'Standalone Building',
    'ALL': 'All'
  };
  return typeMap[type] || type;
};

const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!id) return;

      setLoading(true);

      try {
        const res = await propertyApi.getById(id);
        const dto = res?.data?.data ?? null;

        if (!cancelled) setProperty(dto);
      } catch (e) {
        if (!cancelled)
          setError(
            e?.response?.data?.message || "Failed to load property"
          );
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => (cancelled = true);
  }, [id]);

  const imageUrls = useMemo(() => {
    if (!property) return [];

    if (Array.isArray(property.images) && property.images.length > 0) {
      return property.images.map(
        (img) => `${STATIC_BASE_URL}/${img}`
      );
    }

    if (property.doctypeImages) {
      return property.doctypeImages
        .replace(/^\[|\]$/g, "")
        .split(",")
        .map((img) => `${STATIC_BASE_URL}/${img.trim()}`);
    }

    return [];
  }, [property]);

  const nextSlide = useCallback(() => {
    if (imageUrls.length === 0) return;

    setCurrentIndex((prev) =>
      prev === imageUrls.length - 1 ? 0 : prev + 1
    );
  }, [imageUrls.length]);

  const prevSlide = () => {
    if (imageUrls.length === 0) return;

    setCurrentIndex((prev) =>
      prev === 0 ? imageUrls.length - 1 : prev - 1
    );
  };

  useEffect(() => {
    if (imageUrls.length <= 1) return;

    const interval = setInterval(nextSlide, 4000);

    return () => clearInterval(interval);
  }, [nextSlide, imageUrls.length]);

  return (
    <div className="min-h-screen bg-[#f4f7fb] font-inter">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        {/* BACK BUTTON */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-600 hover:text-[#0f172a] font-semibold mb-6 transition"
        >
          <ArrowLeft size={18} />
          Back to Properties
        </button>

        {loading ? (
          <div className="h-[70vh] flex items-center justify-center">
            <div className="w-10 h-10 rounded-full border-4 border-slate-200 border-t-[#0f172a] animate-spin"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-3xl p-6 text-red-500">
            {error}
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            {/* LEFT SIDE */}
            <div className="xl:col-span-8 space-y-8">
              {/* HERO IMAGE */}
              <div className="bg-white rounded-[32px] overflow-hidden shadow-xl border border-slate-200">
                <div className="relative h-[300px] md:h-[550px] overflow-hidden">
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={currentIndex}
                      src={
                        imageUrls[currentIndex] ||
                        "https://via.placeholder.com/1200x700"
                      }
                      className="w-full h-full object-cover"
                      initial={{ opacity: 0, scale: 1.05 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.8 }}
                    />
                  </AnimatePresence>

               

                  {imageUrls.length > 1 && (
  <>
    <button
      onClick={prevSlide}
      className="absolute left-5 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-xl z-20 transition"
    >
      <ChevronLeft className="text-slate-800" />
    </button>

    <button
      onClick={nextSlide}
      className="absolute right-5 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-xl z-20 transition"
    >
      <ChevronRight className="text-slate-800" />
    </button>
  </>
)}
{imageUrls.length > 1 && (
  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 z-20">
    {imageUrls.map((_, index) => (
      <button
        key={index}
        onClick={() => setCurrentIndex(index)}
        className={`transition-all duration-300 rounded-full ${
          currentIndex === index
            ? "w-8 h-3 bg-white"
            : "w-3 h-3 bg-white/50 hover:bg-white/80"
        }`}
      />
    ))}
  </div>
)}

                  {/* PROPERTY TITLE */}
                  <div className="absolute bottom-6 left-6 text-white z-10">
                    <h1 className="text-3xl md:text-5xl font-black font-manrope tracking-tight">
                      {property?.title}
                    </h1>

                    <div className="flex items-center gap-2 text-white/90">
                      <MapPin size={18} />
                      <span>{property?.location}</span>
                    </div>
                  </div>
                </div>

                
              </div>

              {/* PROPERTY DETAILS */}
              <div className="bg-white rounded-[32px] p-8 shadow-xl border border-slate-200">
                <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
                  <div>
                    <h2 className="font-blactext-2xl k text-slate-900">
                      Property Overview
                    </h2>

                    <p className="text-slate-500 mt-1">
                      Premium property information
                    </p>
                  </div>

                  <FeatureCard
                    icon={<Maximize size={22} />}
                    title="Carpet Area"
                    value={property?.carpetArea}
                  />
                </div>

                {/* DESCRIPTION */}
                <div className="mt-10">
                  <h3 className="text-2xl font-black text-slate-900 mb-4">
                    About Property
                  </h3>

                  <p className="text-slate-600 leading-8 text-[16px]">
                    {property?.description ||
                      "No description available."}
                  </p>
                </div>
              </div>
            </div>

            {/* RIGHT SIDE */}
            <div className="xl:col-span-4">
              <div className="sticky top-6 space-y-6">
                {/* CONTACT CARD */}
                <div className="bg-[#0f172a] text-white rounded-[32px] p-8 shadow-2xl overflow-hidden relative">
                  {/* GLOW EFFECT */}
                  <div className="absolute -top-24 -right-24 w-60 h-60 bg-blue-500/20 rounded-full blur-3xl"></div>

                  <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-16 h-16 rounded-full bg-white text-[#0f172a] flex items-center justify-center font-black text-2xl">
                        {property?.ownerName?.charAt(0) || "O"}
                      </div>

                      <div>
                        <h3 className="text-xl font-bold font-poppins">
                          {property?.ownerName || "Owner"}
                        </h3>

                        <p className="flex items-center gap-1 text-sm text-emerald-300">
                          <ShieldCheck size={16} />
                          Verified Seller
                        </p>
                      </div>
                    </div>

                    <div className="bg-white/10 border border-white/10 rounded-3xl p-5 mb-6 backdrop-blur-xl">
                      <p className="text-xs uppercase tracking-widest text-slate-300 mb-2">
                        Direct Contact
                      </p>

                      <div className="flex items-center gap-3">
                        <Phone size={20} />

                        <span className="text-2xl font-bold">
                          {property?.mobileNumber || "N/A"}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => navigate(`/chat/${property.id}`)}
                      className="w-full bg-white text-[#0f172a] py-4 rounded-2xl font-black text-lg hover:scale-[1.02] transition-all duration-300 shadow-lg flex items-center justify-center gap-3"
                    >
                      <MessageCircle size={22} />
                      Chat with Owner
                    </button>
                  </div>
                </div>

                {/* SAFETY CARD */}
                <div className="bg-white rounded-[28px] p-6 border border-slate-200 shadow-lg">
                  <h3 className="font-black text-slate-900 mb-3">
                    Safety Tips
                  </h3>

                  <div className="space-y-4 text-sm text-slate-600">
                    <div className="flex gap-3">
                      <span>✅</span>
                      <p>Visit property before making payment</p>
                    </div>

                    <div className="flex gap-3">
                      <span>✅</span>
                      <p>Verify owner identity and documents</p>
                    </div>

                    <div className="flex gap-3">
                      <span>✅</span>
                      <p>Never share OTP or banking details</p>
                    </div>
                  </div>
                </div>

                {/* QUICK INFO */}
                <div className="bg-white rounded-[28px] p-6 border border-slate-200 shadow-lg">
                  <h3 className="font-black text-slate-900 mb-5">
                    Quick Info
                  </h3>

                  <div className="space-y-5">
                    <QuickItem
                      icon={<BedDouble size={25} />}
                      label="BHK Type"
                      value={property?.bhkType}
                    />

                    <QuickItem
                      icon={<Sofa size={25} />}
                      label="Furnishing"
                      value={property?.furnishing}
                    />

                    <QuickItem
                      icon={<Home size={25} />}
                      label="Property Type"
                      value={property?.propertyType}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

const FeatureCard = ({ icon, title, value }) => (
  <div className="bg-[#f8fafc] border border-slate-200 rounded-3xl p-5 hover:-translate-y-1 transition-all duration-300">
    <div className="w-12 h-12 rounded-2xl bg-[#0f172a] text-white flex items-center justify-center mb-4">
      {icon}
    </div>

    <p className="text-sm text-slate-500 mb-1">{title}</p>

    <h3 className="text-[15px] font-extrabold text-slate-900 leading-5 break-words">
  {value || "N/A"}
</h3>
  </div>
);

const QuickItem = ({ icon, label, value }) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-3 text-slate-700">
      {icon}
      <span>{label}</span>
    </div>

    <span className="font-bold text-slate-900">
      {value || "N/A"}
    </span>
  </div>
);

export default PropertyDetails;