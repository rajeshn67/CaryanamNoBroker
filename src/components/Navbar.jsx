// import { useNavigate } from "react-router-dom";
// import { LogOut, MessageCircle } from "lucide-react";

// const Navbar = ({ onOpenChat, chatCount = 0, userName = "" }) => {
//   const navigate = useNavigate();

//   const handleLogout = () => {
//     const adminToken = localStorage.getItem("adminToken");
//     const ownerToken = localStorage.getItem("ownerToken");
//     const userToken = localStorage.getItem("userToken");

//     if (adminToken) {
//       try {
//         const adminChannel = new BroadcastChannel("admin-auth");
//         adminChannel.postMessage("logout");
//         adminChannel.close();
//       } catch {
//         // ignore
//       }
//       localStorage.removeItem("adminToken");
//       localStorage.setItem("adminLogout", Date.now());
//     }

//     if (ownerToken) {
//       try {
//         const ownerChannel = new BroadcastChannel("owner-auth");
//         ownerChannel.postMessage("logout");
//         ownerChannel.close();
//       } catch {
//         // ignore
//       }
//       localStorage.removeItem("ownerToken");
//       localStorage.removeItem("ownerId");
//       localStorage.setItem("ownerLogout", Date.now());
//     }

//     if (userToken) {
//       const userEmail = localStorage.getItem("userEmail");
//       try {
//         const channelName = userEmail ? `user-auth-${userEmail}` : "user-auth";
//         const userChannel = new BroadcastChannel(channelName);
//         userChannel.postMessage("logout");
//         userChannel.close();
//       } catch {
//         // ignore
//       }
//       localStorage.removeItem("userToken");
//       localStorage.setItem("userLogout", Date.now());
//     }

//     window.location.href = "/login";
//   };

//   const isAdmin = Boolean(localStorage.getItem("adminToken"));

//   return (
//     <div className="flex justify-between items-center px-6 py-4 bg-white shadow-sm">
//       <h1 className="text-blue-600 font-bold text-lg">
//         Caryanam Brokar
//       </h1>

//       <div className="flex items-center gap-4 text-sm">
//         {/* {isAdmin && (
//           <button
//             onClick={() => navigate("/admin/interested-users")}
//             className="text-gray-600 hover:text-blue-600 transition-colors"
//             title="Interested Users"
//           >
//             <svg
//               xmlns="http://www.w3.org/2000/svg"
//               width="24"
//               height="24"
//               viewBox="0 0 24 24"
//               fill="none"
//               stroke="currentColor"
//               strokeWidth="2"
//               strokeLinecap="round"
//               strokeLinejoin="round"
//             >
//               <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
//               <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
//             </svg>
//           </button>
//         )} */}

//         {userName && (
//           <span className="text-gray-700 font-semibold">
//             {userName}
//           </span>
//         )}

//         {typeof onOpenChat === "function" && (
//           <button
//             onClick={() => onOpenChat()}
//             className="relative text-gray-600 hover:text-blue-600 transition-colors"
//             title="Messages"
//           >
//             <MessageCircle size={22} />
//             {chatCount > 0 && (
//               <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] px-1 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center">
//                 {chatCount}
//               </span>
//             )}
//           </button>
//         )}
        
//         <button
//   onClick={handleLogout}
//   className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-red-200 transition-all duration-300 active:scale-95"
// >
//   <LogOut size={18} />
//   Logout
// </button>
//       </div>
//     </div>
//   );
// };

// export default Navbar;




import { useNavigate } from "react-router-dom";
import { LogOut, MessageCircle } from "lucide-react";

const Navbar = ({ onOpenChat, chatCount = 0, userName = "" }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    const adminToken = localStorage.getItem("adminToken");
    const ownerToken = localStorage.getItem("ownerToken");
    const userToken = localStorage.getItem("userToken");

    if (adminToken) {
      try {
        const adminChannel = new BroadcastChannel("admin-auth");
        adminChannel.postMessage("logout");
        adminChannel.close();
      } catch {
        // ignore
      }
      localStorage.removeItem("adminToken");
      localStorage.setItem("adminLogout", Date.now());
    }

    if (ownerToken) {
      try {
        const ownerChannel = new BroadcastChannel("owner-auth");
        ownerChannel.postMessage("logout");
        ownerChannel.close();
      } catch {
        // ignore
      }
      localStorage.removeItem("ownerToken");
      localStorage.removeItem("ownerId");
      localStorage.setItem("ownerLogout", Date.now());
    }

    if (userToken) {
      const userEmail = localStorage.getItem("userEmail");

      try {
        const channelName = userEmail
          ? `user-auth-${userEmail}`
          : "user-auth";

        const userChannel =
          new BroadcastChannel(channelName);

        userChannel.postMessage("logout");
        userChannel.close();
      } catch {
        // ignore
      }

      localStorage.removeItem("userToken");
      localStorage.setItem("userLogout", Date.now());
    }

    window.location.href = "/login";
  };

  const isAdmin = Boolean(
    localStorage.getItem("adminToken")
  );

  return (
    <div className="flex justify-between items-center px-6 py-4 bg-gradient-to-r from-[#020617] via-[#041833] to-[#020617] border-b border-[#1E293B] shadow-xl">
      <h1 className="text-[#F97316] font-black text-2xl tracking-wide">
        Caryanam Brokar
      </h1>

      <div className="flex items-center gap-4 text-sm">
        {/* {isAdmin && (
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
        )} */}

        {userName && (
          <span className="text-white font-semibold tracking-wide">
            {userName}
          </span>
        )}

        {typeof onOpenChat ===
          "function" && (
          <button
            onClick={() =>
              onOpenChat()
            }
            className="relative text-[#E2E8F0] hover:text-[#F97316] transition-all duration-300"
            title="Messages"
          >
            <MessageCircle size={22} />

            {chatCount > 0 && (
              <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] px-1 rounded-full bg-gradient-to-r from-[#F97316] to-[#EA580C] text-white text-[10px] flex items-center justify-center font-bold shadow-lg">
                {chatCount}
              </span>
            )}
          </button>
        )}

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#F97316] to-[#EA580C] hover:opacity-95 text-white font-semibold rounded-xl shadow-[0_10px_25px_rgba(249,115,22,0.35)] transition-all duration-300 active:scale-95"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Navbar;