
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import Filter from "../components/Filter";
import PropertyList from "../components/PropertyList";

import {
  propertyApi,
  STATIC_BASE_URL,
} from "../services/api";

import { getUserIdFromToken } from "../utlis/authSync";

const BrowseProperties = () => {

  const [tempFilters, setTempFilters] = useState({
    type: "All",
    city: "",
    address: "",
    minPrice: "",
    maxPrice: "",
  });

  const [properties, setProperties] = useState([]);

  const [addressOptions, setAddressOptions] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  // =========================================
  // TYPE MAPPER
  // =========================================
  const mapUiTypeToBackend = (uiType) => {

    if (
      !uiType ||
      uiType === "All" ||
      uiType === "ALL"
    ) {
      return null;
    }

    const type = uiType.toUpperCase();

    if (type === "APARTMENT")
      return "APARTMENT";

    if (type === "INDEPENDENT_HOUSE")
      return "INDEPENDENT_HOUSE";

    if (type === "STANDALONE_BUILDING")
      return "STANDALONE_BUILDING";

    return null;
  };

  // =========================================
  // IMAGE PARSER
  // =========================================
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

  // =========================================
  // BACKEND → UI
  // =========================================
  const mapBackendToUi = (dto) => {

    const images = parseImages(
      dto?.doctypeImages
    );

    const imagePath = images?.[0];

    const imageUrl = imagePath
      ? `${STATIC_BASE_URL}/${String(
          imagePath
        ).replace(/^\/+/, "")}`
      : "/no-image.png";

    return {

      id:
        dto?.id ||
        dto?.propertyId,

      title:
        dto?.title ||
        "Untitled Property",

      location:
        `${dto?.city || ""} ${
          dto?.address || ""
        }`.trim(),

      type:
        dto?.propertyType ||
        "N/A",

      price:
        Number(dto?.price || 0),

      phone:
        dto?.mobileNumber ||
        dto?.mobile ||
        dto?.contactNumber ||
        "Not Available",

      details: `
        ${dto?.bhkType || ""}
        ·
        ${dto?.carpetArea || ""}
      `,

      image: imageUrl,

      _raw: dto,
    };
  };

  // =========================================
  // FETCH ALL PROPERTIES
  // =========================================
  const fetchAll = async () => {

    setLoading(true);

    setError("");

    try {

      const res =
        await propertyApi.getAll();

      console.log(
        "ALL PROPERTIES API:",
        res.data
      );

      const list = Array.isArray(res?.data)
        ? res.data
        : res?.data?.data || [];

      console.log(
        "FINAL LIST:",
        list
      );

      setProperties(
        list.map(mapBackendToUi)
      );

    } catch (e) {

      console.error(e);

      setError(
        "Failed to load properties"
      );

      setProperties([]);

    } finally {

      setLoading(false);
    }
  };

  // =========================================
  // FETCH ADDRESSES BY CITY
  // =========================================
  const fetchAddressesByCity = async (city) => {

    try {

      const userId =
        getUserIdFromToken();

      if (!userId || !city) {
        setAddressOptions([]);
        return;
      }

      const payload = {
      city,
      fetchAddressOnly: true,
    };

      const res =
        await propertyApi.filter(
          payload,
          userId
        );

      console.log(
        "CITY ADDRESS API:",
        res.data
      );

      const list = Array.isArray(res?.data)
        ? res.data
        : res?.data?.data || [];

      setAddressOptions(list);

    } catch (err) {

      console.error(err);

      setAddressOptions([]);
    }
  };

  // =========================================
  // FILTER PROPERTIES
  // =========================================
  const applyBackendFilter = async (
    filters
  ) => {

    setLoading(true);

    setError("");

    try {

      const userId =
        getUserIdFromToken();

      if (!userId) {
        setError(
          "User not logged in"
        );
        return;
      }

      const payload = {

        propertyType:
          mapUiTypeToBackend(
            filters.type
          ),

        city:
          filters.city === ""
            ? null
            : filters.city,

        address:
          filters.address === ""
            ? null
            : filters.address,

        minPrice:
          filters.minPrice === ""
            ? null
            : Number(
                filters.minPrice
              ),

        maxPrice:
          filters.maxPrice === ""
            ? null
            : Number(
                filters.maxPrice
              ),
      };

      // REMOVE EMPTY FIELDS
      if (!payload.propertyType)
        delete payload.propertyType;

      if (!payload.city)
        delete payload.city;

      if (!payload.address)
        delete payload.address;

      if (
        !payload.minPrice ||
        Number.isNaN(payload.minPrice)
      ) {
        delete payload.minPrice;
      }

      if (
        !payload.maxPrice ||
        Number.isNaN(payload.maxPrice)
      ) {
        delete payload.maxPrice;
      }

      console.log(
        "FILTER PAYLOAD:",
        payload
      );

      // NO FILTERS
      if (
        Object.keys(payload).length === 0
      ) {
        return fetchAll();
      }

      const res =
        await propertyApi.filter(
          payload,
          userId
        );

      console.log(
        "FILTER API:",
        res.data
      );

      const list = Array.isArray(res?.data)
        ? res.data
        : res?.data?.data || [];

      setProperties(
        list.map(mapBackendToUi)
      );

    } catch (e) {

      console.error(e);

      setError(
        e?.message ||
        "Failed to filter properties"
      );

    } finally {

      setLoading(false);
    }
  };

  // =========================================
  // INITIAL LOAD
  // =========================================
  useEffect(() => {
    fetchAll();
  }, []);

  // =========================================
  // UI
  // =========================================
  return (
    <div className="bg-[#F5F7FA] min-h-screen">

      <Navbar />

      <motion.div
        initial={{
          opacity: 0,
          y: 20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        className="max-w-7xl mx-auto px-6 py-6"
      >

        <h1 className="text-3xl font-semibold">
          Browse Properties
        </h1>

        <p className="text-gray-500 mb-6">
          Find your dream home without
          any brokerage
        </p>

        {/* FILTER */}
        <Filter
          tempFilters={tempFilters}
          setTempFilters={setTempFilters}
          addressOptions={addressOptions}
          fetchAddressesByCity={fetchAddressesByCity}

          applyFilters={() => {
            applyBackendFilter(
              tempFilters
            );
          }}

          clearFilters={() => {

            const reset = {
              type: "All",
              city: "",
              address: "",
              minPrice: "",
              maxPrice: "",
            };

            setTempFilters(reset);

            setAddressOptions([]);

            fetchAll();
          }}
        />

        {/* PROPERTY LIST */}
        <div className="mt-8">

          {loading && (
            <p className="text-gray-600 font-medium">
              Loading properties...
            </p>
          )}

          {error && (
            <p className="text-red-600 font-medium">
              {error}
            </p>
          )}

          <PropertyList
            properties={properties}
          />

        </div>
      </motion.div>
    </div>
  );
};

export default BrowseProperties;