import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { ownerApi } from "../services/api";
import imageCompression from "browser-image-compression";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import OwnerPremiumQrImage from "../assets/QR.jpeg";

const IMAGE_FALLBACK =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'><rect width='100%25' height='100%25' fill='%23D1D5DB'/><text x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%236B7280' font-family='Arial, sans-serif' font-size='24'>No Image</text></svg>";
const OWNER_PREMIUM_QR_IMAGE =
  OwnerPremiumQrImage || IMAGE_FALLBACK;
const OWNER_PENDING_APPROVAL_KEY = "ownerPendingApprovalProperties";
const PENDING_PROPERTY_IDS_KEY = "pendingApprovalPropertyIds";
const PROPERTY_APPROVAL_STATES_KEY = "propertyApprovalStates";
const OWNER_LOCAL_PROPERTIES_KEY = "ownerLocalProperties";
const OWNER_ID_BY_EMAIL_KEY = "ownerIdByEmail";

const readPropertyApprovalStateMap = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(PROPERTY_APPROVAL_STATES_KEY) || "{}");
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
};

const readOwnerLocalPropertiesMap = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(OWNER_LOCAL_PROPERTIES_KEY) || "{}");
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
};

const readOwnerLocalProperties = (ownerId) => {
  const map = readOwnerLocalPropertiesMap();
  const ownerKey = String(Number(ownerId));
  return Array.isArray(map[ownerKey]) ? map[ownerKey] : [];
};

const writeOwnerLocalProperties = (ownerId, properties) => {
  const map = readOwnerLocalPropertiesMap();
  const ownerKey = String(Number(ownerId));
  map[ownerKey] = Array.isArray(properties) ? properties : [];
  localStorage.setItem(OWNER_LOCAL_PROPERTIES_KEY, JSON.stringify(map));
};

const getSingleKnownOwnerId = () => {
  const candidates = new Set();

  const addCandidate = (value) => {
    const numeric = Number(value);
    if (Number.isFinite(numeric) && numeric > 0) {
      candidates.add(numeric);
    }
  };

  addCandidate(localStorage.getItem("ownerId"));

  try {
    const ownerMap = JSON.parse(localStorage.getItem(OWNER_LOCAL_PROPERTIES_KEY) || "{}");
    Object.keys(ownerMap || {}).forEach(addCandidate);
  } catch {
    // ignore malformed cache
  }

  try {
    const pendingMap = JSON.parse(localStorage.getItem(OWNER_PENDING_APPROVAL_KEY) || "{}");
    Object.keys(pendingMap || {}).forEach(addCandidate);
  } catch {
    // ignore malformed cache
  }

  if (candidates.size === 1) {
    return [...candidates][0];
  }
  return null;
};

const registerPendingApprovalProperty = (ownerId, propertyId) => {
  const ownerNumericId = Number(ownerId);
  const propertyNumericId = Number(propertyId);
  if (!Number.isFinite(ownerNumericId) || ownerNumericId <= 0) return;
  if (!Number.isFinite(propertyNumericId) || propertyNumericId <= 0) return;

  let ownerMap = {};
  let pendingIds = [];
  try {
    ownerMap = JSON.parse(localStorage.getItem(OWNER_PENDING_APPROVAL_KEY) || "{}");
  } catch {
    ownerMap = {};
  }
  try {
    pendingIds = JSON.parse(localStorage.getItem(PENDING_PROPERTY_IDS_KEY) || "[]");
  } catch {
    pendingIds = [];
  }

  const key = String(ownerNumericId);
  const ownerIds = Array.isArray(ownerMap[key]) ? ownerMap[key] : [];
  if (!ownerIds.includes(propertyNumericId)) {
    ownerMap[key] = [...ownerIds, propertyNumericId];
    localStorage.setItem(OWNER_PENDING_APPROVAL_KEY, JSON.stringify(ownerMap));
  }

  if (!pendingIds.includes(propertyNumericId)) {
    localStorage.setItem(
      PENDING_PROPERTY_IDS_KEY,
      JSON.stringify([...pendingIds, propertyNumericId])
    );
  }

  const statusMap = readPropertyApprovalStateMap();
  statusMap[String(propertyNumericId)] = "PENDING";
  localStorage.setItem(PROPERTY_APPROVAL_STATES_KEY, JSON.stringify(statusMap));
};

const buildImageCandidates = (imageName) => {
  if (!imageName) return [IMAGE_FALLBACK];

  const rawValue = String(imageName).trim();
  if (/^(blob:|data:|https?:)/i.test(rawValue)) {
    return [rawValue, IMAGE_FALLBACK];
  }

  const cleanedName = rawValue.replace(/^\/+/, "");
  return [
    `http://localhost:8080/uploads/${cleanedName}`,
    `http://localhost:8080/${cleanedName}`,
    `http://localhost:8080/api/uploads/${cleanedName}`,
    IMAGE_FALLBACK,
  ];
};

const PropertyThumbnail = ({ imageName, title }) => {
  const candidates = buildImageCandidates(imageName);
  const [candidateIndex, setCandidateIndex] = useState(0);

  useEffect(() => {
    setCandidateIndex(0);
  }, [imageName]);

  const handleImageError = () => {
    setCandidateIndex((current) =>
      current < candidates.length - 1 ? current + 1 : current
    );
  };

  return (
    <img
      src={candidates[candidateIndex]}
      alt={title}
      className="w-full h-full object-cover"
      onError={handleImageError}
    />
  );
};

const PropertyOwnerDashboard = () => {
  const [formData, setFormData] = useState({
    propertyTitle: "",
    price: "",
    propertyType: "",
    location: "",
    city: "",
    address: "",
    state: "",
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
  const [pendingApprovalPropertyId, setPendingApprovalPropertyId] = useState(null);
  const [propertyApprovalStates, setPropertyApprovalStates] = useState(() =>
    readPropertyApprovalStateMap()
  );
  const latestPreviewsRef = useRef([]);
  const [ownerId, setOwnerId] = useState(null);
  const [ownerIdInput, setOwnerIdInput] = useState("");
  const [showOwnerIdPrompt, setShowOwnerIdPrompt] = useState(false);
  

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
  localStorage.setItem("ownerLogout", Date.now());
  const channel = new BroadcastChannel("owner-auth");
  channel.postMessage("logout");
  navigate("/login");
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
        setShowOwnerIdPrompt(false);
        return;
      }

      if (ownerEmail) {
        let ownerIdMap = {};
        try {
          ownerIdMap = JSON.parse(localStorage.getItem(OWNER_ID_BY_EMAIL_KEY) || "{}");
        } catch {
          ownerIdMap = {};
        }
        const mappedOwnerId = Number(ownerIdMap?.[ownerEmail]);
        if (Number.isFinite(mappedOwnerId) && mappedOwnerId > 0) {
          setOwnerId(mappedOwnerId);
          localStorage.setItem("ownerId", String(mappedOwnerId));
          setShowOwnerIdPrompt(false);
          return;
        }
      }

      const inferredOwnerId = getSingleKnownOwnerId();
      if (Number.isFinite(inferredOwnerId) && inferredOwnerId > 0) {
        setOwnerId(inferredOwnerId);
        localStorage.setItem("ownerId", String(inferredOwnerId));
        if (ownerEmail) {
          let ownerIdMap = {};
          try {
            ownerIdMap = JSON.parse(localStorage.getItem(OWNER_ID_BY_EMAIL_KEY) || "{}");
          } catch {
            ownerIdMap = {};
          }
          ownerIdMap[ownerEmail] = inferredOwnerId;
          localStorage.setItem(OWNER_ID_BY_EMAIL_KEY, JSON.stringify(ownerIdMap));
        }
        setShowOwnerIdPrompt(false);
        return;
      }

      const savedOwnerId = Number(localStorage.getItem("ownerId"));
      if (Number.isFinite(savedOwnerId) && savedOwnerId > 0) {
        setOwnerId(savedOwnerId);
        setShowOwnerIdPrompt(false);
        return;
      }

      setShowOwnerIdPrompt(true);
      toast.error("Owner ID not found in token. Please enter your Owner ID once.");
      return;
    } catch {
      const savedOwnerId = Number(localStorage.getItem("ownerId"));
      if (Number.isFinite(savedOwnerId) && savedOwnerId > 0) {
        setOwnerId(savedOwnerId);
        setShowOwnerIdPrompt(false);
        return;
      }
      setShowOwnerIdPrompt(true);
      toast.error("Invalid owner session. Please login again.");
    }
  }, [navigate]);

  const handleOwnerIdSave = () => {
    const numericOwnerId = Number(ownerIdInput);
    if (!Number.isFinite(numericOwnerId) || numericOwnerId <= 0) {
      toast.error("Please enter a valid Owner ID.");
      return;
    }
    setOwnerId(numericOwnerId);
    localStorage.setItem("ownerId", String(numericOwnerId));
    const ownerEmail = localStorage.getItem("ownerEmail");
    if (ownerEmail) {
      let ownerIdMap = {};
      try {
        ownerIdMap = JSON.parse(localStorage.getItem(OWNER_ID_BY_EMAIL_KEY) || "{}");
      } catch {
        ownerIdMap = {};
      }
      ownerIdMap[String(ownerEmail).toLowerCase().trim()] = numericOwnerId;
      localStorage.setItem(OWNER_ID_BY_EMAIL_KEY, JSON.stringify(ownerIdMap));
    }
    setShowOwnerIdPrompt(false);
    toast.success("Owner ID saved.");
  };

  useEffect(() => {
    if (!ownerId) return;
    setPropertyApprovalStates(readPropertyApprovalStateMap());
    setProperties(readOwnerLocalProperties(ownerId));
    fetchProperties();
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

  const fetchProperties = async () => {
    if (!ownerId) return;
    const adminToken = localStorage.getItem("adminToken");
    if (!adminToken) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const response = await ownerApi.getOwnerProperties(ownerId);
      if (response?.data) {
        const payload = response?.data?.data || response?.data || {};
        const baseProperties = Array.isArray(payload.properties)
          ? payload.properties
          : [];

        const propertiesWithImages = await Promise.all(
          baseProperties.map(async (property) => {
            try {
              const detailsResponse = await ownerApi.getPropertyById(property.id);
              const detailData = detailsResponse?.data?.data;
              const images = [
                detailData?.coverImage,
                ...parseDoctypeImages(detailData?.doctypeImages),
              ].filter(Boolean);
              return {
                ...property,
                images,
              };
            } catch (error) {
              console.error(`Error fetching images for property ${property.id}:`, error);
              return {
                ...property,
                images: [],
              };
            }
          })
        );

        setProperties(propertiesWithImages);
        writeOwnerLocalProperties(ownerId, propertiesWithImages);
      }
    } catch (err) {
      console.error("Error fetching properties:", err?.message || err);
      if (err?.response?.status !== 403) {
        toast.error("Failed to fetch properties");
      }
    } finally {
      setLoading(false);
    }
  };

  const resolvePropertyApprovalStatus = (property) => {
    const propertyId = String(property?.id ?? "");
    const localStatus = propertyApprovalStates[propertyId];
    if (localStatus) return localStatus;

    const backendStatus = String(property?.status || "").toUpperCase();
    if (backendStatus === "ACTIVE") return "APPROVED";
    if (backendStatus === "PENDING") return "PENDING";
    if (backendStatus === "INACTIVE") return "REJECTED";
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

  // Compress image before upload
  const compressImage = async (file) => {
    const options = {
      maxSizeMB: 2,
      maxWidthOrHeight: 1280,
      useWebWorker: true,
    };

    try {
      const compressedFile = await imageCompression(file, options);
      return compressedFile;
    } catch (error) {
      console.error("Error compressing image:", error);
      throw new Error("Failed to compress image");
    }
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
      const compressedFile = await compressImage(file);

      // Ensure filename has valid extension and make it unique to avoid duplicate-image errors.
      const originalName = file.name.toLowerCase();
      const baseName = originalName.replace(/\.[^/.]+$/, "").replace(/[^a-z0-9-_]/g, "-");
      let extension = originalName.split(".").pop();

      if (!["jpg", "jpeg", "png"].includes(extension)) {
        if (file.type === "image/jpeg") extension = "jpg";
        if (file.type === "image/png") extension = "png";
      }

      const uniqueSuffix = `${Date.now()}-${index}-${Math.random().toString(36).slice(2, 8)}`;
      const fileName = `${baseName || "property-image"}-${uniqueSuffix}.${extension}`;

      // Create a new File object with correct name and type
      const fileWithCorrectName = new File([compressedFile], fileName, {
        type: file.type,
        lastModified: Date.now()
      });

      const newImages = [...images];
      const newPreviews = [...imagePreviews];

      if (newPreviews[index]) {
        URL.revokeObjectURL(newPreviews[index]);
      }

      newImages[index] = fileWithCorrectName;
      newPreviews[index] = URL.createObjectURL(fileWithCorrectName);

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

  const validateBeforeUpload = () => {
    // Validate form
    if (!formData.propertyTitle || !formData.price || !formData.propertyType ||
        !formData.location || !formData.city || !formData.address ||
        !formData.state || !formData.pincode || !formData.mobileNumber ||
        !formData.description || !formData.bhkType || !formData.furnishing) {
      toast.error("All fields are required");
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

    return true;
  };

  const handleOpenPreview = () => {
    if (!validateBeforeUpload()) return;
    setShowPreviewModal(true);
  };

  // Handle form submission after preview confirmation
  const handleSubmit = async () => {
    if (uploading || loading) return;
    const uploadedImages = images.filter(img => img !== undefined);

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
        location: formData.location,
        city: formData.city,
        address: formData.address,
        state: formData.state,
        pincode: formData.pincode,
        mobileNumber: formData.mobileNumber,
        description: formData.description,
        bhkType: formData.bhkType,
        furnishing: formData.furnishing,
        carpetArea: formData.carpetArea,
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
            console.log("Appending image:", image.name, image.type, image.size);
            formDataImages.append("files", image, image.name);
          });
          return formDataImages;
        };

        const recompressAggressively = async (imagesToUpload) => {
          const retryOptions = {
            maxSizeMB: 0.8,
            maxWidthOrHeight: 960,
            useWebWorker: true,
          };
          const compressedRetryFiles = await Promise.all(
            imagesToUpload.map(async (image, index) => {
              const compressed = await imageCompression(image, retryOptions);
              const baseName = image.name
                .replace(/\.[^/.]+$/, "")
                .replace(/[^a-z0-9-_]/gi, "-")
                .toLowerCase();
              const extension = image.name.toLowerCase().endsWith(".png") ? "png" : "jpg";
              const mimeType = extension === "png" ? "image/png" : "image/jpeg";
              return new File(
                [compressed],
                `${baseName || "property-image"}-retry-${Date.now()}-${index}.${extension}`,
                { type: mimeType, lastModified: Date.now() }
              );
            })
          );
          return compressedRetryFiles;
        };

        try {
          await ownerApi.uploadPropertyImages(
            propertyId,
            buildImageFormData(uploadedImages)
          );
          const responseMessage =
            propertyResponse?.data?.message || "Property added successfully!";
          toast.success(responseMessage);
        } catch (uploadErr) {
          console.error("Error uploading images (first attempt):", uploadErr);
          try {
            const retryFiles = await recompressAggressively(uploadedImages);
            await ownerApi.uploadPropertyImages(
              propertyId,
              buildImageFormData(retryFiles)
            );
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
        
        registerPendingApprovalProperty(ownerId, propertyId);
        setPropertyApprovalStates((prev) => ({
          ...prev,
          [String(propertyId)]: "PENDING",
        }));
        const localPreviewImages = uploadedImages
          .filter(Boolean)
          .map((img) => URL.createObjectURL(img));
        const createdProperty = {
          id: propertyId,
          title: formData.propertyTitle,
          price: parseFloat(formData.price),
          propertyType: formData.propertyType,
          location: formData.location,
          city: formData.city,
          address: formData.address,
          state: formData.state,
          pincode: formData.pincode,
          mobileNumber: formData.mobileNumber,
          description: formData.description,
          bhkType: formData.bhkType,
          furnishing: formData.furnishing,
          carpetArea: formData.carpetArea,
          status: "PENDING",
          images: localPreviewImages,
        };
        setProperties((prev) => {
          const next = [createdProperty, ...prev.filter((item) => item.id !== propertyId)];
          writeOwnerLocalProperties(ownerId, next);
          return next;
        });
        setPendingApprovalPropertyId(propertyId);
        setOwnerPremiumStatus("PENDING");
        setShowPremiumModal(true);

        // Reset form
        setFormData({
          propertyTitle: "",
          price: "",
          propertyType: "",
          location: "",
          city: "",
          address: "",
          state: "",
          pincode: "",
          mobileNumber: "",
          description: "",
          bhkType: "",
          furnishing: "",
          carpetArea: "",
        });
        clearSelectedImages();

        // Refresh properties list
        await fetchProperties();
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
      setProperties((prev) => {
        const next = prev.filter((item) => item.id !== propertyId);
        if (ownerId) writeOwnerLocalProperties(ownerId, next);
        return next;
      });
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
      location: property.location || "",
      city: property.city || "",
      address: property.address || "",
      state: property.state || "",
      pincode: property.pincode || "",
      mobileNumber: property.mobileNumber || "",
      description: property.description || "",
      bhkType: property.bhkType || "",
      furnishing: property.furnishing || "",
      carpetArea: property.carpetArea || "",
    });
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
        !formData.description || !formData.bhkType || !formData.furnishing) {
      toast.error("All fields are required");
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
        location: formData.location,
        city: formData.city,
        address: formData.address,
        state: formData.state,
        pincode: formData.pincode,
        mobileNumber: formData.mobileNumber,
        description: formData.description,
        bhkType: formData.bhkType,
        furnishing: formData.furnishing,
        carpetArea: formData.carpetArea,
      };

      const response = await ownerApi.updateProperty(editingProperty.id, propertyData);
      toast.success(response?.data?.message || "Property updated successfully");

      setProperties((prev) => {
        const next = prev.map((item) =>
          item.id === editingProperty.id
            ? {
                ...item,
                title: propertyData.title,
                price: propertyData.price,
                propertyType: propertyData.propertyType,
                location: propertyData.location,
                city: propertyData.city,
                address: propertyData.address,
                state: propertyData.state,
                pincode: propertyData.pincode,
                mobileNumber: propertyData.mobileNumber,
                description: propertyData.description,
                bhkType: propertyData.bhkType,
                furnishing: propertyData.furnishing,
                carpetArea: propertyData.carpetArea,
              }
            : item
        );
        if (ownerId) writeOwnerLocalProperties(ownerId, next);
        return next;
      });

      setShowEditModal(false);
      setEditingProperty(null);
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
      location: "",
      city: "",
      address: "",
      state: "",
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
      setOwnerPremiumStatus(status);
      toast.success(
        "Payment request submitted. Admin can now approve or reject your premium request."
      );
      setShowPremiumModal(false);
      setPendingApprovalPropertyId(null);
      setPropertyApprovalStates(readPropertyApprovalStateMap());
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
            onClick={() => navigate("/interested-users")}
            className="relative text-gray-700 hover:text-blue-500"
            title="Interested Users"
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
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              6
            </span>
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

        {showOwnerIdPrompt && (
          <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm text-amber-800 mb-3">
              Owner ID is not present in your token. Enter it once to continue.
            </p>
            <div className="flex gap-3">
              <input
                type="number"
                min="1"
                value={ownerIdInput}
                onChange={(e) => setOwnerIdInput(e.target.value)}
                placeholder="Enter Owner ID"
                className="flex-1 px-3 py-2 border border-amber-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
              <button
                type="button"
                onClick={handleOwnerIdSave}
                className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700"
              >
                Save
              </button>
            </div>
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
            {/* First Row: Property Title, Price, Property Type */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                  onChange={(e) =>
                    setFormData({ ...formData, propertyType: e.target.value })
                  }
                >
                  <option value="">Select property type</option>
                  <option value="APARTMENT">Apartment</option>
                  <option value="INDEPENDENT_HOUSE">Villa</option>
                  <option value="STANDALONE_BUILDING">House</option>
                </select>
              </div>
            </div>

            {/* Second Row: Location, City */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter location"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter city"
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter state"
                  value={formData.state}
                  onChange={(e) =>
                    setFormData({ ...formData, state: e.target.value })
                  }
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter pincode"
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
                  Property Images <span className="text-red-500">(10 Required)</span>
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
              <p className="text-gray-500">No properties found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property) => (
                <div
                  key={property.id}
                  className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="h-48 bg-gray-200">
                    {property.images && property.images.length > 0 ? (
                      <PropertyThumbnail
                        imageName={property.images[0]}
                        title={property.title}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-300">
                        <span className="text-gray-500">No Image</span>
                      </div>
                    )}
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

        {/* Interested Users Section */}
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
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
            <h2 className="text-2xl font-bold text-gray-800">
              Interested Users
            </h2>
          </div>

          <div className="space-y-4">
            <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 mb-1">
                    Rahul Verma
                  </h3>
                  <p className="text-sm text-gray-500 mb-1">
                    rahul.verma@email.com
                  </p>
                  <p className="text-sm text-gray-600">
                    Interested in: Skyline Apartment
                  </p>
                </div>
                <span className="text-sm text-gray-400">
                  Apr 10, 2026
                </span>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 mb-1">
                    Priya Nair
                  </h3>
                  <p className="text-sm text-gray-500 mb-1">
                    priya.nair@email.com
                  </p>
                  <p className="text-sm text-gray-600">
                    Interested in: Elegant Garden Villa
                  </p>
                </div>
                <span className="text-sm text-gray-400">
                  Apr 12, 2026
                </span>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 mb-1">
                    Anil Kumar
                  </h3>
                  <p className="text-sm text-gray-500 mb-1">
                    anil.kumar@email.com
                  </p>
                  <p className="text-sm text-gray-600">
                    Interested in: Cozy Independent House
                  </p>
                </div>
                <span className="text-sm text-gray-400">
                  Apr 14, 2026
                </span>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 mb-1">
                    Sneha Patel
                  </h3>
                  <p className="text-sm text-gray-500 mb-1">
                    sneha.patel@email.com
                  </p>
                  <p className="text-sm text-gray-600">
                    Interested in: Modern Studio Apartment
                  </p>
                </div>
                <span className="text-sm text-gray-400">
                  Apr 15, 2026
                </span>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 mb-1">
                    Vikram Singh
                  </h3>
                  <p className="text-sm text-gray-500 mb-1">
                    vikram.singh@email.com
                  </p>
                  <p className="text-sm text-gray-600">
                    Interested in: Luxury Penthouse
                  </p>
                </div>
                <span className="text-sm text-gray-400">
                  Apr 16, 2026
                </span>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 mb-1">
                    Meera Joshi
                  </h3>
                  <p className="text-sm text-gray-500 mb-1">
                    meera.joshi@email.com
                  </p>
                  <p className="text-sm text-gray-600">
                    Interested in: Family Bungalow
                  </p>
                </div>
                <span className="text-sm text-gray-400">
                  Apr 17, 2026
                </span>
              </div>
            </div>
          </div>
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
                  onChange={(e) =>
                    setFormData({ ...formData, propertyType: e.target.value })
                  }
                >
                  <option value="">Select property type</option>
                  <option value="APARTMENT">Apartment</option>
                  <option value="INDEPENDENT_HOUSE">Villa</option>
                  <option value="STANDALONE_BUILDING">House</option>
                </select>
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.state}
                  onChange={(e) =>
                    setFormData({ ...formData, state: e.target.value })
                  }
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
