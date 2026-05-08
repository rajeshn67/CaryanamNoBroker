// Frontend chat “model” helpers.
// Centralizing roomId and DTO normalization keeps ChatDrawer logic consistent
// with your backend contracts (ChatServiceImpl + SocketModule).

export const buildRoomId = (userId, ownerId) => {
  const u = Number(userId);
  const o = Number(ownerId);
  if (!Number.isFinite(u) || !Number.isFinite(o)) return null;
  return `USER_${u}_OWNER_${o}`;
};

export const getSocketQuery = ({ currentRole, currentUserId }) => {
  const id = Number(currentUserId);
  if (!Number.isFinite(id) || id <= 0) return {};

  // SocketModule reads handshake params by these exact keys:
  // - userId
  // - ownerId
  if (currentRole === "PROPERTY_OWNER") return { ownerId: String(id) };
  return { userId: String(id) };
};

const toSafeString = (v) => (v === null || v === undefined ? "" : String(v));

export const normalizeMessageResponseDTO = (dto) => {
  // Backend: MessageResponseDTO = { roomId, senderId, senderRole, message, time }
  const roomId = dto?.roomId;
  const senderId = dto?.senderId ?? null;
  const senderRole = toSafeString(dto?.senderRole || "USER");
  const text = toSafeString(dto?.message || dto?.content || dto?.text || "");
  const createdAt = toSafeString(dto?.time || "");

  return {
    id: `${roomId || "room"}-${senderId ?? "na"}-${createdAt || Date.now()}`,
    roomId: roomId ?? null,
    senderId,
    senderRole,
    text,
    createdAt,
  };
};

const extractDataList = (response) => {
  // REST ResponseDto wrapper:
  // { status: 200, message: "...", data: [...] }
  const direct = response?.data;
  if (Array.isArray(direct)) return direct;
  if (Array.isArray(direct?.data)) return direct.data;
  if (Array.isArray(response)) return response;
  return [];
};

export const normalizeHistory = (responseOrList) => {
  // Used for both:
  // - REST: /chat/history/{roomId} (ResponseDto wrapper)
  // - Socket: chat_history (array of MessageResponseDTO directly)
  const list = extractDataList(responseOrList);
  return list.map(normalizeMessageResponseDTO);
};

export const isOwnMessage = ({ senderRole, currentRole }) => {
  const sr = toSafeString(senderRole).toUpperCase();
  return currentRole === "PROPERTY_OWNER"
    ? sr === "PROPERTY_OWNER"
    : sr === "USER";
};

