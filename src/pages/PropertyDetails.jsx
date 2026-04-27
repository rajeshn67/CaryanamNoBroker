import { useEffect, useMemo, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import { propertyApi, STATIC_BASE_URL } from "../services/api";
import {
  MapPin, Phone, ArrowLeft, Home,
  Maximize, Layout, Sofa, MessageCircle,
  ChevronLeft, ChevronRight, Share2, ShieldCheck
} from "lucide-react";

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
        if (!cancelled) setError(e?.response?.data?.message || "Failed to load property");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => (cancelled = true);
  }, [id]);

  const imageUrls = useMemo(() => {
    const images = Array.isArray(property?.images) ? property.images : [];
    return images.map((img) => `${STATIC_BASE_URL}/${img}`);
  }, [property]);

  const nextSlide = useCallback(() => {
    if (imageUrls.length === 0) return;
    setCurrentIndex((prev) => (prev === imageUrls.length - 1 ? 0 : prev + 1));
  }, [imageUrls.length]);

  const prevSlide = () => {
    if (imageUrls.length === 0) return;
    setCurrentIndex((prev) => (prev === 0 ? imageUrls.length - 1 : prev - 1));
  };

  // Auto-play interval set to 4 seconds for a slower pace
  useEffect(() => {
    if (imageUrls.length <= 1) return;
    const interval = setInterval(nextSlide, 4000);
    return () => clearInterval(interval);
  }, [nextSlide, imageUrls.length]);

  return (
    <div className="bg-slate-50 min-h-screen pb-16">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* TOP BAR */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm sm:text-base font-medium text-slate-600 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft size={18} />
            Back to list
          </button>
        </div>

        {loading ? (
          <div className="h-96 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-500 p-6 rounded-2xl text-center border border-red-100">{error}</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* LEFT CONTENT */}
            <div className="lg:col-span-8 space-y-8">
              
              {/* IMAGE SLIDER SECTION */}
<div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
  {/* The Image Container - Removed p-3 here */}
  <div className="relative aspect-video bg-slate-100 shadow-inner overflow-hidden">
    <AnimatePresence mode="wait">
      <motion.img
        key={currentIndex}
        src={imageUrls[currentIndex] || "https://via.placeholder.com/800x400"}
        className="w-full h-full object-cover"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1.5, ease: "easeInOut" }} // Cinematic slow fade
      />
    </AnimatePresence>

    {/* Navigation Arrows */}
    {imageUrls.length > 1 && (
      <>
        <button 
          onClick={prevSlide} 
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-md p-2 rounded-full shadow-lg hover:bg-white transition-all z-10"
        >
          <ChevronLeft size={20} className="text-slate-800" />
        </button>
        <button 
          onClick={nextSlide} 
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-md p-2 rounded-full shadow-lg hover:bg-white transition-all z-10"
        >
          <ChevronRight size={20} className="text-slate-800" />
        </button>
      </>
    )}
  </div>

  {/* THUMBNAIL GALLERY - Placed inside the same white box with side padding */}
  <div className="px-6 py-4 flex gap-3 overflow-x-auto no-scrollbar border-t border-slate-50 bg-white">
    {imageUrls.map((img, i) => (
      <button
        key={i}
        onClick={() => setCurrentIndex(i)}
        className={`relative shrink-0 w-20 h-14 md:w-28 md:h-20 rounded-xl overflow-hidden border-2 transition-all duration-300 ${
          i === currentIndex 
            ? "border-blue-600 ring-2 ring-blue-100 scale-105" 
            : "border-transparent opacity-50 hover:opacity-100"
        }`}
      >
        <img src={img} className="w-full h-full object-cover" alt={`Thumb ${i}`} />
      </button>
    ))}
  </div>
</div>

              {/* DESCRIPTION & FEATURES */}
              <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100">
                <h2 className="text-xl font-bold text-slate-900 mb-4">About this Property</h2>
                <p className="text-slate-600 leading-relaxed text-base md:text-lg">
                  {property?.description || "No description provided."}
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10">
                  <Feature
                    icon={<Home size={20} className="text-blue-600" />}
                    label="Type"
                    value={property?.propertyType}
                    bgColor="bg-blue-50 border-blue-200"
                  />
                  <Feature
                    icon={<Layout size={20} className="text-indigo-600" />}
                    label="BHK"
                    value={property?.bhkType}
                    bgColor="bg-violet-50 border-violet-200"
                  />
                  <Feature
                    icon={<Sofa size={20} className="text-emerald-600" />}
                    label="Furnish"
                    value={property?.furnishing}
                    bgColor="bg-emerald-50 border-emerald-200"
                  />
                  <Feature
                    icon={<Maximize size={20} className="text-slate-600" />}
                    label="Area"
                    value={property?.carpetArea}
                    bgColor="bg-slate-100 border-slate-200"
                  />
                </div>
              </div>
            </div>

            {/* RIGHT SIDEBAR */}
            <div className="lg:col-span-4 lg:sticky lg:top-8 space-y-6">
              <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-500">
                <div className="mb-6">
                  <h1 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight mb-2">{property?.title}</h1>
                  <div className="flex items-center gap-2 text-slate-500 text-sm">
                    <MapPin size={16} className="text-blue-600 shrink-0" />
                    <span>{property?.location}</span>
                  </div>
                </div>

                <div className="bg-slate-100 rounded-2xl p-6 border border-slate-100 mb-8">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">Asking Price</p>
                  <p className="text-4xl font-black text-red-600">₹{Number(property?.price || 0).toLocaleString()}</p>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center"><Phone size={22} /></div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ">Direct Contact</p>
                      <p className="text-xl font-bold text-slate-900">{property?.mobileNumber || "Not Available"}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate(`/chat/${property.id}`)}
                    className="w-full flex items-center justify-center gap-3 bg-slate-900 text-white py-4 rounded-2xl font-bold text-lg hover:bg-slate-800 transition-all shadow-lg active:scale-[0.98]"
                  >
                    <MessageCircle size={22} /> Chat with Owner
                  </button>
                </div>

                {/* OWNER DETAILS SECTION (Re-added for completeness) */}
                <div className="mt-8 pt-6 border-t border-slate-100 flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    {property?.ownerName?.charAt(0) || "O"}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 capitalize">{property?.ownerName || "Owner"}</p>
                    <p className="text-[10px] text-slate-400 flex items-center gap-1"><ShieldCheck size={12} className="text-emerald-500" /> Verified Seller</p>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100 flex gap-3">
                <span className="text-xl">💡</span>
                <p className="text-xs text-amber-800 leading-relaxed font-medium">Meet the owner in person and verify all documents before making any payments.</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

// Feature component helper
const Feature = ({ icon, label, value, bgColor }) => (
  <div className={`${bgColor} p-4 rounded-2xl border flex flex-col items-center justify-center text-center transition-all hover:scale-105 duration-300 group`}>
    <div className="mb-2 p-2 bg-white rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
      {icon}
    </div>
    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{label}</p>
    <p className="text-sm font-black text-slate-900 truncate w-full">{value || "N/A"}</p>
  </div>
);

export default PropertyDetails;