import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminModerationApi } from "../services/api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AdminDashboardMain = () => {
  const navigate = useNavigate();
  const [pendingUsers, setPendingUsers] = useState([]);
  const [pendingOwners, setPendingOwners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState("");

  const logout = () => {
    localStorage.removeItem("adminToken");
    localStorage.setItem("adminLogout", Date.now().toString());
    const channel = new BroadcastChannel("admin-auth");
    channel.postMessage("logout");
    channel.close();
    navigate("/login");
  };

  const loadPendingData = async () => {
    setLoading(true);
    try {
      const [usersRes, ownersRes] = await Promise.all([
        adminModerationApi.getPendingUsers(),
        adminModerationApi.getPendingOwners(),
      ]);
      setPendingUsers(Array.isArray(usersRes?.data) ? usersRes.data : usersRes?.data?.data || []);
      setPendingOwners(Array.isArray(ownersRes?.data) ? ownersRes.data : ownersRes?.data?.data || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPendingData();
  }, []);

  const handleDecision = async ({ id, type, approve }) => {
    const actionKey = `${type}-${id}-${approve ? "approve" : "reject"}`;
    setActionLoading(actionKey);
    try {
      if (type === "user") {
        if (approve) await adminModerationApi.approveUserPremium(id);
        else await adminModerationApi.rejectUserPremium(id);
      } else {
        if (approve) await adminModerationApi.approveOwnerPremium(id);
        else await adminModerationApi.rejectOwnerPremium(id);
      }
      toast.success(`Request ${approve ? "approved" : "rejected"} successfully`);
      await loadPendingData();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Action failed");
    } finally {
      setActionLoading("");
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      <div className="flex justify-between items-center px-6 py-4 bg-white shadow-sm">
        <h1 className="text-blue-600 font-bold text-xl">Caryanam Admin Panel</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/owner")}
            className="px-3 py-2 rounded-md border border-blue-500 text-blue-600 hover:bg-blue-50"
          >
            Owner Dashboard
          </button>
          <button
            onClick={logout}
            className="px-3 py-2 rounded-md border border-red-500 text-red-600 hover:bg-red-50"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-800">Admin Dashboard</h2>
          <p className="text-gray-500 mt-1">Approve or reject premium requests</p>
        </div>

        {loading ? (
          <div className="bg-white rounded-xl shadow-sm p-6 text-gray-600">Loading pending requests...</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-xl font-semibold mb-4 text-gray-800">
                Pending Users ({pendingUsers.length})
              </h3>
              {pendingUsers.length === 0 ? (
                <p className="text-gray-500">No pending users</p>
              ) : (
                <div className="space-y-3">
                  {pendingUsers.map((user) => {
                    const id = user?.userId ?? user?.id;
                    const keyPrefix = `user-${id}`;
                    return (
                      <div key={keyPrefix} className="border rounded-lg p-3">
                        <p className="font-medium text-gray-800">{user?.fullName || "Unnamed User"}</p>
                        <p className="text-sm text-gray-500">{user?.email || "-"}</p>
                        <p className="text-sm text-gray-500">{user?.mobileNumber || "-"}</p>
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={() => handleDecision({ id, type: "user", approve: true })}
                            disabled={actionLoading === `${keyPrefix}-approve`}
                            className="px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleDecision({ id, type: "user", approve: false })}
                            disabled={actionLoading === `${keyPrefix}-reject`}
                            className="px-3 py-1.5 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-400"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-xl font-semibold mb-4 text-gray-800">
                Pending Property Owners ({pendingOwners.length})
              </h3>
              {pendingOwners.length === 0 ? (
                <p className="text-gray-500">No pending owners</p>
              ) : (
                <div className="space-y-3">
                  {pendingOwners.map((owner) => {
                    const id = owner?.ownerId ?? owner?.id;
                    const keyPrefix = `owner-${id}`;
                    return (
                      <div key={keyPrefix} className="border rounded-lg p-3">
                        <p className="font-medium text-gray-800">{owner?.fullName || "Unnamed Owner"}</p>
                        <p className="text-sm text-gray-500">{owner?.email || "-"}</p>
                        <p className="text-sm text-gray-500">{owner?.mobileNumber || "-"}</p>
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={() => handleDecision({ id, type: "owner", approve: true })}
                            disabled={actionLoading === `${keyPrefix}-approve`}
                            className="px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleDecision({ id, type: "owner", approve: false })}
                            disabled={actionLoading === `${keyPrefix}-reject`}
                            className="px-3 py-1.5 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-400"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <ToastContainer position="top-right" autoClose={2500} />
    </div>
  );
};

export default AdminDashboardMain;
