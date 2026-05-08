import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { ownerApi } from "../services/api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import OwnerPremiumQrImage from "../assets/QR.jpeg";
import { MessageCircle } from "lucide-react";
import ChatDrawer from "../components/ChatDrawer";

const IMAGE_FALLBACK =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'><rect width='100%25' height='100%25' fill='%23D1D5DB'/><text x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%236B7280' font-family='Arial, sans-serif' font-size='24'>No Image</text></svg>";
const OWNER_PREMIUM_QR_IMAGE =
  OwnerPremiumQrImage || IMAGE_FALLBACK;
const OWNER_ID_BY_EMAIL_KEY = "ownerIdByEmail";
const OWNER_APPROVAL_STATUS_KEY = "ownerApprovalStatuses";

const readOwnerApprovalStatuses = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(OWNER_APPROVAL_STATUS_KEY) || "{}");
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
};

const getStoredOwnerApprovalStatus = (ownerId) => {
  const approvalStatuses = readOwnerApprovalStatuses();
  const ownerEmail = String(localStorage.getItem("ownerEmail") || "").toLowerCase().trim();
  return (
    approvalStatuses[String(ownerId)] ||
    (ownerEmail ? approvalStatuses[`email:${ownerEmail}`] : "") ||
    ""
  );
};

const writeStoredOwnerApprovalStatus = (ownerId, status) => {
  const approvalStatuses = readOwnerApprovalStatuses();
  const ownerEmail = String(localStorage.getItem("ownerEmail") || "").toLowerCase().trim();
  if (ownerId) approvalStatuses[String(ownerId)] = status;
  if (ownerEmail) approvalStatuses[`email:${ownerEmail}`] = status;
  localStorage.setItem(OWNER_APPROVAL_STATUS_KEY, JSON.stringify(approvalStatuses));
};

const PropertyThumbnail = ({ imageName, title }) => {
  const rawValue = String(imageName || "").trim();
  const cleanedName = rawValue.replace(/^\/+/, "").replace(/^uploads\//i, "");
  const imageUrl = /^(blob:|data:|https?:)/i.test(rawValue)
    ? rawValue
    : `${window.location.origin}/uploads/${encodeURIComponent(cleanedName)}`;

  return (
    <img
      src={imageUrl}
      alt={title || "Property"}
      className="w-full h-full object-cover"
      onError={(event) => {
        event.currentTarget.src = IMAGE_FALLBACK;
      }}
    />
  );
};

const CITY_LOCATION_DATA = {
  Pune: {
    "Kothrud": "411038",
    "Shivaji Nagar": "411005",
    "Hinjewadi": "411057",
    "Hadapsar": "411028",
    "Baner": "411045",
    "Wakad": "411057",
    "Aundh": "411007",
    "Deccan Gymkhana": "411004",
    "Kalyani Nagar": "411006",
    "Viman Nagar": "411014",
    "Koregaon Park": "411001",
    "Magarpatta": "411028",
  },
  "Pimpri-Chinchwad": {
    "Pimpri": "411018",
    "Chinchwad": "411019",
    "Nigdi": "411044",
    "Akurdi": "411035",
    "Ravet": "412101",
    "Bhosari": "411039",
    "Thergaon": "411033",
    "Moshi": "411042",
    "Chakan": "410501",
  },
};
const CITY_OPTIONS = [
  { label: "Pune", value: "Pune", state: "Maharashtra", aliases: ["Pune"] },
  {
    label: "Pimpri-Chinchwad (PCMC)",
    value: "PCMC",
    state: "Maharashtra",
    aliases: ["PCMC", "Pimpri-Chinchwad", "Pimpri Chinchwad", "Pimpri"],
  },
];
const CITY_FALLBACK_KEY = {
  PCMC: "Pimpri-Chinchwad",
  "Pimpri Chinchwad": "Pimpri-Chinchwad",
  Pimpri: "Pimpri-Chinchwad",
};
const getCityOption = (city) =>
  CITY_OPTIONS.find(
    (option) => option.value === city || option.aliases.includes(city)
  );
const getFallbackCityKey = (city) => CITY_FALLBACK_KEY[city] || city;

const PropertyOwnerDashboard = () => {
  const [formData, setFormData] = useState({
    propertyTitle: "",
    price: "",
    propertyType: "",
    pgType: "",
    apartmentName: "",
    location: "",
    city: "",
    address: "",
    state: "Maharashtra",
    pincode: "",
    mobileNumber: "",
    description: "",
    bhkType: "",
    furnishing: "",
    carpetArea: "",
  });

  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [premiumLoading, setPremiumLoading] = useState(false);
  const [ownerPremiumStatus, setOwnerPremiumStatus] = useState("NONE");
  const [ownerApprovalStatus, setOwnerApprovalStatus] = useState("");
  const [propertyFetchMessage, setPropertyFetchMessage] = useState("");
  const [areaOptions, setAreaOptions] = useState([]);
  const [areaLoading, setAreaLoading] = useState(false);
  const [areaMessage, setAreaMessage] = useState("");
  const [resolvedCity, setResolvedCity] = useState("");
  const latestPreviewsRef = useRef([]);
  const [ownerId, setOwnerId] = useState(null);
 
  const [ownerSessionMessage, setOwnerSessionMessage] = useState("");
  const [manualOwnerId, setManualOwnerId] = useState("");
  const [showManualIdInput, setShowManualIdInput] = useState(false);

  const [chatOpen, setChatOpen] = useState(false);
  const [chatCount, setChatCount] = useState(0);
 
  

  const navigate = useNavigate();

  const resolveOwnerIdFromToken = (decoded) => {
    if (!decoded || typeof decoded !== "object") return null;

    const directCandidates = [
      decoded.ownerId,
      decoded.ownerID,
      decoded.owner_id,
      decoded.id,
      decoded.userId,
      decoded.userID,
      decoded.subId,
      decoded.sub,
    ];

    for (const candidate of directCandidates) {
      const numeric = Number(candidate);
      if (Number.isFinite(numeric) && numeric > 0) return numeric;
    }

    for (const [key, value] of Object.entries(decoded)) {
      if (!/id/i.test(key)) continue;
      const numeric = Number(value);
      if (Number.isFinite(numeric) && numeric > 0) return numeric;
    }

    return null;
  };

const handleLogout = () => {
  localStorage.removeItem("ownerToken");
  localStorage.removeItem("ownerId");
  localStorage.setItem("ownerLogout", Date.now());
  const channel = new BroadcastChannel("owner-auth");
  channel.postMessage("logout");
  navigate("/login");
};

const handleManualOwnerIdSubmit = () => {
  const numericId = Number(manualOwnerId);
  if (!Number.isFinite(numericId) || numericId <= 0) {
    toast.error("Please enter a valid owner ID");
    return;
  }
  setOwnerId(numericId);
  localStorage.setItem("ownerId", String(numericId));
  
  // Also save by email if available
  const token = localStorage.getItem("ownerToken");
  if (token) {
    try {
      const decoded = jwtDecode(token);
      const ownerEmail = String(decoded?.sub || "").toLowerCase().trim();
      if (ownerEmail) {
        let ownerIdMap = {};
        try {
          ownerIdMap = JSON.parse(localStorage.getItem(OWNER_ID_BY_EMAIL_KEY) || "{}");
        } catch {
          ownerIdMap = {};
        }
        ownerIdMap[ownerEmail] = numericId;
        localStorage.setItem(OWNER_ID_BY_EMAIL_KEY, JSON.stringify(ownerIdMap));
        localStorage.setItem(`ownerId:${ownerEmail}`, String(numericId));
      }
    } catch {
      console.log("Error decoding token for email mapping");
    }
  }
  
  setOwnerSessionMessage("");
  setShowManualIdInput(false);
  setManualOwnerId("");
  toast.success("Owner ID set successfully");
};

  const imageLabels = [
    "Door (Closed)",
    "Hall",
    "Bedroom",
    "Balcony",
    "Kitchen",
    "Bathroom 1",
    "Bathroom 2",
    "Parking",
    "Society Image 1",
    "Society Image 2",
  ];

  useEffect(() => {
    const token = localStorage.getItem("ownerToken");
    if (!token) return;
    try {
      const decoded = jwtDecode(token);
      const ownerEmail = String(decoded?.sub || "").toLowerCase().trim();
      if (ownerEmail) {
        localStorage.setItem("ownerEmail", ownerEmail);
      }
      const tokenOwnerId = resolveOwnerIdFromToken(decoded);
      if (tokenOwnerId) {
        setOwnerId(Number(tokenOwnerId));
        localStorage.setItem("ownerId", String(Number(tokenOwnerId)));
        if (ownerEmail) {
          let ownerIdMap = {};
          try {
            ownerIdMap = JSON.parse(localStorage.getItem(OWNER_ID_BY_EMAIL_KEY) || "{}");
          } catch {
            ownerIdMap = {};
          }
          ownerIdMap[ownerEmail] = Number(tokenOwnerId);
          localStorage.setItem(OWNER_ID_BY_EMAIL_KEY, JSON.stringify(ownerIdMap));
          localStorage.setItem(`ownerId:${ownerEmail}`, String(Number(tokenOwnerId)));
        }
        setOwnerSessionMessage("");
        return;
      }

      if (ownerEmail) {
        let ownerIdMap = {};
        try {
          ownerIdMap = JSON.parse(localStorage.getItem(OWNER_ID_BY_EMAIL_KEY) || "{}");
        } catch {
          ownerIdMap = {};
        }
        const mappedOwnerId = Number(
          ownerIdMap?.[ownerEmail] || localStorage.getItem(`ownerId:${ownerEmail}`)
        );
        if (Number.isFinite(mappedOwnerId) && mappedOwnerId > 0) {
          setOwnerId(mappedOwnerId);
          localStorage.setItem("ownerId", String(mappedOwnerId));
          setOwnerSessionMessage("");
          return;
        }
      }

      setOwnerId(null);
      localStorage.removeItem("ownerId");
      setOwnerSessionMessage(
        "Owner profile id is not available from the current backend login response. New owner registrations are saved automatically; existing owners need a backend login response that includes ownerId."
      );
      return;
    } catch {
      setOwnerId(null);
      localStorage.removeItem("ownerId");
      setOwnerSessionMessage("Invalid owner session. Please login again.");
    }
  }, [navigate]);

  useEffect(() => {
    if (!ownerId) return;
    const syncOwnerApprovalStatus = () => {
      const status = getStoredOwnerApprovalStatus(ownerId);
      setOwnerApprovalStatus(status);
      if (status) setOwnerPremiumStatus(status);
    };

    syncOwnerApprovalStatus();
    setProperties([]);
    fetchProperties();
    fetchOwnerPremiumStatus();
    const intervalId = window.setInterval(() => {
      syncOwnerApprovalStatus();
      fetchProperties({ preserveCurrent: true, silent: true });
      fetchOwnerPremiumStatus({ silent: true });
    }, 10000);

    window.addEventListener("storage", syncOwnerApprovalStatus);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("storage", syncOwnerApprovalStatus);
    };
  }, [ownerId]);

  useEffect(() => {
    latestPreviewsRef.current = imagePreviews;
  }, [imagePreviews]);

  useEffect(() => {
    return () => {
      latestPreviewsRef.current.forEach((preview) => {
        if (preview) URL.revokeObjectURL(preview);
      });
    };
  }, []);

  const clearSelectedImages = () => {
    imagePreviews.forEach((preview) => {
      if (preview) URL.revokeObjectURL(preview);
    });
    setImages([]);
    setImagePreviews([]);
  };

  const parseDoctypeImages = (value) => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    if (typeof value !== "string") return [];
    const trimmed = value.trim();
    if (!trimmed) return [];
    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      return trimmed
        .slice(1, -1)
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }
    return trimmed
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  };

  const getDetailImages = (detailData) => [
    detailData?.coverImage,
    detailData?.imagePath,
    detailData?.imageName,
    ...parseDoctypeImages(detailData?.doctypeImages),
  ].filter(Boolean);

  const getPropertyImageName = (property) =>
    property?.coverImage ||
    property?.imagePath ||
    property?.imageName ||
    property?.images?.[0] ||
    parseDoctypeImages(property?.doctypeImages)[0] ||
    "";

  const normalizePropertyForDashboard = (property) => {
    const detailImages = getDetailImages(property || {});
    return {
      ...property,
      images: detailImages,
    };
  };

  const fetchProperties = async ({ preserveCurrent = false, silent = false } = {}) => {
    if (!ownerId) return;
    try {
      if (!silent) setLoading(true);
      setPropertyFetchMessage("");

      const response = await ownerApi.getOwnerProperties(ownerId);
      // Handle new response structure with properties wrapped in an object
      let apiProperties = [];
      if (Array.isArray(response?.data?.data?.properties)) {
        apiProperties = response.data.data.properties;
      } else if (Array.isArray(response?.data?.properties)) {
        apiProperties = response.data.properties;
      } else if (Array.isArray(response?.data?.data)) {
        apiProperties = response.data.data;
      } else if (Array.isArray(response?.data)) {
        apiProperties = response.data;
      }

      const fetchedProperties = apiProperties
        .filter((property) => String(property?.status || "").toUpperCase() !== "INACTIVE")
        .map(normalizePropertyForDashboard);

      if (fetchedProperties.length === 0) {
        setProperties([]);
        setPropertyFetchMessage("No properties found in the database. Add a property to get started.");
        return;
      }

      setProperties(fetchedProperties);
      setPropertyFetchMessage("");
    } catch (err) {
      console.error("Error fetching properties:", err?.message || err);
      if (!preserveCurrent) {
        setProperties([]);
      }
      setPropertyFetchMessage(
        "Could not fetch properties from the database. Please check your owner session and backend API."
      );
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const fetchOwnerPremiumStatus = async ({ silent = false } = {}) => {
    if (!ownerId) return;
    try {
      const response = await ownerApi.getOwnerProperties(ownerId);
      const premiumStatus = response?.data?.data?.premiumStatus || response?.data?.premiumStatus;
      const premiumActive = response?.data?.data?.premiumActive || response?.data?.premiumActive;

      if (premiumStatus) {
        const status = String(premiumStatus).toUpperCase();
        if (status === "APPROVED" || status.includes("APPROVED")) {
          writeStoredOwnerApprovalStatus(ownerId, "APPROVED");
          setOwnerApprovalStatus("APPROVED");
          setOwnerPremiumStatus("APPROVED");
        } else if (status === "REJECTED" || status.includes("REJECTED")) {
          writeStoredOwnerApprovalStatus(ownerId, "REJECTED");
          setOwnerApprovalStatus("REJECTED");
          setOwnerPremiumStatus("REJECTED");
        } else if (status === "PENDING" || status.includes("PENDING")) {
          writeStoredOwnerApprovalStatus(ownerId, "PENDING");
          setOwnerApprovalStatus("PENDING");
          setOwnerPremiumStatus("PENDING");
        }
      }
    } catch (err) {
      if (!silent) {
        console.error("Error fetching owner premium status:", err?.message || err);
      }
    }
  };

  const resolvePropertyApprovalStatus = (property) => {
    const workflowStatus = String(ownerApprovalStatus || ownerPremiumStatus || "").toUpperCase();
    if (workflowStatus === "APPROVED") return "APPROVED";
    if (workflowStatus === "REJECTED") return "REJECTED";
    if (workflowStatus === "PENDING") return "PENDING";

    const backendStatus = String(property?.status || "").toUpperCase();
    if (backendStatus === "PENDING") return "PENDING";
    if (backendStatus === "INACTIVE") return "REJECTED";
    if (backendStatus === "ACTIVE") return "PENDING";
    return "PENDING";
  };

  const getApprovalBadgeClasses = (status) => {
    if (status === "APPROVED") {
      return "bg-green-100 text-green-700 border border-green-200";
    }
    if (status === "REJECTED") {
      return "bg-red-100 text-red-700 border border-red-200";
    }
    return "bg-amber-100 text-amber-700 border border-amber-200";
  };

  const loadImageElement = (file) =>
    new Promise((resolve, reject) => {
      const imageUrl = URL.createObjectURL(file);
      const image = new Image();
      image.onload = () => {
        URL.revokeObjectURL(imageUrl);
        resolve(image);
      };
      image.onerror = () => {
        URL.revokeObjectURL(imageUrl);
        reject(new Error("Could not read selected image"));
      };
      image.src = imageUrl;
    });

  const canvasToBlob = (canvas, quality) =>
    new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error("Could not prepare image"))),
        "image/jpeg",
        quality
      );
    });

  const prepareImageForBackend = async (file, index, suffix = "") => {
    const image = await loadImageElement(file);
    const maxDimension = 960;
    const scale = Math.min(1, maxDimension / Math.max(image.width, image.height));
    const width = Math.max(1, Math.round(image.width * scale));
    const height = Math.max(1, Math.round(image.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    context.fillStyle = "#fff";
    context.fillRect(0, 0, width, height);
    context.drawImage(image, 0, 0, width, height);

    let blob = null;
    for (const quality of [0.72, 0.62, 0.52, 0.42]) {
      blob = await canvasToBlob(canvas, quality);
      if (blob.size <= 700 * 1024) break;
    }

    const originalName = file.name.toLowerCase();
    const baseName = originalName.replace(/\.[^/.]+$/, "").replace(/[^a-z0-9-_]/g, "-");
    const uniqueSuffix = `${Date.now()}-${index}-${Math.random().toString(36).slice(2, 8)}${suffix}`;
    return new File([blob], `${baseName || "property-image"}-${uniqueSuffix}.jpg`, {
      type: "image/jpeg",
      lastModified: Date.now(),
    });
  };

  // Validate image
  const validateImage = (file) => {
    const validTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (!validTypes.includes(file.type)) {
      throw new Error("Only JPG, JPEG, and PNG images are allowed");
    }
    if (file.size > 20 * 1024 * 1024) {
      throw new Error("Image size must be less than 20MB");
    }
    return true;
  };

  // Handle image selection
  const handleImageSelect = async (index, e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      validateImage(file);
      const backendReadyFile = await prepareImageForBackend(file, index);

      const newImages = [...images];
      const newPreviews = [...imagePreviews];

      if (newPreviews[index]) {
        URL.revokeObjectURL(newPreviews[index]);
      }

      newImages[index] = backendReadyFile;
      newPreviews[index] = URL.createObjectURL(backendReadyFile);

      setImages(newImages);
      setImagePreviews(newPreviews);
    } catch (err) {
      toast.error(err.message);
    } finally {
      // Allow selecting the same file again by resetting input value.
      e.target.value = "";
    }
  };

  // Allow removing a selected image before upload
  const handleRemoveImage = (index) => {
    if (!imagePreviews[index]) return;

    const newImages = [...images];
    const newPreviews = [...imagePreviews];
    URL.revokeObjectURL(newPreviews[index]);
    newImages[index] = undefined;
    newPreviews[index] = undefined;
    setImages(newImages);
    setImagePreviews(newPreviews);
  };

  const handleCityChange = async (selectedCity) => {
    const cityOption = getCityOption(selectedCity);
    setFormData((current) => ({
      ...current,
      city: selectedCity,
      location: "",
      pincode: "",
      state: cityOption?.state || "",
    }));
    setAreaOptions([]);
    setAreaMessage("");
    setResolvedCity("");

    if (!selectedCity) return;

    try {
      setAreaLoading(true);
      const cityCandidates = cityOption?.aliases || [selectedCity];

      for (const cityCandidate of cityCandidates) {
        try {
          const response = await ownerApi.getAreasByCity(cityCandidate);
          const areas = Array.isArray(response?.data?.data) ? response.data.data : [];
          if (areas.length > 0) {
            setAreaOptions(areas);
            setResolvedCity(cityCandidate);
            return;
          }
        } catch {
          // Try the next known backend city alias.
        }
      }

      const fallbackAreas = Object.keys(CITY_LOCATION_DATA[getFallbackCityKey(selectedCity)] || {});
      setAreaOptions(fallbackAreas);
      setResolvedCity(selectedCity);
      setAreaMessage(
        fallbackAreas.length > 0
          ? "Showing saved PCMC/Pune areas because the API returned no areas."
          : "No areas found for this city."
      );
    } catch (error) {
      const fallbackAreas = Object.keys(CITY_LOCATION_DATA[getFallbackCityKey(selectedCity)] || {});
      setAreaOptions(fallbackAreas);
      setResolvedCity(selectedCity);
      setAreaMessage(
        error?.response?.data?.message ||
          "Could not load live areas. Showing saved options if available."
      );
    } finally {
      setAreaLoading(false);
    }
  };

  const handleLocationChange = async (selectedLocation) => {
    setFormData((current) => ({
      ...current,
      location: selectedLocation,
      pincode: "",
    }));
    setAreaMessage("");

    if (!formData.city || !selectedLocation) return;

    try {
      const cityOption = getCityOption(formData.city);
      const cityCandidates = [
        resolvedCity,
        ...(cityOption?.aliases || [formData.city]),
      ].filter((city, index, cities) => city && cities.indexOf(city) === index);

      let pincode = "";
      let matchedCity = "";
      for (const cityCandidate of cityCandidates) {
        try {
          const response = await ownerApi.getPincode(cityCandidate, selectedLocation);
          pincode = response?.data?.data || "";
          if (pincode) {
            matchedCity = cityCandidate;
            break;
          }
        } catch {
          // Try the next known backend city alias.
        }
      }

      if (!pincode) throw new Error("Pincode not found");
      setResolvedCity(matchedCity || resolvedCity || formData.city);
      setFormData((current) => ({
        ...current,
        location: selectedLocation,
        pincode,
      }));
    } catch (error) {
      const fallbackPincode =
        CITY_LOCATION_DATA[getFallbackCityKey(formData.city)]?.[selectedLocation] || "";
      setFormData((current) => ({
        ...current,
        location: selectedLocation,
        pincode: fallbackPincode,
      }));
      setAreaMessage(error?.response?.data?.message || "Could not auto-fill pincode.");
    }
  };

  const validateBeforeUpload = () => {
    // Validate form
    if (!formData.propertyTitle || !formData.price || !formData.propertyType ||
        !formData.location || !formData.city || !formData.address ||
        !formData.state || !formData.pincode || !formData.mobileNumber ||
        !formData.description || !formData.bhkType || !formData.furnishing ||
        !formData.apartmentName || !formData.carpetArea) {
      toast.error("All fields are required");
      return false;
    }

    // Validate PG Type if Property Type is PG
    if (formData.propertyType === "PG" && !formData.pgType) {
      toast.error("PG Type is required when Property Type is PG");
      return false;
    }

    // Validate mobile number
    if (formData.mobileNumber.length !== 10 || !/^[6-9]/.test(formData.mobileNumber)) {
      toast.error("Invalid mobile number");
      return false;
    }
    if (!/^[1-9][0-9]{5}$/.test(formData.pincode)) {
      toast.error("Invalid pincode");
      return false;
    }

    // Validate images
    const uploadedImages = images.filter(img => img !== undefined);
    if (uploadedImages.length === 0) {
      toast.error("At least one image is required");
      return false;
    }
    if (!images[0]) {
      toast.error("Door image is required and will be used as the cover photo");
      return false;
    }

    return true;
  };

  const handleOpenPreview = () => {
    if (!validateBeforeUpload()) return;
    setShowPreviewModal(true);
  };

  // Handle form submission after preview confirmation
  const handleSubmit = async () => {
    if (uploading || loading) return;
    const uploadedImages = [images[0], ...images.slice(1).filter(img => img !== undefined)].filter(Boolean);

    let createdPropertyId = null;
    try {
      setLoading(true);
      setUploading(true);
      setShowPreviewModal(false);

      // Prepare property data
      const propertyData = {
        title: formData.propertyTitle,
        price: parseFloat(formData.price),
        propertyType: formData.propertyType,
        pgType: formData.pgType || null,
        location: formData.location,
        city: resolvedCity || formData.city,
        address: formData.address,
        state: formData.state,
        pincode: formData.pincode,
        mobileNumber: formData.mobileNumber,
        description: formData.description,
        bhkType: formData.bhkType,
        furnishing: formData.furnishing,
        carpetArea: String(formData.carpetArea),
        apartmentName: formData.apartmentName,
      };

      // Add property
      const propertyResponse = await ownerApi.addProperty(ownerId, propertyData);
      
      if (propertyResponse.data && propertyResponse.data.data) {
        const propertyId = propertyResponse.data.data.id;
        createdPropertyId = propertyId;

        const buildImageFormData = (imagesToUpload) => {
          const formDataImages = new FormData();
          imagesToUpload.forEach((image) => {
            if (!image) return;
            formDataImages.append("files", image, image.name);
          });
          return formDataImages;
        };

        const uploadPreparedImages = async (imagesToUpload) => {
          const [doorImage, ...otherImages] = imagesToUpload;

          await ownerApi.uploadPropertyImages(
            propertyId,
            buildImageFormData([doorImage])
          );

          if (otherImages.length === 0) return;

          try {
            await ownerApi.uploadPropertyImages(
              propertyId,
              buildImageFormData(otherImages)
            );
          } catch (error) {
            console.warn("Some non-cover images were not uploaded:", error);
          }
        };

        try {
          await uploadPreparedImages(uploadedImages);
          const responseMessage =
            propertyResponse?.data?.message || "Property added successfully!";
          toast.success(responseMessage);
        } catch (uploadErr) {
          console.error("Error uploading images (first attempt):", uploadErr);
          try {
            const retryFiles = await Promise.all(
              uploadedImages.map((image, index) =>
                prepareImageForBackend(image, index, "-retry")
              )
            );
            await uploadPreparedImages(retryFiles);
            toast.success("Images uploaded after retry with optimized size.");
          } catch (retryErr) {
            console.error("Error uploading images (retry attempt):", retryErr);
            toast.error(
              retryErr?.response?.data?.message ||
                retryErr?.message ||
                "Property added, but image upload failed"
            );
          }
        }
        
        setPropertyFetchMessage("");
        setOwnerPremiumStatus("PENDING");
        setOwnerApprovalStatus("PENDING");
        setShowPremiumModal(true);

        // Reset form
        setFormData({
          propertyTitle: "",
          price: "",
          propertyType: "",
          pgType: "",
          apartmentName: "",
          location: "",
          city: "",
          address: "",
          state: "Maharashtra",
          pincode: "",
          mobileNumber: "",
          description: "",
          bhkType: "",
          furnishing: "",
          carpetArea: "",
        });
        clearSelectedImages();

        await fetchProperties({ preserveCurrent: true });
      }
    } catch (err) {
      console.error("Error adding property:", err);
      const msg = err?.response?.data?.message;
      if (msg) {
        toast.error(msg);
      } else if (createdPropertyId) {
        toast.error("Property added, but something failed after creation");
      } else {
        toast.error("Failed to add property");
      }
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  // Handle delete property
  const handleDeleteProperty = async (propertyId) => {
    if (!window.confirm("Are you sure you want to delete this property?")) {
      return;
    }

    try {
      const response = await ownerApi.deleteProperty(propertyId);
      toast.success(response?.data?.message || "Property deactivated successfully");
      await fetchProperties({ preserveCurrent: true });
    } catch (err) {
      console.error("Error deleting property:", err);
      toast.error(err.response?.data?.message || err.message || "Failed to delete property");
    }
  };

  // Handle edit property
  const handleEditProperty = (property) => {
    setEditingProperty(property);
    setFormData({
      propertyTitle: property.title || "",
      price: property.price || "",
      propertyType: property.propertyType || "",
      pgType: property.pgType || "",
      apartmentName: property.apartmentName || "",
      location: property.location || "",
      city: property.city || "",
      address: property.address || "",
      state: property.state || "Maharashtra",
      pincode: property.pincode || "",
      mobileNumber: property.mobileNumber || "",
      description: property.description || "",
      bhkType: property.bhkType || "",
      furnishing: property.furnishing || "",
      carpetArea: property.carpetArea || "",
    });
    setResolvedCity(property.city || "");
    const fallbackAreas = Object.keys(CITY_LOCATION_DATA[getFallbackCityKey(property.city)] || {});
    setAreaOptions(property.location && !fallbackAreas.includes(property.location)
      ? [property.location, ...fallbackAreas]
      : fallbackAreas);
    setShowEditModal(true);
  };

  // Handle update property
  const handleUpdateProperty = async (e) => {
    e.preventDefault();

    if (!editingProperty) return;

    // Validate form
    if (!formData.propertyTitle || !formData.price || !formData.propertyType ||
        !formData.location || !formData.city || !formData.address ||
        !formData.state || !formData.pincode || !formData.mobileNumber ||
        !formData.description || !formData.bhkType || !formData.furnishing ||
        !formData.apartmentName || !formData.carpetArea) {
      toast.error("All fields are required");
      return;
    }

    // Validate PG Type if Property Type is PG
    if (formData.propertyType === "PG" && !formData.pgType) {
      toast.error("PG Type is required when Property Type is PG");
      return;
    }

    // Validate mobile number
    if (formData.mobileNumber.length !== 10 || !/^[6-9]/.test(formData.mobileNumber)) {
      toast.error("Invalid mobile number");
      return;
    }
    if (!/^[1-9][0-9]{5}$/.test(formData.pincode)) {
      toast.error("Invalid pincode");
      return;
    }

    try {
      setLoading(true);

      const propertyData = {
        title: formData.propertyTitle,
        price: parseFloat(formData.price),
        propertyType: formData.propertyType,
        pgType: formData.pgType || null,
        location: formData.location,
        city: resolvedCity || formData.city,
        address: formData.address,
        state: formData.state,
        pincode: formData.pincode,
        mobileNumber: formData.mobileNumber,
        description: formData.description,
        bhkType: formData.bhkType,
        furnishing: formData.furnishing,
        carpetArea: String(formData.carpetArea),
        apartmentName: formData.apartmentName,
      };

      const response = await ownerApi.updateProperty(editingProperty.id, propertyData);
      toast.success(response?.data?.message || "Property updated successfully");
      setShowEditModal(false);
      setEditingProperty(null);
      await fetchProperties({ preserveCurrent: true });
    } catch (err) {
      console.error("Error updating property:", err);
      toast.error(err.response?.data?.message || "Failed to update property");
    } finally {
      setLoading(false);
    }
  };

  // Close edit modal
  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingProperty(null);
    setFormData({
      propertyTitle: "",
      price: "",
      propertyType: "",
      pgType: "",
      apartmentName: "",
      location: "",
      city: "",
      address: "",
      state: "Maharashtra",
      pincode: "",
      mobileNumber: "",
      description: "",
      bhkType: "",
      furnishing: "",
      carpetArea: "",
    });
  };

  const handlePremiumDone = async () => {
    if (!ownerId) {
      toast.error("Owner session missing. Please login again.");
      return;
    }

    try {
      setPremiumLoading(true);
      const response = await ownerApi.buyPremium(ownerId);
      const status =
        response?.data?.data?.status ||
        response?.data?.status ||
        "PENDING";
      const nextStatus = String(status).toUpperCase() === "APPROVED" ? "APPROVED" : "PENDING";
      writeStoredOwnerApprovalStatus(ownerId, nextStatus);
      setOwnerPremiumStatus(nextStatus);
      setOwnerApprovalStatus(nextStatus);
      toast.success(
        "Payment request submitted. Admin can now approve or reject your premium request."
      );
      setShowPremiumModal(false);
      await fetchProperties();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to submit premium request");
    } finally {
      setPremiumLoading(false);
    }
  };

  return (
    <div className="bg-[#F5F7FA] min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center px-6 py-4 bg-white shadow-sm">
        <div className="flex items-center gap-3">
          <svg
            className="w-8 h-8 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
          <h1 className="text-blue-600 font-bold text-xl">
            Caryanam No Brokar
          </h1>
        </div>

        <div className="flex items-center gap-4 text-sm">
          <span className="text-gray-700 font-medium">
            Property Owner <span className="text-blue-600">(Property Owner)</span>
          </span>
          <button
            onClick={() => setChatOpen(true)}
            className="relative text-gray-700 hover:text-blue-500"
            title="Messages"
          >
            <MessageCircle className="w-6 h-6" />
            {chatCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full h-5 min-w-[20px] px-1 flex items-center justify-center">
                {chatCount}
              </span>
            )}
          </button>
          <button 
          onClick={handleLogout}
          className="text-gray-700 hover:text-red-500 font-medium">
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Property Owner Dashboard
          </h1>
          <p className="text-gray-500 mt-1">
            Manage property listings
          </p>
        </div>

        {ownerSessionMessage && (
          <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm text-amber-800 mb-3">
              {ownerSessionMessage}
            </p>
            {!showManualIdInput && (
              <button
                onClick={() => setShowManualIdInput(true)}
                className="text-sm bg-amber-100 hover:bg-amber-200 text-amber-800 px-3 py-1.5 rounded-md transition-colors"
              >
                Enter Owner ID Manually
              </button>
            )}
            {showManualIdInput && (
              <div className="flex gap-2 mt-2">
                <input
                  type="number"
                  value={manualOwnerId}
                  onChange={(e) => setManualOwnerId(e.target.value)}
                  placeholder="Enter your Owner ID"
                  className="flex-1 px-3 py-1.5 border border-amber-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <button
                  onClick={handleManualOwnerIdSubmit}
                  className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-1.5 rounded-md text-sm transition-colors"
                >
                  Set ID
                </button>
                <button
                  onClick={() => {
                    setShowManualIdInput(false);
                    setManualOwnerId("");
                  }}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-1.5 rounded-md text-sm transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}

        <div className="mt-8 bg-white rounded-xl shadow-sm p-8">
          <div className="flex items-center gap-3 mb-6">
            <svg
              className="w-6 h-6 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
              />
            </svg>
            <h2 className="text-2xl font-bold text-gray-800">
              Upload Property
            </h2>
          </div>

          <div className="space-y-6">
            {/* First Row: Property Title, Price, Property Type, PG Type (conditional) */}
            <div className={`grid grid-cols-1 ${formData.propertyType === "PG" ? "md:grid-cols-4" : "md:grid-cols-3"} gap-6`}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter property title"
                  value={formData.propertyTitle}
                  onChange={(e) =>
                    setFormData({ ...formData, propertyTitle: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter price"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property Type <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  value={formData.propertyType}
                  onChange={(e) => {
                    setFormData({ ...formData, propertyType: e.target.value, pgType: "" });
                  }}
                >
                  <option value="">Select property type</option>
                  <option value="APARTMENT">Apartment</option>
                  <option value="INDEPENDENT_HOUSE">Independent House</option>
                  <option value="STANDALONE_BUILDING">Standalone Building</option>
                  <option value="PG">PG</option>
                </select>
              </div>

              {formData.propertyType === "PG" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    PG Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    value={formData.pgType}
                    onChange={(e) =>
                      setFormData({ ...formData, pgType: e.target.value })
                    }
                  >
                    <option value="">Select PG type</option>
                    <option value="GIRLS_ONLY">Girls PG</option>
                    <option value="BOYS_ONLY">Boys PG</option>
                    <option value="CO_ED">Co-Ed PG</option>
                  </select>
                </div>
              )}
            </div>

            {/* Second Row: City, Location, Apartment Name */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  value={formData.city}
                  onChange={(e) => handleCityChange(e.target.value)}
                >
                  <option value="">Select city</option>
                  {CITY_OPTIONS.map((city) => (
                    <option key={city.value} value={city.value}>
                      {city.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  value={formData.location}
                  onChange={(e) => handleLocationChange(e.target.value)}
                  disabled={!formData.city || areaLoading}
                >
                  <option value="">{areaLoading ? "Loading areas..." : "Select location"}</option>
                  {areaOptions.map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
                {areaMessage && (
                  <p className="text-xs text-amber-600 mt-2">{areaMessage}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Apartment Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter apartment name"
                  value={formData.apartmentName}
                  onChange={(e) =>
                    setFormData({ ...formData, apartmentName: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Third Row: Address, State */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter address"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                  placeholder="Auto-filled from city"
                  value={formData.state}
                  readOnly
                />
              </div>
            </div>

            {/* Fourth Row: Pincode, Mobile Number */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pincode <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                  placeholder="Auto-filled based on location"
                  value={formData.pincode}
                  readOnly
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter mobile number"
                  value={formData.mobileNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, mobileNumber: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Fifth Row: Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter property description"
                rows="4"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            {/* Sixth Row: BHK Type, Furnishing and Carpet Area */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  BHK Type <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  value={formData.bhkType}
                  onChange={(e) =>
                    setFormData({ ...formData, bhkType: e.target.value })
                  }
                >
                  <option value="">Select BHK type</option>
                  <option value="ONE_BHK">1BHK</option>
                  <option value="TWO_BHK">2BHK</option>
                  <option value="THREE_BHK">3BHK</option>
                  <option value="FOUR_BHK">4BHK</option>
                  <option value="STUDIO">Studio</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Furnishing <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  value={formData.furnishing}
                  onChange={(e) =>
                    setFormData({ ...formData, furnishing: e.target.value })
                  }
                >
                  <option value="">Select furnishing type</option>
                  <option value="FULLY_FURNISHED">Fully Furnished</option>
                  <option value="SEMI_FURNISHED">Semi Furnished</option>
                  <option value="UNFURNISHED">Unfurnished</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Carpet Area
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter carpet area"
                  value={formData.carpetArea}
                  onChange={(e) =>
                    setFormData({ ...formData, carpetArea: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Property Images */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <label className="text-sm font-medium text-gray-700">
                  Property Images <span className="text-red-500">(Door image required)</span>
                </label>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {imageLabels.map((label, index) => (
                  <div key={index} className="relative">
                    <input
                      type="file"
                      id={`image-${index}`}
                      className="hidden"
                      accept="image/jpeg,image/jpg,image/png"
                      onChange={(e) => handleImageSelect(index, e)}
                    />
                    <label
                      htmlFor={`image-${index}`}
                      className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center transition-colors cursor-pointer min-h-[120px] ${
                        imagePreviews[index]
                          ? "border-green-500 bg-green-50"
                          : index === 0
                            ? "border-blue-500 bg-blue-50"
                          : "border-gray-300 hover:border-blue-500 hover:bg-blue-50"
                      }`}
                    >
                      {imagePreviews[index] ? (
                        <img
                          src={imagePreviews[index]}
                          alt={label}
                          className="w-full h-full object-cover rounded"
                        />
                      ) : (
                        <>
                          <svg
                            className="w-10 h-10 text-gray-400 mb-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                            />
                          </svg>
                          <span className="text-xs text-gray-500 text-center font-medium">
                            {label}
                            {index === 0 ? " *" : ""}
                          </span>
                        </>
                      )}
                    </label>
                    {imagePreviews[index] && (
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-2 right-2 h-7 w-7 rounded-full bg-red-500 text-white text-lg leading-none flex items-center justify-center shadow hover:bg-red-600"
                        aria-label={`Remove ${label}`}
                        title="Remove image"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                onClick={handleOpenPreview}
                disabled={loading || !ownerId}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {!ownerId
                  ? "Owner session not found"
                  : loading
                    ? "Uploading..."
                    : "Preview Property"}
              </button>
            </div>
          </div>
        </div>

        {/* Properties Section */}
        <div className="mt-8 bg-white rounded-xl shadow-sm p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
              <h2 className="text-2xl font-bold text-gray-800">
                Properties
              </h2>
            </div>
            <span className="text-sm text-gray-500">
              {properties.length} Properties
            </span>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading properties...</p>
            </div>
          ) : properties.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">
                {propertyFetchMessage || "No properties found"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property) => (
                <div
                  key={property.id}
                  className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="h-48 bg-gray-200">
                    <PropertyThumbnail
                      imageName={getPropertyImageName(property)}
                      title={property.title}
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-gray-800">
                        {property.title}
                      </h3>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${getApprovalBadgeClasses(
                          resolvePropertyApprovalStatus(property)
                        )}`}
                      >
                        {resolvePropertyApprovalStatus(property)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mb-1">
                      {property.location}
                    </p>
                    <p className="text-sm font-medium text-blue-600 mb-1">
                      ₹{property.price?.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500 mb-3">
                      {property.mobileNumber}
                </p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleEditProperty(property)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteProperty(property.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {showPremiumModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
            <h2 className="text-xl font-bold text-gray-800 text-center">
              Buy Premium to Publish Property
            </h2>
            <p className="text-sm text-gray-600 text-center mt-2">
              Scan this QR code, complete payment, then click Done.
            </p>

            <div className="mt-5">
              <img
                src={OWNER_PREMIUM_QR_IMAGE}
                alt="Owner premium payment QR"
                className="w-full rounded-lg border border-gray-200"
              />
            </div>

            <div className="mt-5 bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
              After clicking Done, your request appears in admin dashboard for approval or rejection.
            </div>

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => setShowPremiumModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePremiumDone}
                disabled={premiumLoading}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400"
              >
                {premiumLoading ? "Submitting..." : "Done"}
              </button>
            </div>

            <p className="text-xs text-gray-500 text-center mt-3">
              Current premium status: {ownerPremiumStatus}
            </p>
          </div>
        </div>
      )}

      <ChatDrawer
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        currentRole="PROPERTY_OWNER"
        currentUserId={ownerId}
        selectedProperty={null}
        onCountChange={setChatCount}
      />

      {/* Property Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-800">Preview Property</h2>
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Close preview"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div><span className="font-semibold text-gray-700">Title:</span> {formData.propertyTitle}</div>
                <div><span className="font-semibold text-gray-700">Price:</span> ₹{Number(formData.price || 0).toLocaleString()}</div>
                <div><span className="font-semibold text-gray-700">Type:</span> {formData.propertyType}</div>
                <div><span className="font-semibold text-gray-700">BHK:</span> {formData.bhkType}</div>
                <div><span className="font-semibold text-gray-700">Furnishing:</span> {formData.furnishing}</div>
                <div><span className="font-semibold text-gray-700">Mobile:</span> {formData.mobileNumber}</div>
                <div className="md:col-span-2"><span className="font-semibold text-gray-700">Location:</span> {formData.location}</div>
                <div className="md:col-span-2"><span className="font-semibold text-gray-700">Description:</span> {formData.description}</div>
              </div>

              <div className="mt-6">
                <h3 className="font-semibold text-gray-800 mb-3">Selected Images</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {imagePreviews
                    .map((preview, index) => ({ preview, index }))
                    .filter((item) => Boolean(item.preview))
                    .map((item) => (
                      <div key={item.index} className="border rounded-lg p-2">
                        <img
                          src={item.preview}
                          alt={imageLabels[item.index]}
                          className="h-24 w-full object-cover rounded"
                        />
                        <p className="text-xs text-gray-600 mt-2 text-center">{imageLabels[item.index]}</p>
                      </div>
                    ))}
                </div>
              </div>

              <div className="flex gap-3 pt-6">
                <button
                  type="button"
                  onClick={() => setShowPreviewModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  Back to Edit
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={uploading}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                >
                  {uploading ? "Uploading..." : "Confirm & Upload"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Property Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-800">Edit Property</h2>
              <button
                onClick={handleCloseEditModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={handleUpdateProperty} className="p-6 space-y-4">
              <div className={`grid grid-cols-1 ${formData.propertyType === "PG" ? "md:grid-cols-4" : "md:grid-cols-3"} gap-4`}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Property Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.propertyTitle}
                    onChange={(e) =>
                      setFormData({ ...formData, propertyTitle: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Property Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    value={formData.propertyType}
                    onChange={(e) => {
                      setFormData({ ...formData, propertyType: e.target.value, pgType: "" });
                    }}
                  >
                    <option value="">Select property type</option>
                    <option value="APARTMENT">Apartment</option>
                    <option value="INDEPENDENT_HOUSE">Independent House</option>
                    <option value="STANDALONE_BUILDING">Standalone Building</option>
                    <option value="PG">PG</option>
                  </select>
                </div>

                {formData.propertyType === "PG" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      PG Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      value={formData.pgType}
                      onChange={(e) =>
                        setFormData({ ...formData, pgType: e.target.value })
                      }
                    >
                      <option value="">Select PG type</option>
                      <option value="GIRLS_ONLY">Girls PG</option>
                      <option value="BOYS_ONLY">Boys PG</option>
                      <option value="CO_ED">Co-Ed PG</option>
                    </select>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Apartment Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.apartmentName}
                  onChange={(e) =>
                    setFormData({ ...formData, apartmentName: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                  value={formData.state}
                  readOnly
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pincode <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.pincode}
                  onChange={(e) =>
                    setFormData({ ...formData, pincode: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.mobileNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, mobileNumber: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="4"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    BHK Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    value={formData.bhkType}
                    onChange={(e) =>
                      setFormData({ ...formData, bhkType: e.target.value })
                    }
                  >
                    <option value="">Select BHK type</option>
                    <option value="ONE_BHK">1BHK</option>
                    <option value="TWO_BHK">2BHK</option>
                    <option value="THREE_BHK">3BHK</option>
                    <option value="FOUR_BHK">4BHK</option>
                    <option value="STUDIO">Studio</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Furnishing <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    value={formData.furnishing}
                    onChange={(e) =>
                      setFormData({ ...formData, furnishing: e.target.value })
                    }
                  >
                    <option value="">Select furnishing type</option>
                    <option value="FULLY_FURNISHED">Fully Furnished</option>
                    <option value="SEMI_FURNISHED">Semi Furnished</option>
                    <option value="UNFURNISHED">Unfurnished</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Carpet Area
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.carpetArea}
                    onChange={(e) =>
                      setFormData({ ...formData, carpetArea: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseEditModal}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                >
                  {loading ? "Updating..." : "Update Property"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default PropertyOwnerDashboard;
