import {
  Search,
  RotateCcw,
  Home,
  IndianRupee,
  MapPin
} from "lucide-react";

const Filter = ({
  tempFilters,
  setTempFilters,
  applyFilters,
  clearFilters,
  addressOptions,
  fetchAddressesByCity,
}) => {

  const handleChange = async (e) => {

    const { name, value } = e.target;

    const updated = {
      ...tempFilters,
      [name]: value,
    };

    // CITY CHANGE
    if (name === "city") {

      updated.address = "";

      if (value) {
        await fetchAddressesByCity(value);
      }
    }

    setTempFilters(updated);
  };

  const inputStyle =
    "w-full mt-1.5 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-slate-700 placeholder:text-gray-400";

  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xl shadow-slate-200/50 flex flex-col lg:flex-row gap-6 items-end">

      {/* PROPERTY TYPE */}
      <div className="w-full lg:flex-1">
        <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
          <Home
            size={14}
            className="text-blue-500"
          />
          Property Type
        </label>

        <select
          name="type"
          value={tempFilters.type}
          onChange={handleChange}
          className={`${inputStyle} appearance-none cursor-pointer`}
        >
          <option value="All">
            All Properties
          </option>

          <option value="APARTMENT">
            APARTMENT
          </option>

          <option value="INDEPENDENT_HOUSE">
            INDEPENDENT_HOUSE
          </option>

          <option value="STANDALONE_BUILDING">
            STANDALONE_BUILDING
          </option>
        </select>
      </div>

      {/* CITY */}
      <div className="w-full lg:flex-1">

        <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
          <MapPin
            size={14}
            className="text-red-500"
          />
          City
        </label>

        <input
          type="text"
          name="city"
          placeholder="Enter city"
          value={tempFilters.city}
          onChange={handleChange}
          className={inputStyle}
        />
      </div>

      {/* ADDRESS */}
      <div className="w-full lg:flex-1">

        <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
          <MapPin
            size={14}
            className="text-blue-500"
          />
          Address
        </label>

        <select
          name="address"
          value={tempFilters.address}
          onChange={handleChange}
          className={`${inputStyle} appearance-none cursor-pointer`}
        >
          <option value="">
            Select Address
          </option>

          {addressOptions.map(
            (addr, index) => (
              <option
                key={index}
                value={addr}
              >
                {addr}
              </option>
            )
          )}
        </select>
      </div>

      {/* MIN PRICE */}
      <div className="w-full lg:flex-1">

        <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
          <IndianRupee
            size={14}
            className="text-green-500"
          />
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

      {/* MAX PRICE */}
      <div className="w-full lg:flex-1">

        <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
          <IndianRupee
            size={14}
            className="text-green-500"
          />
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

      {/* BUTTONS */}
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