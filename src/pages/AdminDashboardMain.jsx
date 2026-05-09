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
      } else if (type === "property") {
        // Use property title from the existing data
        const propertyTitle = owner?.title || "property";

        if (approve) {
          await adminModerationApi.approveProperty(id);
          toast.success(`Property "${propertyTitle}" approved successfully`);
        } else {
          await adminModerationApi.rejectProperty(id);
          toast.success(`Property "${propertyTitle}" rejected successfully`);
        }
      } else {
        // Fallback to owner-level approval (old behavior)
        const ownerData = pendingOwners.find(o => (o?.ownerId ?? o?.id) === id);
        const currentStatus = String(ownerData?.premiumStatus || "").toUpperCase();
        const isAlreadyApproved = currentStatus.includes("APPROVED");

        if (isAlreadyApproved) {
          writeOwnerApprovalStatus(owner || id, "APPROVED");
          toast.success("Owner is already premium - no additional approval needed");
        } else {
          if (approve) {
            await adminModerationApi.approveOwnerPremium(id);
            writeOwnerApprovalStatus(owner || id, "APPROVED");
          } else {
            await adminModerationApi.rejectOwnerPremium(id);
            writeOwnerApprovalStatus(owner || id, "REJECTED");
          }
          const propertyTitle = owner?.title || "property";
          toast.success(`Property "${propertyTitle}" ${approve ? "approved" : "rejected"} successfully`);
        }
      }
      await loadPendingData();
    } catch (error) {
      if (error?.response?.data?.message?.includes("already approved")) {
        writeOwnerApprovalStatus(owner || id, "APPROVED");
        toast.success("Already approved - no additional action needed");
        await loadPendingData();
      } else {
        toast.error(error?.response?.data?.message || "Action failed");
      }
    } finally {
      setActionLoading("");
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
                Pending Property Approvals ({pendingOwners.length})
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Properties awaiting payment verification and admin approval
              </p>
              {pendingOwners.length === 0 ? (
                <p className="text-gray-500">No pending property approvals</p>
              ) : (
                <div className="space-y-3">
                  {pendingOwners.map((item) => {
                    const ownerId = item?.ownerId ?? item?.id;
                    const propertyId = item?.propertyId;
                    const keyPrefix = `property-${propertyId}`;
                    return (
                      <div key={keyPrefix} className="border rounded-lg p-4 bg-gray-50">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="font-semibold text-gray-800">{item?.title || "Untitled Property"}</p>
                            <p className="text-xs text-gray-500 mt-1">Property ID: {propertyId || "-"}</p>
                          </div>
                          <span className={`px-2 py-1 text-xs font-medium rounded ${
                            item?.paymentStatus?.toUpperCase() === 'APPROVED' ? 'bg-green-100 text-green-800' :
                            item?.paymentStatus?.toUpperCase() === 'REJECTED' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {item?.paymentStatus?.toUpperCase() || "PENDING"}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                          <div>
                            <span className="font-medium">Owner:</span> {item?.fullName || "-"}
                          </div>
                          <div>
                            <span className="font-medium">Email:</span> {item?.email || "-"}
                          </div>
                          <div>
                            <span className="font-medium">City:</span> {item?.city || "-"}
                          </div>
                          <div>
                            <span className="font-medium">Location:</span> {item?.location || "-"}
                          </div>
                          <div>
                            <span className="font-medium">Type:</span> {item?.propertyType || "-"}
                          </div>
                          <div>
                            <span className="font-medium">Price:</span> {item?.price ? `Rs. ${Number(item.price).toLocaleString()}` : "-"}
                          </div>
                        </div>

                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={() => handleDecision({ id: propertyId, type: "property", approve: true, owner: item })}
                            disabled={actionLoading === `${keyPrefix}-approve`}
                            className="flex-1 px-3 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 font-medium"
                          >
                            {actionLoading === `${keyPrefix}-approve` ? "Approving..." : "Approve"}
                          </button>
                          <button
                            onClick={() => handleDecision({ id: propertyId, type: "property", approve: false, owner: item })}
                            disabled={actionLoading === `${keyPrefix}-reject`}
                            className="flex-1 px-3 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-400 font-medium"
                          >
                            {actionLoading === `${keyPrefix}-reject` ? "Rejecting..." : "Reject"}
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

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default AdminDashboardMain;
