import { BrowserRouter, Routes, Route } from "react-router-dom";

import BrowseProperties from "./pages/BrowseProperties";
import PropertyDetails from "./pages/PropertyDetails";
import AdminDashboard from "./pages/AdminDashboard";
import AdminDashboardMain from "./pages/AdminDashboardMain";
import Auth from "./pages/Auth";
import ProtectedRoute from "./routes/ProtectedRoute";
import BuyPremium from "./pages/BuyPremium";
import Home from "./pages/Home";
import ForgotPassword from "./pages/ForgotPassword";
function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public Route */}
        <Route path="/" element={<Home />} />

        <Route path="/login" element={<Auth />} />
        <Route path="/buy-premium" element={<BuyPremium />} />

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
              <AdminDashboardMain />
            </ProtectedRoute>
          }
        />

<Route path="/forgot-password" element={<ForgotPassword />} />


        <Route
          path="/owner"
          element={
            <ProtectedRoute role="ROLE_PROPERTY_OWNER">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;