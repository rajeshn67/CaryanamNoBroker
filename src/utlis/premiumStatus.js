export const getCurrentPremiumStatus = (status) => {
  const parts = String(status || "")
    .split(",")
    .map((item) => item.trim().toUpperCase())
    .filter(Boolean);

  return parts[parts.length - 1] || "";
};

