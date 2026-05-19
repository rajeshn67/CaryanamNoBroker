import {
  API_ORIGIN,
  STATIC_BASE_URL,
} from "../services/api";

export const FALLBACK_PROPERTY_IMAGE = "/no-image.png";

const stripWrappingQuotes = (value) =>
  String(value || "")
    .trim()
    .replace(/^["']|["']$/g, "");

export const parseImageList = (value) => {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value.map(stripWrappingQuotes).filter(Boolean);
  }

  if (typeof value !== "string") return [];

  const trimmed = value.trim();
  if (!trimmed) return [];

  return trimmed
    .replace(/^\[|\]$/g, "")
    .split(",")
    .map(stripWrappingQuotes)
    .filter(Boolean);
};

const getBrowserOrigin = () => {
  if (typeof window === "undefined") return "";
  return window.location?.origin || "";
};

export const getImageCandidates = (imageName) => {
  const rawValue = stripWrappingQuotes(imageName);
  if (!rawValue) return [];

  if (/^(blob:|data:|https?:)/i.test(rawValue)) {
    return [rawValue];
  }

  const cleanedName = rawValue
    .replace(/^\/+/, "")
    .replace(/^uploads\//i, "");

  const browserOrigin = getBrowserOrigin();
  const candidates = [
    `/uploads/${cleanedName}`,
    browserOrigin
      ? `${browserOrigin}/uploads/${cleanedName}`
      : "",
    `${API_ORIGIN}/uploads/${cleanedName}`,
    `${STATIC_BASE_URL}/uploads/${cleanedName}`,
    `${STATIC_BASE_URL}/${cleanedName}`,
  ];

  return [...new Set(candidates.filter(Boolean))];
};

export const getPropertyImageNames = (property) => {
  const doctypeImages = parseImageList(property?.doctypeImages);

  return [
    ...doctypeImages,
    property?.coverImage,
    property?.imagePath,
    property?.imageName,
    ...(Array.isArray(property?.images) ? property.images : []),
    property?.image,
  ].filter(Boolean);
};

export const getPrimaryPropertyImageCandidates = (property) => {
  const primaryImage = getPropertyImageNames(property)?.[0];
  return getImageCandidates(primaryImage);
};

export const getPropertyImageCandidates = (property) => {
  const candidates = getPropertyImageNames(property).flatMap(
    getImageCandidates
  );

  return [...new Set(candidates)];
};
