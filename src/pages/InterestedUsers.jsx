import React from "react";
import { useNavigate } from "react-router-dom";

const InterestedUsers = () => {
  const navigate = useNavigate();

  return (
    <div style={{ width: "100%", minHeight: "100vh", backgroundColor: "#F5F7FA", padding: 0, margin: 0 }}>
      {/* Header */}
      <div style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 24px", backgroundColor: "white", boxShadow: "0 1px 2px rgba(0,0,0,0.1)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button onClick={() => navigate("/admin")} style={{ background: "none", border: "none", cursor: "pointer", color: "#666", fontSize: "18px", padding: "8px" }}>
            ← Back
          </button>
          <h1 style={{ color: "#2563EB", fontWeight: "bold", fontSize: "18px", margin: 0 }}>Interested Users</h1>
        </div>
        <div>
          <button onClick={() => navigate("/login")} style={{ background: "none", border: "none", cursor: "pointer", color: "#EF4444", fontWeight: "500", fontSize: "14px", padding: "8px" }}>
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "24px" }}>
        <div style={{ backgroundColor: "white", borderRadius: "8px", padding: "24px", boxShadow: "0 1px 2px rgba(0,0,0,0.1)" }}>
          <h2 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "20px", color: "#1F2937" }}>Interested Users List</h2>
          
          {/* User 1 */}
          <div style={{ borderBottom: "1px solid #E5E7EB", padding: "16px 0", display: "flex", justifyContent: "space-between" }}>
            <div>
              <h3 style={{ fontWeight: "600", color: "#1F2937", marginBottom: "4px", margin: 0 }}>Rahul Verma</h3>
              <p style={{ fontSize: "14px", color: "#6B7280", margin: 0 }}>rahul.verma@email.com</p>
              <p style={{ fontSize: "14px", color: "#4B5563", margin: "4px 0 0 0" }}>Interested in: Skyline Apartment</p>
            </div>
            <span style={{ fontSize: "12px", color: "#9CA3AF" }}>Apr 10, 2026</span>
          </div>

          {/* User 2 */}
          <div style={{ borderBottom: "1px solid #E5E7EB", padding: "16px 0", display: "flex", justifyContent: "space-between" }}>
            <div>
              <h3 style={{ fontWeight: "600", color: "#1F2937", marginBottom: "4px", margin: 0 }}>Priya Nair</h3>
              <p style={{ fontSize: "14px", color: "#6B7280", margin: 0 }}>priya.nair@email.com</p>
              <p style={{ fontSize: "14px", color: "#4B5563", margin: "4px 0 0 0" }}>Interested in: Elegant Garden Villa</p>
            </div>
            <span style={{ fontSize: "12px", color: "#9CA3AF" }}>Apr 12, 2026</span>
          </div>

          {/* User 3 */}
          <div style={{ borderBottom: "1px solid #E5E7EB", padding: "16px 0", display: "flex", justifyContent: "space-between" }}>
            <div>
              <h3 style={{ fontWeight: "600", color: "#1F2937", marginBottom: "4px", margin: 0 }}>Anil Kumar</h3>
              <p style={{ fontSize: "14px", color: "#6B7280", margin: 0 }}>anil.kumar@email.com</p>
              <p style={{ fontSize: "14px", color: "#4B5563", margin: "4px 0 0 0" }}>Interested in: Cozy Independent House</p>
            </div>
            <span style={{ fontSize: "12px", color: "#9CA3AF" }}>Apr 14, 2026</span>
          </div>

          {/* User 4 */}
          <div style={{ borderBottom: "1px solid #E5E7EB", padding: "16px 0", display: "flex", justifyContent: "space-between" }}>
            <div>
              <h3 style={{ fontWeight: "600", color: "#1F2937", marginBottom: "4px", margin: 0 }}>Sneha Patel</h3>
              <p style={{ fontSize: "14px", color: "#6B7280", margin: 0 }}>sneha.patel@email.com</p>
              <p style={{ fontSize: "14px", color: "#4B5563", margin: "4px 0 0 0" }}>Interested in: Modern Studio Apartment</p>
            </div>
            <span style={{ fontSize: "12px", color: "#9CA3AF" }}>Apr 15, 2026</span>
          </div>

          {/* User 5 */}
          <div style={{ borderBottom: "1px solid #E5E7EB", padding: "16px 0", display: "flex", justifyContent: "space-between" }}>
            <div>
              <h3 style={{ fontWeight: "600", color: "#1F2937", marginBottom: "4px", margin: 0 }}>Vikram Singh</h3>
              <p style={{ fontSize: "14px", color: "#6B7280", margin: 0 }}>vikram.singh@email.com</p>
              <p style={{ fontSize: "14px", color: "#4B5563", margin: "4px 0 0 0" }}>Interested in: Luxury Penthouse</p>
            </div>
            <span style={{ fontSize: "12px", color: "#9CA3AF" }}>Apr 16, 2026</span>
          </div>

          {/* User 6 */}
          <div style={{ padding: "16px 0", display: "flex", justifyContent: "space-between" }}>
            <div>
              <h3 style={{ fontWeight: "600", color: "#1F2937", marginBottom: "4px", margin: 0 }}>Meera Joshi</h3>
              <p style={{ fontSize: "14px", color: "#6B7280", margin: 0 }}>meera.joshi@email.com</p>
              <p style={{ fontSize: "14px", color: "#4B5563", margin: "4px 0 0 0" }}>Interested in: Family Bungalow</p>
            </div>
            <span style={{ fontSize: "12px", color: "#9CA3AF" }}>Apr 17, 2026</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterestedUsers;