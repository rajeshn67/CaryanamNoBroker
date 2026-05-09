import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminModerationApi } from "../services/api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { LogOut } from "lucide-react";

const OWNER_APPROVAL_STATUS_KEY = "ownerApprovalStatuses";

const writeOwnerApprovalStatus = (owner, status) => {
  const ownerId = owner?.ownerId ?? owner?.id ?? owner;
  const ownerEmail = String(owner?.email || "").toLowerCase().trim();
  if (!ownerId && !ownerEmail) return;
  let approvalStatuses = {};
  try {
    approvalStatuses = JSON.parse(localStorage.getItem(OWNER_APPROVAL_STATUS_KEY) || "{}");
  } catch {
    approvalStatuses = {};
  }
  if (ownerId) approvalStatuses[String(ownerId)] = status;
  if (ownerEmail) approvalStatuses[`email:${ownerEmail}`] = status;
  localStorage.setItem(OWNER_APPROVAL_STATUS_KEY, JSON.stringify(approvalStatuses));
  // Trigger storage event for cross-tab sync
  window.dispatchEvent(new StorageEvent('storage', {
    key: OWNER_APPROVAL_STATUS_KEY,
    newValue: JSON.stringify(approvalStatuses),
    oldValue: localStorage.getItem(OWNER_APPROVAL_STATUS_KEY),
    url: window.location.href,
    storageArea: localStorage
  }));
};

const AdminDashboardMain = () => {
  const navigate = useNavigate();
  const [pendingUsers, setPendingUsers] = useState([]);
  const [pendingOwners, setPendingOwners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState("");
  const [ownerProperties, setOwnerProperties] = useState(null);
  const [ownerPropertiesLoading, setOwnerPropertiesLoading] = useState("");

  const logout = () => {
    localStorage.removeItem("adminToken");
    localStorage.setItem("adminLogout", Date.now().toString());
    const channel = new BroadcastChannel("admin-auth");
    channel.postMessage("logout");
    channel.close();
    navigate("/login");
  };

  const loadPendingData = async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    try {
      const [usersRes, ownersRes] = await Promise.all([
        adminModerationApi.getPendingUsers(),
        adminModerationApi.getPendingOwners(),
      ]);
      setPendingUsers(Array.isArray(usersRes?.data) ? usersRes.data : usersRes?.data?.data || []);
      setPendingOwners(Array.isArray(ownersRes?.data) ? ownersRes.data : ownersRes?.data?.data || []);
    } catch (error) {
      if (!silent) {
        toast.error(error?.response?.data?.message || "Failed to load admin data");
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    loadPendingData();
  }, []);

  const handleDecision = async ({ id, type, approve, owner }) => {
    const actionKey = `${type}-${id}-${approve ? "approve" : "reject"}`;
    setActionLoading(actionKey);
    try {
      if (type === "user") {
        if (approve) await adminModerationApi.approveUserPremium(id);
        else await adminModerationApi.rejectUserPremium(id);
      } else {
        // For owners, check if they already have APPROVED in their status
        const ownerData = pendingOwners.find(o => (o?.ownerId ?? o?.id) === id);
        const currentStatus = String(ownerData?.premiumStatus || "").toUpperCase();
        const isAlreadyApproved = currentStatus.includes("APPROVED");

        if (isAlreadyApproved) {
          // Owner is already approved, just update localStorage and show success
          // This handles the case where owner adds a second property after being approved
          writeOwnerApprovalStatus(owner || id, "APPROVED");
          toast.success("Owner is already premium - no additional approval needed");
        } else {
          // Normal approval/reject flow
          if (approve) {
            await adminModerationApi.approveOwnerPremium(id);
            writeOwnerApprovalStatus(owner || id, "APPROVED");
          } else {
            await adminModerationApi.rejectOwnerPremium(id);
            writeOwnerApprovalStatus(owner || id, "REJECTED");
          }
          toast.success(`Request ${approve ? "approved" : "rejected"} successfully`);
        }
      }
      await loadPendingData();
    } catch (error) {
      // If backend rejects because status is not exactly "PENDING", handle it gracefully
      if (error?.response?.data?.message?.includes("already approved")) {
        writeOwnerApprovalStatus(owner || id, "APPROVED");
        toast.success("Owner is already premium - no additional approval needed");
        await loadPendingData();
      } else {
        toast.error(error?.response?.data?.message || "Action failed");
      }
    } finally {
      setActionLoading("");
    }
  };

  const handleViewOwnerProperties = async (owner) => {
    const ownerId = owner?.ownerId ?? owner?.id;
    if (!ownerId) {
      toast.error("Owner id is missing");
      return;
    }

    setOwnerPropertiesLoading(String(ownerId));
    try {
      const response = await adminModerationApi.getOwnerProperties(ownerId);
      setOwnerProperties({
        ownerId,
        ownerName: response?.data?.ownerName || owner?.fullName || "Property Owner",
        totalProperties: response?.data?.totalProperties ?? 0,
        properties: Array.isArray(response?.data?.properties) ? response.data.properties : [],
      });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load owner properties");
    } finally {
      setOwnerPropertiesLoading("");
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      <div className="flex justify-between items-center px-6 py-4 bg-white shadow-sm">
        <h1 className="text-blue-600 font-bold text-xl">Admin Panel</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={logout}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-red-200 transition-all duration-300 active:scale-95"
          >
            <LogOut size={18} />
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
                            onClick={() => handleViewOwnerProperties(owner)}
                            disabled={ownerPropertiesLoading === String(id)}
                            className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
                          >
                            {ownerPropertiesLoading === String(id) ? "Loading..." : "Properties"}
                          </button>
                          <button
                            onClick={() => handleDecision({ id, type: "owner", approve: true, owner })}
                            disabled={actionLoading === `${keyPrefix}-approve`}
                            className="px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleDecision({ id, type: "owner", approve: false, owner })}
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
      {ownerProperties && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b">
              <div>
                <h3 className="text-xl font-semibold text-gray-800">
                  {ownerProperties.ownerName}
                </h3>
                <p className="text-sm text-gray-500">
                  {ownerProperties.totalProperties} properties listed
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOwnerProperties(null)}
                className="px-3 py-2 rounded-md border border-gray-300 hover:bg-gray-50"
              >
                Close
              </button>
            </div>

            {ownerProperties.properties.length === 0 ? (
              <div className="p-5 text-gray-500">No properties found for this owner.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 text-gray-600">
                    <tr>
                      <th className="text-left p-3 font-semibold">Title</th>
                      <th className="text-left p-3 font-semibold">City</th>
                      <th className="text-left p-3 font-semibold">Location</th>
                      <th className="text-left p-3 font-semibold">Price</th>
                      <th className="text-left p-3 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ownerProperties.properties.map((property) => (
                      <tr key={property.id} className="border-t">
                        <td className="p-3 font-medium text-gray-800">{property.title || "-"}</td>
                        <td className="p-3 text-gray-600">{property.city || "-"}</td>
                        <td className="p-3 text-gray-600">{property.location || "-"}</td>
                        <td className="p-3 text-gray-600">
                          {property.price ? `Rs. ${Number(property.price).toLocaleString()}` : "-"}
                        </td>
                        <td className="p-3 text-gray-600">{property.status || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
      <ToastContainer position="top-right" autoClose={2500} />
    </div>
  );
};

export default AdminDashboardMain;
