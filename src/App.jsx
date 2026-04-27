import { BrowserRouter, Routes, Route } from "react-router-dom";
import BrowseProperties from "./pages/BrowseProperties";
import PropertyDetails from "./pages/PropertyDetails";
import AdminDashboard from "./pages/AdminDashboard";
import InterestedUsers from "./pages/InterestedUsers";
import Auth from "./pages/Auth";
import ProtectedRoute from "./routes/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public Route */}
        <Route path="/" element={<Auth />} />

        <Route path="/login" element={<Auth />} />

        {/* USER PROTECTED */}
       <Route
  path="/user"
  element={
    <ProtectedRoute role="ROLE_USER">
      <BrowseProperties />
    </ProtectedRoute>
  }
/>

        {/* PROPERTY DETAILS PROTECTED */}
        <Route
          path="/property/:id"
          element={
            <ProtectedRoute role="ROLE_USER">
              <PropertyDetails />
            </ProtectedRoute>
          }
        />

        {/* ADMIN PROTECTED */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="ROLE_ADMIN">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Static Interested Users demo page */}
        <Route path="/interested-users" element={<InterestedUsers />} />
        <Route path="/admin/interested-users" element={<InterestedUsers />} />

        <Route
          path="/owner"
          element={
            <ProtectedRoute role="ROLE_PROPERTY_OWNER">
              <div>Owner Dashboard</div>
            </ProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;