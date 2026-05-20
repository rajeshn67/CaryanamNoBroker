export const FALLBACK_PROPERTY_IMAGE = "/no-image.png";
export const FALLBACK_PROPERTY_IMAGE_DATA_URL =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'><rect width='100%25' height='100%25' fill='%23E5E7EB'/><text x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%236B7280' font-family='Arial, sans-serif' font-size='22'>No database image</text></svg>";

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

export const getImageCandidates = (imageName) => {
  const rawValue = stripWrappingQuotes(imageName);
  if (!rawValue) return [];

  if (/^(blob:|data:|https?:)/i.test(rawValue)) {
    return [rawValue];
  }

  const compactValue = rawValue.replace(/\s/g, "");
  const looksLikeBase64Image =
    compactValue.length > 100 &&
    /^[A-Za-z0-9+/]+={0,2}$/.test(compactValue);

  if (looksLikeBase64Image) {
    return [`data:image/jpeg;base64,${compactValue}`];
  }

  return [];
};

export const getPropertyImageNames = (property) => {
  const doctypeImages = parseImageList(property?.doctypeImages);

  return [
    property?.coverImageData,
    property?.coverImageBase64,
    property?.imageData,
    property?.imageBase64,
    property?.base64Image,
    property?.imageContent,
    property?.coverImage,
    property?.imagePath,
    property?.imageName,
    ...(Array.isArray(property?.doctypeImageBase64List)
      ? property.doctypeImageBase64List
      : []),
    ...doctypeImages,
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
