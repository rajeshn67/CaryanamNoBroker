// import { Navigate } from "react-router-dom";
// import { jwtDecode } from "jwt-decode"; 

// const ProtectedRoute = ({ children, role }) => {
 
//    const adminToken = localStorage.getItem("adminToken");
//   const userToken = localStorage.getItem("userToken");
//   let token = null;

//   if (role === "ROLE_ADMIN") {  
//    token = adminToken;
//   } else if (role === "ROLE_USER") {
//     token = userToken;
//   }
//   if (!token) return <Navigate to="/login" />;

//   try {
//     const decoded = jwtDecode(token);
//     const currentTime = Date.now() / 1000;

//     if (decoded.exp < currentTime) {
//       localStorage.removeItem("admintoken");
//       localStorage.removeItem("usertoken");
//       return <Navigate to="/login" />;
//     }
// const userRole = decoded.role || decoded.roles?.[0];
//   if (role && userRole !== role) {
//       return <Navigate to="/login" />;
//     }
//     return children;

//   } catch (error) {
//     localStorage.removeItem("adminToken");
//     localStorage.removeItem("userToken");
//     return <Navigate to="/login" />;
//   }
// };

// export default ProtectedRoute;


import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const ProtectedRoute = ({ children, role }) => {
  const adminToken = localStorage.getItem("adminToken");
  const userToken = localStorage.getItem("userToken");

  let token = null;

  // 🔐 Role based token select
  if (role === "ROLE_ADMIN") {
    token = adminToken;
  } else if (role === "ROLE_USER") {
    token = userToken;
  }

  // ❌ Token nahi → login
  if (!token) return <Navigate to="/login" replace />;

  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;

    // ⏰ Token expired
    if (decoded.exp < currentTime) {
      if (role === "ROLE_ADMIN") {
        localStorage.removeItem("adminToken");
      } else {
        localStorage.removeItem("userToken");
        localStorage.removeItem("userEmail"); // ⭐ important for multi-user fix
      }
      return <Navigate to="/login" replace />;
    }

    // 🎭 Role check
    const userRole = decoded.role || decoded.roles?.[0];

    if (role && userRole !== role) {
      return <Navigate to="/login" replace />;
    }

    return children;

  } catch (error) {
    // ⚠️ Invalid token
    if (role === "ROLE_ADMIN") {
      localStorage.removeItem("adminToken");
    } else {
      localStorage.removeItem("userToken");
      localStorage.removeItem("userEmail");
    }

    return <Navigate to="/login" replace />;
  }
};

export default ProtectedRoute;