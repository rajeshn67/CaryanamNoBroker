
// import { useEffect, useState } from "react";
// import { motion } from "framer-motion";
// import Navbar from "../components/Navbar";
// import Filter from "../components/Filter";
// import PropertyList from "../components/PropertyList";
 
// import ChatDrawer from "../components/ChatDrawer"; 
// import {
//   propertyApi,
//   STATIC_BASE_URL,
// } from "../services/api";

// import { getUserIdFromToken } from "../utlis/authSync";

// const BrowseProperties = () => {

//   const [tempFilters, setTempFilters] = useState({
//     type: "All",
//     city: "",
//     address: "",
//     minPrice: "",
//     maxPrice: "",
//      pgType: "",
//   });

//   const [properties, setProperties] = useState([]);

//   const [addressOptions, setAddressOptions] = useState([]);

//   const [loading, setLoading] = useState(true);

//   const [error, setError] = useState("");
//   const [chatOpen, setChatOpen] = useState(false);
//   const [chatCount, setChatCount] = useState(0);
//   const [selectedPropertyForChat, setSelectedPropertyForChat] = useState(null);
//   const currentUserId = getUserIdFromToken();

//   // =========================================
//   // TYPE MAPPER
//   // =========================================
//   const mapUiTypeToBackend = (uiType) => {

//     if (
//       !uiType ||
//       uiType === "All" ||
//       uiType === "ALL"
//     ) {
//       return null;
//     }

//     const type = uiType.toUpperCase();

//     if (type === "APARTMENT")
//       return "APARTMENT";

//     if (type === "INDEPENDENT_HOUSE")
//       return "INDEPENDENT_HOUSE";

//     if (type === "STANDALONE_BUILDING")
//       return "STANDALONE_BUILDING";

//     return null;
//   };

//   // =========================================
//   // IMAGE PARSER
//   // =========================================
//   const parseImages = (imgString) => {

//     if (!imgString) return [];

//     try {
//       return imgString
//         .replace(/^\[|\]$/g, "")
//         .split(",")
//         .map((img) => img.trim())
//         .filter(Boolean);

//     } catch {
//       return [];
//     }
//   };

//   // =========================================
//   // BACKEND → UI
//   // =========================================
//   const mapBackendToUi = (dto) => {

//     const images = parseImages(
//       dto?.doctypeImages
//     );

//     const imagePath = images?.[0];

//     const imageUrl = imagePath
//       ? `${STATIC_BASE_URL}/${String(
//           imagePath
//         ).replace(/^\/+/, "")}`
//       : "/no-image.png";

//     return {

//       id:
//         dto?.id ||
//         dto?.propertyId,

//       title:
//         dto?.title ||
//         "Untitled Property",

//       location:
//         `${dto?.city || ""} ${
//           dto?.address || ""
//         }`.trim(),

//       type:
//         dto?.propertyType ||
//         "N/A",

//       price:
//         Number(dto?.price || 0),

//       phone:
//         dto?.mobileNumber ||
//         dto?.mobile ||
//         dto?.contactNumber ||
//         "Not Available",

//       details: `
//         ${dto?.bhkType || ""}
//         ·
//         ${dto?.carpetArea || ""}
//       `,

//       image: imageUrl,

//       _raw: dto,
//     };
//   };

//   // =========================================
//   // FETCH ALL PROPERTIES
//   // =========================================
//   const fetchAll = async () => {

//     setLoading(true);

//     setError("");

//     try {

//       const res =
//         await propertyApi.getAll();

//       console.log(
//         "ALL PROPERTIES API:",
//         res.data
//       );

//       const list = Array.isArray(res?.data)
//         ? res.data
//         : res?.data?.data || [];

//       console.log(
//         "FINAL LIST:",
//         list
//       );

//       setProperties(
//         list.map(mapBackendToUi)
//       );

//     } catch (e) {

//       console.error(e);

//       setError(
//         "Failed to load properties"
//       );

//       setProperties([]);

//     } finally {

//       setLoading(false);
//     }
//   };

//   // =========================================
//   // FETCH ADDRESSES BY CITY
//   // =========================================
//   const fetchAddressesByCity = async (city) => {

//     try {

//       const userId =
//         getUserIdFromToken();

//       if (!userId || !city) {
//         setAddressOptions([]);
//         return;
//       }

//       const payload = {
//       city,
//       fetchAddressOnly: true,
//     };

//       const res =
//         await propertyApi.filter(
//           payload,
//           userId
//         );

//       console.log(
//         "CITY ADDRESS API:",
//         res.data
//       );

//       const list = Array.isArray(res?.data)
//         ? res.data
//         : res?.data?.data || [];

//       setAddressOptions(list);

//     } catch (err) {

//       console.error(err);

//       setAddressOptions([]);
//     }
//   };

//   // =========================================
//   // FILTER PROPERTIES
//   // =========================================
//   const applyBackendFilter = async (
//     filters
//   ) => {

//     setLoading(true);

//     setError("");

//     try {

//       const userId =
//         getUserIdFromToken();

//       if (!userId) {
//         setError(
//           "User not logged in"
//         );
//         return;
//       }

//       const payload = {

//         propertyType:
//           mapUiTypeToBackend(
//             filters.type
//           ),

//         city:
//           filters.city === ""
//             ? null
//             : filters.city,

//         address:
//           filters.address === ""
//             ? null
//             : filters.address,

//         minPrice:
//           filters.minPrice === ""
//             ? null
//             : Number(
//                 filters.minPrice
//               ),

//         maxPrice:
//           filters.maxPrice === ""
//             ? null
//             : Number(
//                 filters.maxPrice
//               ),

//           pgType:
//   filters.pgType === ""
//     ? null
//     : filters.pgType,
//       };

//       // REMOVE EMPTY FIELDS
//       if (!payload.propertyType)
//         delete payload.propertyType;

//       if (!payload.city)
//         delete payload.city;

//       if (!payload.address)
//         delete payload.address;

//       if (
//         !payload.minPrice ||
//         Number.isNaN(payload.minPrice)
//       ) {
//         delete payload.minPrice;
//       }

//       if (
//         !payload.maxPrice ||
//         Number.isNaN(payload.maxPrice)
//       ) {
//         delete payload.maxPrice;
//       }

//       console.log(
//         "FILTER PAYLOAD:",
//         payload
//       );

//       // NO FILTERS
//       if (
//         Object.keys(payload).length === 0
//       ) {
//         return fetchAll();
//       }

//       const res =
//         await propertyApi.filter(
//           payload,
//           userId
//         );

//       console.log(
//         "FILTER API:",
//         res.data
//       );

//       const list = Array.isArray(res?.data)
//         ? res.data
//         : res?.data?.data || [];

//       setProperties(
//         list.map(mapBackendToUi)
//       );

//     } catch (e) {

//       console.error(e);

//       setError(
//         e?.message ||
//         "Failed to filter properties"
//       );

//     } finally {

//       setLoading(false);
//     }
//   };

//   // =========================================
//   // INITIAL LOAD
//   // =========================================
//   useEffect(() => {
//     fetchAll();
//   }, []);

//   // =========================================
//   // UI
//   // =========================================
//   return (
//     <div className="bg-[#F5F7FA] min-h-screen">

//       <Navbar onOpenChat={() => setChatOpen(true)} chatCount={chatCount} />

//       <motion.div
//         initial={{
//           opacity: 0,
//           y: 20,
//         }}
//         animate={{
//           opacity: 1,
//           y: 0,
//         }}
//         className="max-w-7xl mx-auto px-6 py-6"
//       >

//         <h1 className="text-3xl font-semibold">
//           Browse Properties
//         </h1>

//         <p className="text-gray-500 mb-6">
//           Find your dream home without
//           any brokerage
//         </p>

//         {/* FILTER */}
//         <Filter
//           tempFilters={tempFilters}
//           setTempFilters={setTempFilters}
//           addressOptions={addressOptions}
//           fetchAddressesByCity={fetchAddressesByCity}

//           applyFilters={() => {
//             applyBackendFilter(
//               tempFilters
//             );
//           }}

//           clearFilters={() => {

//             const reset = {
//               type: "All",
//               city: "",
//               address: "",
//               minPrice: "",
//               maxPrice: "",
//             };

//             setTempFilters(reset);

//             setAddressOptions([]);

//             fetchAll();
//           }}
//         />

//         {/* PROPERTY LIST */}
//         <div className="mt-8">

//           {loading && (
//             <p className="text-gray-600 font-medium">
//               Loading properties...
//             </p>
//           )}

//           {error && (
//             <p className="text-red-600 font-medium">
//               {error}
//             </p>
//           )}

//           <PropertyList
//             properties={properties}
//             onChatClick={(property) => {
//               setSelectedPropertyForChat(property);
//               setChatOpen(true);
//             }}
//           />

//         </div>
//       </motion.div>

//       <ChatDrawer
//         isOpen={chatOpen}
//         onClose={() => {
//           setChatOpen(false);
//           setSelectedPropertyForChat(null);
//         }}
//         currentRole="USER"
//         currentUserId={currentUserId}
//         selectedProperty={selectedPropertyForChat}
//         onCountChange={setChatCount}
//       />
//     </div>
//   );
// };

// export default BrowseProperties;

// // ✅ FULL UPDATED BrowseProperties.jsx

// import {
//   useEffect,
//   useState,
// } from "react";

// import { motion } from "framer-motion";

// import Navbar from "../components/Navbar";
// import Filter from "../components/Filter";
// import PropertyList from "../components/PropertyList";
// import ChatDrawer from "../components/ChatDrawer";

// import {
//   propertyApi,
//   STATIC_BASE_URL,
// } from "../services/api";

// import { getUserIdFromToken } from "../utlis/authSync";

// const BrowseProperties = () => {
//   const [tempFilters, setTempFilters] =
//     useState({
//       type: "All",
//       city: "",
//       address: "",
//       minPrice: "",
//       maxPrice: "",
//       pgType: "",
//     });

//   const [properties, setProperties] =
//     useState([]);

//   const [addressOptions, setAddressOptions] =
//     useState([]);

//   const [loading, setLoading] =
//     useState(true);

//   const [error, setError] =
//     useState("");

//   // ✅ PREMIUM STATUS
//   const [premiumStatus, setPremiumStatus] =
//     useState("");

//   const [chatOpen, setChatOpen] =
//     useState(false);

//   const [chatCount, setChatCount] =
//     useState(0);

//   const [
//     selectedPropertyForChat,
//     setSelectedPropertyForChat,
//   ] = useState(null);

//   const currentUserId =
//     getUserIdFromToken();

//   // =========================================
//   // FETCH USER PREMIUM STATUS
//   // =========================================
//   const fetchPremiumStatus =
//     async () => {
//       try {
//         const token =
//           localStorage.getItem(
//             "userToken"
//           );

//         if (!token) return;

//         const userId =
//           getUserIdFromToken();

//         if (!userId) return;

//         const response =
//           await fetch(
//             `http://localhost:8080/api/user/${userId}`,
//             {
//               headers: {
//                 Authorization: `Bearer ${token}`,
//               },
//             }
//           );

//         const result =
//           await response.json();

//         console.log(
//           "USER PREMIUM API:",
//           result
//         );

//         // ✅ IMPORTANT
//         setPremiumStatus(
//           result?.data
//             ?.premiumStatus || ""
//         );
//       } catch (err) {
//         console.log(
//           "PREMIUM STATUS ERROR:",
//           err
//         );
//       }
//     };

//   // =========================================
//   // TYPE MAPPER
//   // =========================================
//   const mapUiTypeToBackend = (
//     uiType
//   ) => {
//     if (
//       !uiType ||
//       uiType === "All" ||
//       uiType === "ALL"
//     ) {
//       return null;
//     }

//     const type =
//       uiType.toUpperCase();

//     if (type === "APARTMENT")
//       return "APARTMENT";

//     if (
//       type ===
//       "INDEPENDENT_HOUSE"
//     )
//       return "INDEPENDENT_HOUSE";

//     if (
//       type ===
//       "STANDALONE_BUILDING"
//     )
//       return "STANDALONE_BUILDING";

//     return null;
//   };

//   // =========================================
//   // IMAGE PARSER
//   // =========================================
//   const parseImages = (
//     imgString
//   ) => {
//     if (!imgString) return [];

//     try {
//       return imgString
//         .replace(/^\[|\]$/g, "")
//         .split(",")
//         .map((img) =>
//           img.trim()
//         )
//         .filter(Boolean);
//     } catch {
//       return [];
//     }
//   };

//   // =========================================
//   // BACKEND → UI
//   // =========================================
//   const mapBackendToUi = (
//     dto
//   ) => {
//     const images =
//       parseImages(
//         dto?.doctypeImages
//       );

//     const imagePath =
//       images?.[0];

//     const imageUrl =
//       imagePath
//         ? `${STATIC_BASE_URL}/${String(
//             imagePath
//           ).replace(/^\/+/, "")}`
//         : "/no-image.png";

//     return {
//       id:
//         dto?.id ||
//         dto?.propertyId,

//       title:
//         dto?.title ||
//         "Untitled Property",

//       location:
//         `${dto?.city || ""} ${
//           dto?.address || ""
//         }`.trim(),

//       type:
//         dto?.propertyType ||
//         "N/A",

//       price: Number(
//         dto?.price || 0
//       ),

//       phone:
//         dto?.mobileNumber ||
//         dto?.mobile ||
//         dto?.contactNumber ||
//         "Not Available",

//       details: `
//         ${dto?.bhkType || ""}
//         ·
//         ${dto?.carpetArea || ""}
//       `,

//       image: imageUrl,

//       _raw: dto,
//     };
//   };

//   // =========================================
//   // FETCH ALL PROPERTIES
//   // =========================================
//   const fetchAll = async () => {
//     setLoading(true);

//     setError("");

//     try {
//       const res =
//         await propertyApi.getAll();

//       console.log(
//         "ALL PROPERTIES API:",
//         res.data
//       );

//       const list =
//         Array.isArray(
//           res?.data
//         )
//           ? res.data
//           : res?.data?.data || [];

//       setProperties(
//         list.map(
//           mapBackendToUi
//         )
//       );
//     } catch (e) {
//       console.error(e);

//       setError(
//         "Failed to load properties"
//       );

//       setProperties([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // =========================================
//   // FETCH ADDRESSES BY CITY
//   // =========================================
//   const fetchAddressesByCity =
//     async (city) => {
//       try {
//         const userId =
//           getUserIdFromToken();

//         if (
//           !userId ||
//           !city
//         ) {
//           setAddressOptions(
//             []
//           );
//           return;
//         }

//         const payload = {
//           city,
//           fetchAddressOnly: true,
//         };

//         const res =
//           await propertyApi.filter(
//             payload,
//             userId
//           );

//         const list =
//           Array.isArray(
//             res?.data
//           )
//             ? res.data
//             : res?.data
//                 ?.data || [];

//         setAddressOptions(
//           list
//         );
//       } catch (err) {
//         console.error(err);

//         setAddressOptions(
//           []
//         );
//       }
//     };

//   // =========================================
//   // FILTER PROPERTIES
//   // =========================================
//   const applyBackendFilter =
//     async (filters) => {
//       setLoading(true);

//       setError("");

//       try {
//         const userId =
//           getUserIdFromToken();

//         if (!userId) {
//           setError(
//             "User not logged in"
//           );
//           return;
//         }

//         const payload = {
//           propertyType:
//             mapUiTypeToBackend(
//               filters.type
//             ),

//           city:
//             filters.city ===
//             ""
//               ? null
//               : filters.city,

//           address:
//             filters.address ===
//             ""
//               ? null
//               : filters.address,

//           minPrice:
//             filters.minPrice ===
//             ""
//               ? null
//               : Number(
//                   filters.minPrice
//                 ),

//           maxPrice:
//             filters.maxPrice ===
//             ""
//               ? null
//               : Number(
//                   filters.maxPrice
//                 ),

//           pgType:
//             filters.pgType ===
//             ""
//               ? null
//               : filters.pgType,
//         };

//         if (
//           !payload.propertyType
//         )
//           delete payload.propertyType;

//         if (!payload.city)
//           delete payload.city;

//         if (
//           !payload.address
//         )
//           delete payload.address;

//         if (
//           !payload.minPrice ||
//           Number.isNaN(
//             payload.minPrice
//           )
//         ) {
//           delete payload.minPrice;
//         }

//         if (
//           !payload.maxPrice ||
//           Number.isNaN(
//             payload.maxPrice
//           )
//         ) {
//           delete payload.maxPrice;
//         }

//         if (!payload.pgType) {
//           delete payload.pgType;
//         }

//         console.log(
//           "FILTER PAYLOAD:",
//           payload
//         );

//         if (
//           Object.keys(payload)
//             .length === 0
//         ) {
//           return fetchAll();
//         }

//         const res =
//           await propertyApi.filter(
//             payload,
//             userId
//           );

//         const list =
//           Array.isArray(
//             res?.data
//           )
//             ? res.data
//             : res?.data
//                 ?.data || [];

//         setProperties(
//           list.map(
//             mapBackendToUi
//           )
//         );
//       } catch (e) {
//         console.error(e);

//         setError(
//           e?.message ||
//             "Failed to filter properties"
//         );
//       } finally {
//         setLoading(false);
//       }
//     };

//   // =========================================
//   // INITIAL LOAD
//   // =========================================
//   useEffect(() => {
//     fetchAll();

//     // ✅ FETCH PREMIUM STATUS
//     fetchPremiumStatus();
//   }, []);

//   // =========================================
//   // UI
//   // =========================================
//   return (
//     <div className="bg-[#F5F7FA] min-h-screen">
//       <Navbar
//         onOpenChat={() =>
//           setChatOpen(true)
//         }
//         chatCount={chatCount}
//       />

//       <motion.div
//         initial={{
//           opacity: 0,
//           y: 20,
//         }}
//         animate={{
//           opacity: 1,
//           y: 0,
//         }}
//         className="max-w-7xl mx-auto px-6 py-6"
//       >
//         <h1 className="text-3xl font-semibold">
//           Browse Properties
//         </h1>

//         <p className="text-gray-500 mb-3">
//           Find your dream home
//           without any brokerage
//         </p>

//         {/* ✅ PREMIUM STATUS */}
//         <div className="mb-6">
//           <span
//             className={`px-4 py-2 rounded-xl text-sm font-bold
//             ${
//               premiumStatus ===
//               "APPROVED"
//                 ? "bg-green-500 text-white"
//                 : ""
//             }
//             ${
//               premiumStatus ===
//               "PENDING"
//                 ? "bg-yellow-400 text-black"
//                 : ""
//             }
//             ${
//               premiumStatus ===
//               "REJECTED"
//                 ? "bg-red-500 text-white"
//                 : ""
//             }`}
//           >
//             Premium Status :
//             {" "}
//             {premiumStatus ||
//               "NOT PREMIUM"}
//           </span>
//         </div>

//         {/* FILTER */}
//         <Filter
//           tempFilters={
//             tempFilters
//           }
//           setTempFilters={
//             setTempFilters
//           }
//           addressOptions={
//             addressOptions
//           }
//           fetchAddressesByCity={
//             fetchAddressesByCity
//           }
//           applyFilters={() => {
//             applyBackendFilter(
//               tempFilters
//             );
//           }}
//           clearFilters={() => {
//             const reset = {
//               type: "All",
//               city: "",
//               address: "",
//               minPrice: "",
//               maxPrice: "",
//               pgType: "",
//             };

//             setTempFilters(
//               reset
//             );

//             setAddressOptions(
//               []
//             );

//             fetchAll();
//           }}
//         />

//         {/* PROPERTY LIST */}
//         <div className="mt-8">
//           {loading && (
//             <p className="text-gray-600 font-medium">
//               Loading
//               properties...
//             </p>
//           )}

//           {error && (
//             <p className="text-red-600 font-medium">
//               {error}
//             </p>
//           )}

//           <PropertyList
//             properties={
//               properties
//             }

//             // ✅ IMPORTANT
//             premiumStatus={
//               premiumStatus
//             }

//             onChatClick={(
//               property
//             ) => {
//               setSelectedPropertyForChat(
//                 property
//               );

//               setChatOpen(
//                 true
//               );
//             }}
//           />
//         </div>
//       </motion.div>

//       <ChatDrawer
//         isOpen={chatOpen}
//         onClose={() => {
//           setChatOpen(false);

//           setSelectedPropertyForChat(
//             null
//           );
//         }}
//         currentRole="USER"
//         currentUserId={
//           currentUserId
//         }
//         selectedProperty={
//           selectedPropertyForChat
//         }
//         onCountChange={
//           setChatCount
//         }
//       />
//     </div>
//   );
// };

// export default BrowseProperties;


import {
  useEffect,
  useState,
} from "react";

import { jwtDecode } from "jwt-decode";
import { motion } from "framer-motion";

import Navbar from "../components/Navbar";
import Filter from "../components/Filter";
import PropertyList from "../components/PropertyList";
import ChatDrawer from "../components/ChatDrawer";

import {
  propertyApi,
  STATIC_BASE_URL,
} from "../services/api";

import { getUserIdFromToken } from "../utlis/authSync";

const USER_NAME_KEY = "userName";
const USER_NAME_BY_EMAIL_KEY = "userNameByEmail";

const getUserNameFromStorage = () => {
  const userName = String(localStorage.getItem(USER_NAME_KEY) || "").trim();
  return userName || "User";
};

const rememberUserName = (decoded) => {
  const userName = String(decoded?.fullName || decoded?.name || "").trim();
  if (!userName) return null;

  localStorage.setItem(USER_NAME_KEY, userName);

  const userEmail = String(decoded?.sub || "").toLowerCase().trim();
  if (userEmail) {
    let userNameMap = {};
    try {
      userNameMap = JSON.parse(localStorage.getItem(USER_NAME_BY_EMAIL_KEY) || "{}");
    } catch {
      userNameMap = {};
    }
    userNameMap[userEmail] = userName;
    localStorage.setItem(USER_NAME_BY_EMAIL_KEY, JSON.stringify(userNameMap));
  }

  return userName;
};

const BrowseProperties = () => {
  const [tempFilters, setTempFilters] =
    useState({
      type: "All",
      city: "",
      address: "",
      minPrice: "",
      maxPrice: "",
      pgType: "",
    });

  const [properties, setProperties] =
    useState([]);

  const [addressOptions, setAddressOptions] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [premiumStatus, setPremiumStatus] =
    useState("");

  const [chatOpen, setChatOpen] =
    useState(false);

  const [chatCount, setChatCount] =
    useState(0);

  const [
    selectedPropertyForChat,
    setSelectedPropertyForChat,
  ] = useState(null);

  const [userName, setUserName] = useState(getUserNameFromStorage);

  const currentUserId =
    getUserIdFromToken();

  // =========================================
  // FETCH USER PREMIUM STATUS
  // =========================================
  const fetchPremiumStatus =
    async () => {
      try {
        const token =
          localStorage.getItem(
            "userToken"
          );

        if (!token) return;

        const userId =
          getUserIdFromToken();

        if (!userId) return;

        const response =
          await fetch(
            `http://localhost:8080/api/user/${userId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

        const result =
          await response.json();

        console.log(
          "USER PREMIUM API:",
          result
        );

        setPremiumStatus(
          result?.data
            ?.premiumStatus || ""
        );
      } catch (err) {
        console.log(
          "PREMIUM STATUS ERROR:",
          err
        );
      }
    };

  // =========================================
  // TYPE MAPPER
  // =========================================
  const mapUiTypeToBackend = (
    uiType
  ) => {
    if (
      !uiType ||
      uiType === "All" ||
      uiType === "ALL"
    ) {
      return null;
    }

    const type =
      uiType.toUpperCase();

    if (type === "APARTMENT")
      return "APARTMENT";

    if (
      type ===
      "INDEPENDENT_HOUSE"
    )
      return "INDEPENDENT_HOUSE";

    if (
      type ===
      "STANDALONE_BUILDING"
    )
      return "STANDALONE_BUILDING";

    return null;
  };

  // =========================================
  // IMAGE PARSER
  // =========================================
  const parseImages = (
    imgString
  ) => {
    if (!imgString) return [];

    try {
      return imgString
        .replace(/^\[|\]$/g, "")
        .split(",")
        .map((img) =>
          img.trim()
        )
        .filter(Boolean);
    } catch {
      return [];
    }
  };

  // =========================================
  // BACKEND → UI
  // =========================================
  const mapBackendToUi = (
    dto
  ) => {
    const images =
      parseImages(
        dto?.doctypeImages
      );

    const imagePath =
      images?.[0];

    const imageUrl =
      imagePath
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

      propertyType:
        dto?.propertyType ||
        dto?.type ||
        "PROPERTY",

      type:
        dto?.propertyType ||
        dto?.type ||
        "PROPERTY",

      location:
        dto?.location ||
        `${dto?.city || ""} ${
          dto?.address || ""
        }`.trim(),

      city:
        dto?.city || "",

      address:
        dto?.address || "",

      bhkType:
        dto?.bhkType ||
        dto?.bhk ||
        "",

      price: Number(
        dto?.price || 0
      ),

      phone:
        dto?.mobileNumber ||
        dto?.mobile ||
        dto?.contactNumber ||
        "Not Available",

      details:
        dto?.description ||
        "No details available",

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

      const list =
        Array.isArray(
          res?.data
        )
          ? res.data
          : res?.data?.data || [];

      setProperties(
        list.map(
          mapBackendToUi
        )
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
  const fetchAddressesByCity =
    async (city) => {
      try {
        const userId =
          getUserIdFromToken();

        if (
          !userId ||
          !city
        ) {
          setAddressOptions(
            []
          );
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

        const list =
          Array.isArray(
            res?.data
          )
            ? res.data
            : res?.data
                ?.data || [];

        setAddressOptions(
          list
        );
      } catch (err) {
        console.error(err);

        setAddressOptions(
          []
        );
      }
    };

  // =========================================
  // FILTER PROPERTIES
  // =========================================
  const applyBackendFilter =
    async (filters) => {
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

          pgType:
            filters.pgType === ""
              ? null
              : filters.pgType,
        };

        if (
          !payload.propertyType
        )
          delete payload.propertyType;

        if (!payload.city)
          delete payload.city;

        if (
          !payload.address
        )
          delete payload.address;

        if (
          !payload.minPrice ||
          Number.isNaN(
            payload.minPrice
          )
        ) {
          delete payload.minPrice;
        }

        if (
          !payload.maxPrice ||
          Number.isNaN(
            payload.maxPrice
          )
        ) {
          delete payload.maxPrice;
        }

        if (!payload.pgType) {
          delete payload.pgType;
        }

        console.log(
          "FILTER PAYLOAD:",
          payload
        );

        if (
          Object.keys(payload)
            .length === 0
        ) {
          return fetchAll();
        }

        const res =
          await propertyApi.filter(
            payload,
            userId
          );

        const list =
          Array.isArray(
            res?.data
          )
            ? res.data
            : res?.data
                ?.data || [];

        setProperties(
          list.map(
            mapBackendToUi
          )
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
  // DECODE TOKEN AND SET USER NAME
  // =========================================
  useEffect(() => {
    const token = localStorage.getItem("userToken");
    if (!token) return;

    try {
      const decoded = jwtDecode(token);
      setUserName(rememberUserName(decoded) || getUserNameFromStorage());
    } catch {
      console.log("Error decoding token for user name");
    }
  }, []);

  // =========================================
  // INITIAL LOAD
  // =========================================
  useEffect(() => {
    fetchAll();
    fetchPremiumStatus();
  }, []);

  return (
    <div className="bg-[#F5F7FA] min-h-screen">
      <Navbar
        userName={userName}
        onOpenChat={() =>
          setChatOpen(true)
        }
        chatCount={chatCount}
      />

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

        <p className="text-gray-500 mb-3">
          Find your dream home
          without any brokerage
        </p>

        <Filter
          tempFilters={
            tempFilters
          }
          setTempFilters={
            setTempFilters
          }
          addressOptions={
            addressOptions
          }
          fetchAddressesByCity={
            fetchAddressesByCity
          }
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
              pgType: "",
            };

            setTempFilters(
              reset
            );

            setAddressOptions(
              []
            );

            fetchAll();
          }}
        />

        <div className="mt-8">
          {loading && (
            <p className="text-gray-600 font-medium">
              Loading
              properties...
            </p>
          )}

          {error && (
            <p className="text-red-600 font-medium">
              {error}
            </p>
          )}

          <PropertyList
            properties={
              properties
            }
            premiumStatus={
              premiumStatus
            }
            onChatClick={(
              property
            ) => {
              setSelectedPropertyForChat(
                property
              );

              setChatOpen(
                true
              );
            }}
          />
        </div>
      </motion.div>

      <footer className="bg-slate-900 text-white py-12 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-[#ff7f50] to-[#ff9f80] rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">C</span>
                </div>
                <span className="text-2xl font-black">Caryanam</span>
              </div>
              <p className="text-slate-400 text-sm">
                India's first no-brokerage platform connecting property owners
                directly with tenants.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li>
                  <a href="/home" className="hover:text-white transition-colors">
                    Home
                  </a>
                </li>
                <li>
                  <a href="/browse" className="hover:text-white transition-colors">
                    Browse Properties
                  </a>
                </li>
                <li>
                  <a href="/login" className="hover:text-white transition-colors">
                    About Us
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Locations</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li>Pune</li>
                <li>PCMC</li>
                <li>Mumbai</li>
                <li>Coming Soon</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Contact</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li>support@caryanam.com</li>
                <li>+91 98765 43210</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-slate-400 text-sm">
            <p> 2024 Caryanam. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <ChatDrawer
        isOpen={chatOpen}
        onClose={() => {
          setChatOpen(false);
          setSelectedPropertyForChat(
            null
          );
        }}
        currentRole="USER"
        currentUserId={
          currentUserId
        }
        selectedProperty={
          selectedPropertyForChat
        }
        onCountChange={
          setChatCount
        }
      />
    </div>
  );
};

export default BrowseProperties;