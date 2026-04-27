const channel = new BroadcastChannel("auth");

// 🔥 LOGIN
export const loginSync = (token) => {
  localStorage.setItem("token", token);

  channel.postMessage({ type: "LOGIN", token });
};

// 🔥 LOGOUT
export const logoutSync = () => {
  localStorage.removeItem("token");

  channel.postMessage({ type: "LOGOUT" });
};

// 🔥 LISTEN FOR CHANGES (ALL TABS)
export const subscribeAuthSync = (onLogin, onLogout) => {
  // BroadcastChannel listener
  channel.onmessage = (event) => {
    const data = event.data;

    if (data.type === "LOGIN") {
      localStorage.setItem("token", data.token);
      onLogin?.(data.token);
    }

    if (data.type === "LOGOUT") {
      localStorage.removeItem("token");
      onLogout?.();
    }
  };

  // 🔥 IMPORTANT: sync when new tab opens
  window.addEventListener("storage", (event) => {
    if (event.key === "token" && event.newValue) {
      onLogin?.(event.newValue);
    }

    if (event.key === "token" && !event.newValue) {
      onLogout?.();
    }
  });
};