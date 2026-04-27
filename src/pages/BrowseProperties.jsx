import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import Filter from "../components/Filter";
import PropertyList from "../components/PropertyList";
import { propertyApi, STATIC_BASE_URL } from "../services/api";

const BrowseProperties = () => {

  const [appliedFilters, setAppliedFilters] = useState({
    type: "All",
    minPrice: "",
    maxPrice: "",
  });

  const [tempFilters, setTempFilters] = useState(appliedFilters);

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const mapUiTypeToBackend = (uiType) => {
    if (!uiType || uiType === "All") return null;
    if (uiType === "Apartment") return "APARTMENT";
    if (uiType === "Villa") return "VILLA";
    if (uiType === "House") return "HOME";
    return null;
  };

  const mapBackendToUi = (dto) => {
    const images = Array.isArray(dto?.images) ? dto.images : [];
    const imagePath = images[0];

    const imageUrl = imagePath
      ? `${STATIC_BASE_URL}/${String(imagePath).replace(/^\/+/, "")}`
      : "";

    const bhk = dto?.bhkType ? String(dto.bhkType).replace(/_/g, " ") : "";
    const area = dto?.carpetArea ? String(dto.carpetArea) : "";
    const details = [bhk, area].filter(Boolean).join(" · ");

    const type =
      dto?.propertyType === "HOME"
        ? "House"
        : dto?.propertyType === "APARTMENT"
          ? "Apartment"
          : dto?.propertyType === "VILLA"
            ? "Villa"
            : "All";

    return {
      id: dto?.id,
      type,
      title: dto?.title || "Untitled",
      price: Number(dto?.price || 0),
      location: dto?.location || "",
      phone: dto?.mobileNumber || "",
      details,
      image: imageUrl,
      _raw: dto,
    };
  };

  const fetchAll = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await propertyApi.getAll();
      const list = Array.isArray(res?.data?.data) ? res.data.data : [];
      setProperties(list.map(mapBackendToUi));
    } catch (e) {
      setError(e?.message || "Failed to load properties");
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  const applyBackendFilter = async (filters) => {
    setLoading(true);
    setError("");
    try {
      const payload = {
        propertyType: mapUiTypeToBackend(filters.type),
        minPrice:
          filters.minPrice === "" || filters.minPrice == null
            ? null
            : Number(filters.minPrice),
        maxPrice:
          filters.maxPrice === "" || filters.maxPrice == null
            ? null
            : Number(filters.maxPrice),
      };

      // Backend expects null/omitted for "All"
      if (!payload.propertyType) delete payload.propertyType;
      if (payload.minPrice == null || Number.isNaN(payload.minPrice))
        delete payload.minPrice;
      if (payload.maxPrice == null || Number.isNaN(payload.maxPrice))
        delete payload.maxPrice;

      const res = await propertyApi.filter(payload);
      const list = Array.isArray(res?.data?.data) ? res.data.data : [];
      setProperties(list.map(mapBackendToUi));
    } catch (e) {
      setError(e?.message || "Failed to filter properties");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredProperties = useMemo(() => properties, [properties]);

  return (
    <div className="bg-[#F5F7FA] min-h-screen">
      <Navbar />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto px-6 py-6"
      >
        <h1 className="text-3xl font-semibold tracking-tight">
          Browse Properties
        </h1>

        <p className="text-gray-500 mb-6">
          Find your dream home without any brokerage
        </p>

        <Filter
          tempFilters={tempFilters}
          setTempFilters={setTempFilters}
          applyFilters={() => {
            setAppliedFilters(tempFilters);
            applyBackendFilter(tempFilters);
          }}
          clearFilters={() => {
            const reset = { type: "All", minPrice: "", maxPrice: "" };
            setTempFilters(reset);
            setAppliedFilters(reset);
            fetchAll();
          }}
        />

        <div className="mt-8">
          {loading ? (
            <p className="text-gray-600 font-medium">Loading properties...</p>
          ) : error ? (
            <p className="text-red-600 font-medium">{error}</p>
          ) : null}
          <PropertyList properties={filteredProperties} />
        </div>
      </motion.div>
    </div>
  );
};

export default BrowseProperties;