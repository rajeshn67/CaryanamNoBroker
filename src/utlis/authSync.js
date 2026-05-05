// const channel = new BroadcastChannel("auth");

// // 🔥 LOGIN
// export const loginSync = (token) => {
//   localStorage.setItem("token", token);

//   channel.postMessage({ type: "LOGIN", token });
// };

// // 🔥 LOGOUT
// export const logoutSync = () => {
//   localStorage.removeItem("token");

//   channel.postMessage({ type: "LOGOUT" });
// };

// // 🔥 LISTEN FOR CHANGES (ALL TABS)
// export const subscribeAuthSync = (onLogin, onLogout) => {
//   // BroadcastChannel listener
//   channel.onmessage = (event) => {
//     const data = event.data;

//     if (data.type === "LOGIN") {
//       localStorage.setItem("token", data.token);
//       onLogin?.(data.token);
//     }

//     if (data.type === "LOGOUT") {
//       localStorage.removeItem("token");
//       onLogout?.();
//     }
//   };

//   // 🔥 IMPORTANT: sync when new tab opens
//   window.addEventListener("storage", (event) => {
//     if (event.key === "token" && event.newValue) {
//       onLogin?.(event.newValue);
//     }

//     if (event.key === "token" && !event.newValue) {
//       onLogout?.();
//     }
//   });
// };










// const channel = new BroadcastChannel("auth");

// // 🔥 LOGIN
// export const loginSync = (token) => {
//   localStorage.setItem("token", token);

//   channel.postMessage({ type: "LOGIN", token });
// };

// // 🔥 LOGOUT
// export const logoutSync = () => {
//   localStorage.removeItem("token");

//   channel.postMessage({ type: "LOGOUT" });
// };

// // 🔥 LISTEN FOR CHANGES (ALL TABS)
// export const subscribeAuthSync = (onLogin, onLogout) => {
//   // BroadcastChannel listener
//   channel.onmessage = (event) => {
//     const data = event.data;

//     if (data.type === "LOGIN") {
//       localStorage.setItem("token", data.token);
//       onLogin?.(data.token);
//     }

//     if (data.type === "LOGOUT") {
//       localStorage.removeItem("token");
//       onLogout?.();
//     }
//   };

//   // 🔥 IMPORTANT: sync when new tab opens
//   window.addEventListener("storage", (event) => {
//     if (event.key === "token" && event.newValue) {
//       onLogin?.(event.newValue);
//     }

//     if (event.key === "token" && !event.newValue) {
//       onLogout?.();
//     }
//   });

//   export const getUserIdFromToken = () => {
//   const token = localStorage.getItem("token");

//   if (!token) {
//     console.log("Token not found");
//     return null;
//   }

//   try {
//     const payload = JSON.parse(atob(token.split(".")[1]));
//     console.log("Decoded Payload:", payload);

//     return payload.userId;
//   } catch (error) {
//     console.log("Invalid token");
//     return null;
//   }
// };
// };





const channel = new BroadcastChannel("auth");

// 🔥 LOGIN
export const loginSync = (token) => {
  localStorage.setItem("userToken", token); // ✅ FIX

  channel.postMessage({ type: "LOGIN", token });
};

// 🔥 LOGOUT
export const logoutSync = () => {
  localStorage.removeItem("userToken"); // ✅ FIX

  channel.postMessage({ type: "LOGOUT" });
};

// 🔥 GET USER ID (👉 OUTSIDE)
export const getUserIdFromToken = () => {
  const token = localStorage.getItem("userToken"); // ✅ FIX

  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.id;
  } catch (err) {
    console.error("Invalid token");
    return null;
  }
};

// 🔥 LISTEN FOR CHANGES
export const subscribeAuthSync = (onLogin, onLogout) => {
  channel.onmessage = (event) => {
    const data = event.data;

    if (data.type === "LOGIN") {
      localStorage.setItem("userToken", data.token);
      onLogin?.(data.token);
    }

    if (data.type === "LOGOUT") {
      localStorage.removeItem("userToken");
      onLogout?.();
    }
  };

  window.addEventListener("storage", (event) => {
    if (event.key === "userToken" && event.newValue) {
      onLogin?.(event.newValue);
    }

    if (event.key === "userToken" && !event.newValue) {
      onLogout?.();
    }
  });
};