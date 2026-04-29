


import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import Filter from "../components/Filter";
import PropertyList from "../components/PropertyList";
import { propertyApi, STATIC_BASE_URL } from "../services/api";

const PENDING_PROPERTY_IDS_KEY = "pendingApprovalPropertyIds";

const getPendingApprovalPropertyIdSet = () => {
  try {
    const parsed = JSON.parse(
      localStorage.getItem(PENDING_PROPERTY_IDS_KEY) || "[]"
    );
    if (!Array.isArray(parsed)) return new Set();
    return new Set(
      parsed.map((id) => Number(id)).filter((id) => Number.isFinite(id))
    );
  } catch {
    return new Set();
  }
};

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
    if (uiType === "Villa") return "INDEPENDENT_HOUSE";
    if (uiType === "House") return "STANDALONE_BUILDING";
    return null;
  };

  // ✅ image parser
  const parseImages = (imgString) => {
    if (!imgString) return [];
    try {
      return imgString
        .replace(/^\[|\]$/g, "")
        .split(",")
        .map((img) => img.trim())
        .filter(Boolean);
    } catch {
      return [];
    }
  };

  // ✅ UI mapper
  const mapBackendToUi = (dto) => {
    const images = parseImages(dto?.doctypeImages);
    const imagePath = images[0];

    const imageUrl = imagePath
      ? `${STATIC_BASE_URL}/${String(imagePath).replace(/^\/+/, "")}`
      : "";

    const bhk = dto?.bhkType ? String(dto.bhkType).replace(/_/g, " ") : "";
    const area = dto?.carpetArea ? `${dto.carpetArea} sqft` : "";

    return {
      id: dto?.id,
      title: dto?.address || "Untitled Property",
      location: `${dto?.city || ""} ${dto?.state || ""}`.trim(),
      type: dto?.propertyType || "N/A",
      price: Number(dto?.price || 0),
      phone:
        dto?.mobileNumber ||
        dto?.mobile ||
        dto?.contactNumber ||
        "Not Available",
      details: [bhk, area].filter(Boolean).join(" · ") || "No details",
      image: imageUrl,
      _raw: dto,
    };
  };

  // ✅ FETCH ALL
  const fetchAll = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await propertyApi.getAll();

      console.log("API DATA:", res.data);

      const list = Array.isArray(res?.data?.data) ? res.data.data : [];

      if (!list.length) {
        setProperties([]);
        return;
      }

      setProperties(list.map(mapBackendToUi));
    } catch (e) {
      setError("Failed to load properties");
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ FILTER API
  const applyBackendFilter = async (filters) => {
    setLoading(true);
    setError("");

    try {
      const payload = {
        propertyType: mapUiTypeToBackend(filters.type),
        minPrice:
          filters.minPrice === "" ? null : Number(filters.minPrice),
        maxPrice:
          filters.maxPrice === "" ? null : Number(filters.maxPrice),
      };

      if (!payload.propertyType) delete payload.propertyType;
      if (!payload.minPrice || Number.isNaN(payload.minPrice))
        delete payload.minPrice;
      if (!payload.maxPrice || Number.isNaN(payload.maxPrice))
        delete payload.maxPrice;

      const res = await propertyApi.filter(payload);

      const list = Array.isArray(res?.data?.data) ? res.data.data : [];

      const pendingApprovalIds = getPendingApprovalPropertyIdSet();

      const visibleList = list.filter(
        (dto) => !pendingApprovalIds.has(Number(dto?.id))
      );

      setProperties(visibleList.map(mapBackendToUi));
    } catch (e) {
      setError(e?.message || "Failed to filter properties");
    } finally {
      setLoading(false);
    }
  };

  // ✅ ONLY ONE USEEFFECT (FIXED)
  useEffect(() => {
    fetchAll();
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
        <h1 className="text-3xl font-semibold">Browse Properties</h1>

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
            const reset = {
              type: "All",
              minPrice: "",
              maxPrice: "",
            };
            setTempFilters(reset);
            setAppliedFilters(reset);
            fetchAll();
          }}
        />

        <div className="mt-8">
          {loading && (
            <p className="text-gray-600 font-medium">Loading properties...</p>
          )}

          {error && (
            <p className="text-red-600 font-medium">{error}</p>
          )}

          <PropertyList properties={filteredProperties} />
        </div>
      </motion.div>
    </div>
  );
};

export default BrowseProperties;