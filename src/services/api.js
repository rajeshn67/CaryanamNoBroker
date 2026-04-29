// import axios from 'axios';

// const API_BASE_URL =
//   import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, '') ||
//   'http://localhost:8080/api';

// export const API_ORIGIN = (() => {
//   try {
//     return new URL(API_BASE_URL).origin;
//   } catch {
//     return 'http://localhost:8080';
//   }
// })();

// export const STATIC_BASE_URL =
//   import.meta.env.VITE_STATIC_BASE_URL?.replace(/\/+$/, '') || API_ORIGIN;

// const api = axios.create({
//   baseURL: API_BASE_URL,
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// const uploadApi = axios.create({
//   baseURL: API_BASE_URL,
// });

// const rootApi = axios.create({
//   baseURL: API_ORIGIN,
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

// const resolveAuthTokenForPath = (path = "") => {
//   if (path.startsWith("/auth/")) return null;
//   if (path.startsWith("/owner/")) return localStorage.getItem("ownerToken");
//   if (path.startsWith("/admin/")) return localStorage.getItem("adminToken");
//   if (path.startsWith("/user/")) return localStorage.getItem("userToken");

//   const adminToken = localStorage.getItem("adminToken");
//   const ownerToken = localStorage.getItem("ownerToken");
//   const userToken = localStorage.getItem("userToken");
//   return adminToken || ownerToken || userToken || null;
// };

// const attachAuthHeader = (config) => {
//   const path = config?.url || "";
//   const token = resolveAuthTokenForPath(path);
//   if (token) {
//     config.headers = config.headers || {};
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// };

// api.interceptors.request.use(attachAuthHeader);
// uploadApi.interceptors.request.use(attachAuthHeader);
// rootApi.interceptors.request.use(attachAuthHeader);

// const normalizeApiResponse = (response) => {
//   const apiStatus = response?.data?.status;
//   if (typeof apiStatus === "number" && apiStatus >= 400) {
//     const error = new Error(response?.data?.message || "Request failed");
//     error.response = response;
//     throw error;
//   }
//   return response;
// };

// api.interceptors.response.use(
//   (response) => normalizeApiResponse(response),
//   (error) => Promise.reject(error)
// );

// uploadApi.interceptors.response.use(
//   (response) => normalizeApiResponse(response),
//   (error) => Promise.reject(error)
// );

// rootApi.interceptors.response.use(
//   (response) => normalizeApiResponse(response),
//   (error) => Promise.reject(error)
// );

// // Admin API calls
// export const adminApi = {
//   // Add property by owner
//   addProperty: (ownerId, propertyData) => {
//     return api.post(`/admin/addPropertyByOwner/${ownerId}`, propertyData);
//   },

//   // Get properties by owner (served on root /admin controller)
//   getOwnerProperties: (ownerId) => {
//     return rootApi.get(`/admin/owner/${ownerId}/properties`);
//   },

//   // Get property by ID
//   getPropertyById: (id) => {
//     return api.get(`/admin/getPropertyById/${id}`);
//   },

//   // Update property
//   updateProperty: (id, propertyData) => {
//     return api.put(`/admin/updatePropertyById/${id}`, propertyData);
//   },

//   // Delete property
//   deleteProperty: (id) => {
//     return api.delete(`/admin/deletePropertyById/${id}`);
//   },

//   // Upload property images
//   uploadPropertyImages: (propertyId, formData) => {
//     return uploadApi.post(`/admin/uploadPropertyImagesByPropertyId/${propertyId}`, formData);
//   },

//   // Buy premium
//   buyPremium: (ownerId) => {
//     return api.post(`/admin/buyPremiumByOwner/${ownerId}`);
//   },
// };

// // Owner API calls (aligned with backend /api/owner controller)
// export const ownerApi = {
//   addProperty: (ownerId, propertyData) =>
//     api.post(`/owner/addPropertyByOwner/${ownerId}`, propertyData),
//   getOwnerProperties: (ownerId) =>
//     api.get(`/owner/${ownerId}/properties`),
//   getPropertyById: (id) => api.get(`/owner/getPropertyById/${id}`),
//   updateProperty: (id, propertyData) =>
//     api.put(`/owner/updatePropertyById/${id}`, propertyData),
//   deleteProperty: (id) => api.delete(`/owner/deletePropertyById/${id}`),
//   uploadPropertyImages: (propertyId, formData) =>
//     uploadApi.post(`/owner/uploadPropertyImagesByPropertyId/${propertyId}`, formData),
//   buyPremium: (ownerId) => api.post(`/owner/buyPremiumByOwner/${ownerId}`),
// };

// // Public API calls
// export const propertyApi = {
//   // Get all properties
//   getAll: () => {
//     return api.get('/properties/getAll');
//   },

//   // Filter properties
//   filter: (filterData) => {
//     return api.post('/properties/filter', filterData);
//   },

//   // Get property by ID
//   getById: (id) => {
//     return api.get(`/properties/${id}`);
//   },
// };
// export const authApi = {
//   login: (data) => api.post("/auth/login", data),
//   registerUser: (data) => api.post("/auth/register/user", data),
//   registerAdmin: (data) => api.post("/auth/register/admin", data),
//   registerOwner: (data) => api.post("/auth/register/POwner", data),
// };

// const withAdminFallback = async (path, method = "get", data) => {
//   try {
//     if (method === "get") return await api.get(path);
//     return await api.post(path, data);
//   } catch (firstError) {
//     const rootPath = path.startsWith("/admin/") ? path : `/admin${path}`;
//     if (method === "get") return await rootApi.get(rootPath);
//     return await rootApi.post(rootPath, data);
//   }
// };

// export const adminModerationApi = {
//   getPendingUsers: () => withAdminFallback("/admin/pending-users"),
//   getPendingOwners: () => withAdminFallback("/admin/pending-Owner"),
//   approveUserPremium: (userId) =>
//     withAdminFallback(`/admin/approveUserPremium/${userId}`, "post"),
//   rejectUserPremium: (userId) =>
//     withAdminFallback(`/admin/rejectUserPremium/${userId}`, "post"),
//   approveOwnerPremium: (ownerId) =>
//     withAdminFallback(`/admin/approveOwnerPremium/${ownerId}`, "post"),
//   rejectOwnerPremium: (ownerId) =>
//     withAdminFallback(`/admin/rejectOwnerPremium/${ownerId}`, "post"),
// };

// export default api;




import axios from 'axios';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, '') ||
  'http://localhost:8080/api';

export const API_ORIGIN = (() => {
  try {
    return new URL(API_BASE_URL).origin;
  } catch {
    return 'http://localhost:8080';
  }
})();

export const STATIC_BASE_URL =
  import.meta.env.VITE_STATIC_BASE_URL?.replace(/\/+$/, '') || API_ORIGIN;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const uploadApi = axios.create({
  baseURL: API_BASE_URL,
});

const rootApi = axios.create({
  baseURL: API_ORIGIN,
  headers: {
    "Content-Type": "application/json",
  },
});

const resolveAuthTokenForPath = (path = "") => {
  if (path.startsWith("/auth/")) return null;
  if (path.startsWith("/owner/")) return localStorage.getItem("ownerToken");
  if (path.startsWith("/admin/")) return localStorage.getItem("adminToken");
  if (path.startsWith("/user/")) return localStorage.getItem("userToken");

  const adminToken = localStorage.getItem("adminToken");
  const ownerToken = localStorage.getItem("ownerToken");
  const userToken = localStorage.getItem("userToken");
  return adminToken || ownerToken || userToken || null;
};

const attachAuthHeader = (config) => {
  const path = config?.url || "";
  const token = resolveAuthTokenForPath(path);
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

api.interceptors.request.use(attachAuthHeader);
uploadApi.interceptors.request.use(attachAuthHeader);
rootApi.interceptors.request.use(attachAuthHeader);

const normalizeApiResponse = (response) => {
  const apiStatus = response?.data?.status;
  if (typeof apiStatus === "number" && apiStatus >= 400) {
    const error = new Error(response?.data?.message || "Request failed");
    error.response = response;
    throw error;
  }
  return response;
};

api.interceptors.response.use(
  (response) => normalizeApiResponse(response),
  (error) => Promise.reject(error)
);

uploadApi.interceptors.response.use(
  (response) => normalizeApiResponse(response),
  (error) => Promise.reject(error)
);

rootApi.interceptors.response.use(
  (response) => normalizeApiResponse(response),
  (error) => Promise.reject(error)
);

// Admin API calls
export const adminApi = {
  // Add property by owner
  addProperty: (ownerId, propertyData) => {
    return api.post(`/admin/addPropertyByOwner/${ownerId}`, propertyData);
  },

  // Get properties by owner (served on root /admin controller)
  getOwnerProperties: (ownerId) => {
    return rootApi.get(`/admin/owner/${ownerId}/properties`);
  },

  // Get property by ID
  getPropertyById: (id) => {
    return api.get(`/admin/getPropertyById/${id}`);
  },

  // Update property
  updateProperty: (id, propertyData) => {
    return api.put(`/admin/updatePropertyById/${id}`, propertyData);
  },

  // Delete property
  deleteProperty: (id) => {
    return api.delete(`/admin/deletePropertyById/${id}`);
  },

  // Upload property images
  uploadPropertyImages: (propertyId, formData) => {
    return uploadApi.post(`/admin/uploadPropertyImagesByPropertyId/${propertyId}`, formData);
  },

  // Buy premium
  buyPremium: (ownerId) => {
    return api.post(`/admin/buyPremiumByOwner/${ownerId}`);
  },
};

// Owner API calls (aligned with backend /api/owner controller)
export const ownerApi = {
  addProperty: (ownerId, propertyData) =>
    api.post(`/owner/addPropertyByOwner/${ownerId}`, propertyData),
  getOwnerProperties: (ownerId) =>
    api.get(`/owner/${ownerId}/properties`),
  getPropertyById: (id) => api.get(`/owner/getPropertyById/${id}`),
  updateProperty: (id, propertyData) =>
    api.put(`/owner/updatePropertyById/${id}`, propertyData),
  deleteProperty: (id) => api.delete(`/owner/deletePropertyById/${id}`),
  uploadPropertyImages: (propertyId, formData) =>
    uploadApi.post(`/owner/uploadPropertyImagesByPropertyId/${propertyId}`, formData),
  buyPremium: (ownerId) => api.post(`/owner/buyPremiumByOwner/${ownerId}`),
};

// Public API calls
// export const propertyApi = {
//   // Get all properties
//   getAll: () => {
//     return api.get('/api/user/properties/{userId}');
//   },
export const propertyApi = {
  getAll: () => {
    const token = localStorage.getItem("userToken");

    let userId = null;

    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        userId = payload.id; // ✅ तुझ्या token मध्ये "id" आहे
      } catch (e) {
        console.log("Invalid token");
      }
    }

    console.log("Final UserId:", userId);

    return api.get(`/user/properties/${userId}`); // ✅ fixed
  },


  // Filter properties
  filter: (filterData) => {
    return api.post('/properties/filter', filterData);
  },

  // Get property by ID
  // getById: (id) => {
  //   return api.get(`/properties/${id}`);
  // },
  getById: (id) => {
  return api.get(`/owner/getPropertyById/${id}`);
},
};
export const authApi = {
  login: (data) => api.post("/auth/login", data),
  registerUser: (data) => api.post("/auth/register/user", data),
  registerAdmin: (data) => api.post("/auth/register/admin", data),
  registerOwner: (data) => api.post("/auth/register/POwner", data),
};

const withAdminFallback = async (path, method = "get", data) => {
  try {
    if (method === "get") return await api.get(path);
    return await api.post(path, data);
  } catch (firstError) {
    const rootPath = path.startsWith("/admin/") ? path : `/admin${path}`;
    if (method === "get") return await rootApi.get(rootPath);
    return await rootApi.post(rootPath, data);
  }
};

export const adminModerationApi = {
  getPendingUsers: () => withAdminFallback("/admin/pending-users"),
  getPendingOwners: () => withAdminFallback("/admin/pending-Owner"),
  approveUserPremium: (userId) =>
    withAdminFallback(`/admin/approveUserPremium/${userId}`, "post"),
  rejectUserPremium: (userId) =>
    withAdminFallback(`/admin/rejectUserPremium/${userId}`, "post"),
  approveOwnerPremium: (ownerId) =>
    withAdminFallback(`/admin/approveOwnerPremium/${ownerId}`, "post"),
  rejectOwnerPremium: (ownerId) =>
    withAdminFallback(`/admin/rejectOwnerPremium/${ownerId}`, "post"),
};

export default api;