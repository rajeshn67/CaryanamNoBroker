import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { adminApi, STATIC_BASE_URL } from "../services/api";
import imageCompression from "browser-image-compression";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const IMAGE_FALLBACK =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'><rect width='100%25' height='100%25' fill='%23D1D5DB'/><text x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%236B7280' font-family='Arial, sans-serif' font-size='24'>No Image</text></svg>";

const buildImageCandidates = (imageName) => {
  if (!imageName) return [IMAGE_FALLBACK];

  const cleanedName = String(imageName).replace(/^\/+/, "");
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

const AdminDashboard = () => {
  const [formData, setFormData] = useState({
    propertyTitle: "",
    price: "",
    propertyType: "",
    location: "",
    mobileNumber: "",
    description: "",
    bhkType: "",
    furnishing: "",
  });

  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const latestPreviewsRef = useRef([]);
  const adminId = 1; // Admin ID for rajeshnarwade67@gmail.com
  

  const navigate = useNavigate();

const handleLogout = () => {
  localStorage.removeItem("adminToken");
  localStorage.setItem("adminLogout", Date.now());
  const channel = new BroadcastChannel("admin-auth");
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

  // Fetch properties on component mount
  useEffect(() => {
    fetchProperties();
  }, []);

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

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getAllProperties();
      if (response.data && response.data.data) {
        const baseProperties = response.data.data;

        const propertiesWithImages = await Promise.all(
          baseProperties.map(async (property) => {
            try {
              const detailsResponse = await adminApi.getPropertyById(property.id);
              const detailData = detailsResponse?.data?.data;
              return {
                ...property,
                images: Array.isArray(detailData?.images) ? detailData.images : [],
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
      }
    } catch (err) {
      console.error("Error fetching properties:", err);
      toast.error("Failed to fetch properties");
    } finally {
      setLoading(false);
    }
  };

  // Compress image to max 2MB
  const compressImage = async (file) => {
    const options = {
      maxSizeMB: 2,
      maxWidthOrHeight: 1920,
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
    if (file.size > 2 * 1024 * 1024) {
      throw new Error("Image size must be less than 2MB");
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
        !formData.location || !formData.mobileNumber || !formData.description ||
        !formData.bhkType || !formData.furnishing) {
      toast.error("All fields are required");
      return false;
    }

    // Validate mobile number
    if (formData.mobileNumber.length !== 10 || !/^[6-9]/.test(formData.mobileNumber)) {
      toast.error("Invalid mobile number");
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
        mobileNumber: formData.mobileNumber,
        description: formData.description,
        bhkType: formData.bhkType,
        furnishing: formData.furnishing,
      };

      // Add property
      const propertyResponse = await adminApi.addProperty(adminId, propertyData);
      
      if (propertyResponse.data && propertyResponse.data.data) {
        const propertyId = propertyResponse.data.data.id;
        createdPropertyId = propertyId;

        // Upload images
        const formDataImages = new FormData();
        uploadedImages.forEach((image) => {
          if (image) {
            console.log("Appending image:", image.name, image.type, image.size);
            formDataImages.append("files", image);
          }
        });

        try {
          await adminApi.uploadPropertyImages(propertyId, formDataImages);
          toast.success("Property added successfully!");
        } catch (uploadErr) {
          console.error("Error uploading images:", uploadErr);
          toast.error(
            uploadErr?.response?.data?.message ||
              uploadErr?.message ||
              "Property added, but image upload failed"
          );
        }
        
        // Reset form
        setFormData({
          propertyTitle: "",
          price: "",
          propertyType: "",
          location: "",
          mobileNumber: "",
          description: "",
          bhkType: "",
          furnishing: "",
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
      const response = await adminApi.deleteProperty(propertyId);
      toast.success(response?.data?.message || "Property deactivated successfully");
      await fetchProperties();
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
      mobileNumber: property.mobileNumber || "",
      description: property.description || "",
      bhkType: property.bhkType || "",
      furnishing: property.furnishing || "",
    });
    setShowEditModal(true);
  };

  // Handle update property
  const handleUpdateProperty = async (e) => {
    e.preventDefault();

    if (!editingProperty) return;

    // Validate form
    if (!formData.propertyTitle || !formData.price || !formData.propertyType ||
        !formData.location || !formData.mobileNumber || !formData.description ||
        !formData.bhkType || !formData.furnishing) {
      toast.error("All fields are required");
      return;
    }

    // Validate mobile number
    if (formData.mobileNumber.length !== 10 || !/^[6-9]/.test(formData.mobileNumber)) {
      toast.error("Invalid mobile number");
      return;
    }

    try {
      setLoading(true);

      const propertyData = {
        title: formData.propertyTitle,
        price: parseFloat(formData.price),
        propertyType: formData.propertyType,
        location: formData.location,
        mobileNumber: formData.mobileNumber,
        description: formData.description,
        bhkType: formData.bhkType,
        furnishing: formData.furnishing,
      };

      const response = await adminApi.updateProperty(editingProperty.id, propertyData);
      toast.success(response?.data?.message || "Property updated successfully");

      setShowEditModal(false);
      setEditingProperty(null);
      await fetchProperties();
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
      mobileNumber: "",
      description: "",
      bhkType: "",
      furnishing: "",
    });
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
            Admin User <span className="text-blue-600">(Admin)</span>
          </span>
          <button
            onClick={() => navigate("/admin/interested-users")}
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
            Admin Dashboard
          </h1>
          <p className="text-gray-500 mt-1">
            Manage property listings
          </p>
        </div>

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
                  <option value="VILLA">Villa</option>
                  <option value="HOME">House</option>
                </select>
              </div>
            </div>

            {/* Second Row: Location, Mobile Number */}
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

            {/* Third Row: Description */}
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

            {/* Fourth Row: BHK Type and Furnishing */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? "Uploading..." : "Preview Property"}
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
                      <img
                        src={`${STATIC_BASE_URL}/${String(property.images[0]).replace(/^\/+/, "")}`}
                        alt={property.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-300">
                        <span className="text-gray-500">No Image</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-800 mb-2">
                      {property.title}
                    </h3>
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
                  <option value="VILLA">Villa</option>
                  <option value="HOME">House</option>
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

              <div className="grid grid-cols-2 gap-4">
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

export default AdminDashboard;
