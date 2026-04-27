import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { MapPin, Phone, Info, MessageCircle, Eye } from "lucide-react";

const PropertyCard = ({ property }) => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -10 }}
      className="group relative bg-white rounded-3xl shadow-sm hover:shadow-2xl hover:shadow-blue-500/10 overflow-hidden border border-gray-100 transition-all duration-300"
    >
      {/* ANIMATED BORDER GRADIENT (Visible on Hover) */}
      <div className="absolute inset-0 z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute inset-[-2px] bg-gradient-to-r from-blue-500 via-purple-400 to-blue-500 animate-[spin_4s_linear_infinite]" 
             style={{ backgroundSize: '200% 200%' }} />
      </div>

      {/* INNER CONTENT WRAPPER (Creates the border thickness effect) */}
      <div className="relative z-10 m-[2px] bg-white rounded-[22px] overflow-hidden">
        
        {/* Glow Effect Overlay */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500 bg-gradient-to-br from-blue-50/40 to-transparent pointer-events-none" />

        {/* Image Section */}
        <div className="relative overflow-hidden">
          <motion.img
            whileHover={{ scale: 1.12 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            src={property.image}
            className="h-60 w-full object-cover"
            onError={(e) => {
              e.currentTarget.src = "https://via.placeholder.com/400x300?text=No+Image";
            }}
            alt={property.title}
          />

          {/* Dark Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-80" />

          {/* Badge */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="absolute top-4 left-4 backdrop-blur-md bg-white/70 text-blue-700 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg shadow-sm border border-white/50"
          >
            {property.type}
          </motion.div>

          {/* Price */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="absolute bottom-4 left-4 bg-gray-900/80 backdrop-blur-sm text-white px-3 py-1 rounded-lg font-semibold"
          >
            ₹{Number(property.price || 0).toLocaleString()}
          </motion.div>
        </div>

        {/* Content */}
        <div className="p-6 relative z-10">
          <motion.h2
            whileHover={{ x: 4 }}
            className="text-xl font-bold text-slate-800 truncate group-hover:text-blue-600 transition-colors"
          >
            {property.title}
          </motion.h2>

          <div className="mt-4 space-y-2">
            <motion.div whileHover={{ x: 3 }} className="flex items-center text-slate-500 text-sm">
              <MapPin size={16} className="mr-2 text-blue-500" />
              <span className="truncate">{property.location}</span>
            </motion.div>

            <motion.div whileHover={{ x: 3 }} className="flex items-center text-slate-500 text-sm">
              <Phone size={16} className="mr-2 text-green-500" />
              <span>{property.phone}</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0.7 }}
              whileHover={{ opacity: 1 }}
              className="flex items-start text-slate-400 text-xs leading-relaxed mt-2 line-clamp-2 italic"
            >
              <Info size={14} className="mr-2 mt-0.5 flex-shrink-0" />
              {property.details}
            </motion.div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 mt-6">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(`/property/${property.id}`)}
              className="flex-1 flex items-center justify-center gap-2 bg-slate-50 text-slate-700 font-medium py-3 rounded-2xl hover:bg-slate-100 border border-slate-200 transition-all"
            >
              <Eye size={18} />
              Details
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white font-medium py-3 rounded-2xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all"
            >
              <MessageCircle size={18} />
              Chat
            </motion.button>
          </div>
        </div>
      </div>

      {/* Shine Effect Overlay */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-700 pointer-events-none">
        <div className="absolute -left-1/2 top-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/40 to-transparent rotate-12 translate-x-[-100%] group-hover:translate-x-[300%] transition-all duration-1000" />
      </div>
    </motion.div>
  );
};

export default PropertyCard;