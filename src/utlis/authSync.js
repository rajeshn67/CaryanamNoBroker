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