import PropertyCard from "./PropertyCard";
import { motion } from "framer-motion";
import { LayoutGrid } from "lucide-react";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { 
      staggerChildren: 0.1,
      delayChildren: 0.2 
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: { type: "spring", stiffness: 100 }
  },
};

const PropertyList = ({ properties }) => {
  return (
    <div className="w-full">
      {/* Header Info */}
      <div className="flex items-center justify-between mb-8 px-1">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-50 rounded-lg">
            <LayoutGrid size={20} className="text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">Available Listings</h3>
            <p className="text-sm text-slate-500 font-medium">
              {properties.length} {properties.length === 1 ? 'Property' : 'Properties'} Found
            </p>
          </div>
        </div>
        
      </div>

      {/* The Row/Grid Layout */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        // Lead's 'Flex in Row' implemented via Responsive Grid
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8"
      >
        {properties.length > 0 ? (
          properties.map((p) => (
            <motion.div 
              key={p.id} 
              variants={item}
              className="h-full" // Ensures cards take up full height of the row
            >
              <PropertyCard property={p} />
            </motion.div>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
            <p className="text-gray-400 font-medium">No properties match your current filters.</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default PropertyList;