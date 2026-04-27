import { useNavigate } from "react-router-dom";


const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
  const adminToken = localStorage.getItem("adminToken");
  const userToken = localStorage.getItem("userToken");

  // ✅ ADMIN LOGOUT
  if (adminToken && !userToken) {
    const adminChannel = new BroadcastChannel("admin-auth");

    localStorage.removeItem("adminToken");
    localStorage.setItem("adminLogout", Date.now());

    adminChannel.postMessage("logout");
    adminChannel.close();
  }

  // ✅ USER LOGOUT
  else if (userToken && !adminToken) {   // ⭐ CHANGE (else if)
    // const userChannel = new BroadcastChannel("user-auth");
const userEmail = localStorage.getItem("userEmail"); // ⭐ ADD

    localStorage.removeItem("userToken");
    localStorage.setItem("userLogout", Date.now());

    userChannel.postMessage("logout");
    userChannel.close();
  }

  // ⚠️ SAFETY (both tokens exist)
  else if (adminToken && userToken) {
    console.warn("Both tokens exist — fixing...");

    // 👉 choose one (better: user logout)
    // const userChannel = new BroadcastChannel("user-auth");
const userChannel = new BroadcastChannel(`user-auth-${userEmail}`); // ⭐ CHANGE
    localStorage.removeItem("userToken");
    localStorage.setItem("userLogout", Date.now());

    userChannel.postMessage("logout");
    userChannel.close();
  }

  window.location.href = "/login";
};
   

  return (
    <div className="flex justify-between items-center px-6 py-4 bg-white shadow-sm">
      <h1 className="text-blue-600 font-bold text-lg">
        Caryanam No Brokar
      </h1>

      <div className="flex items-center gap-4 text-sm">
        <button
          onClick={() => navigate("/admin/interested-users")}
          className="text-gray-600 hover:text-blue-600 transition-colors"
          title="Interested Users"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
            <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
          </svg>
        </button>
        <span className="text-gray-600">
          Niranjan Baviskar <span className="text-blue-500">(User)</span>
        </span>
        <button
          onClick={handleLogout}
          className="text-gray-700 hover:text-red-500">
          Logout
        </button>
      </div>
    </div>
  );
};

export default Navbar;