import { Search, RotateCcw, Home, IndianRupee } from "lucide-react";

const Filter = ({
  tempFilters,
  setTempFilters,
  applyFilters,
  clearFilters,
}) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setTempFilters({
      ...tempFilters,
      [name]: value,
    });
  };

  const inputStyle = "w-full mt-1.5 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-slate-700 placeholder:text-gray-400";

  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xl shadow-slate-200/50 flex flex-col lg:flex-row gap-6 items-end">
      
      {/* Property Type Dropdown */}
      <div className="w-full lg:flex-1">
        <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
          <Home size={14} className="text-blue-500" />
          Property Type
        </label>
        <select
          name="type"
          value={tempFilters.type}
          onChange={handleChange}
          className={`${inputStyle} appearance-none cursor-pointer`}
        >
          <option value="All">All Properties</option>
          <option value="Apartment">Apartment</option>
          <option value="Villa">Villa</option>
          <option value="House">House</option>
        </select>
      </div>

      {/* Min Price Input */}
      <div className="w-full lg:flex-1">
        <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
          <IndianRupee size={14} className="text-green-500" />
          Min Price
        </label>
        <input
          type="number"
          name="minPrice"
          placeholder="e.g. 2,00,000"
          value={tempFilters.minPrice}
          onChange={handleChange}
          className={inputStyle}
        />
      </div>

      {/* Max Price Input */}
      <div className="w-full lg:flex-1">
        <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
          <IndianRupee size={14} className="text-green-500" />
          Max Price
        </label>
        <input
          type="number"
          name="maxPrice"
          placeholder="e.g. 5,00,000"
          value={tempFilters.maxPrice}
          onChange={handleChange}
          className={inputStyle}
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-3 w-full lg:w-auto">
        <button
          onClick={clearFilters}
          className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-2.5 border border-gray-200 rounded-xl text-slate-600 font-medium hover:bg-gray-50 active:scale-95 transition-all"
        >
          <RotateCcw size={18} />
          <span>Reset</span>
        </button>

        <button
          onClick={applyFilters}
          className="flex-[2] lg:flex-none flex items-center justify-center gap-2 px-8 py-2.5 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 shadow-lg shadow-green-200 active:scale-95 transition-all"
        >
          <Search size={18} />
          <span>Apply</span>
        </button>
      </div>
    </div>
  );
};

export default Filter;