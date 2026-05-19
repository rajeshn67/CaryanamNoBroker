import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";
import { chatApi } from "../services/api";
import {
  normalizeMessageResponseDTO,
  normalizeHistory,
  getSocketQuery,
} from "./chatModel";

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL?.replace(/\/+$/, "") ||
  "http://r2.rentalchaavi.com:9092";

const parseRoomId = (roomId) => {
  if (!roomId || typeof roomId !== "string") return null;
  const match = /^USER_(\d+)_OWNER_(\d+)$/.exec(roomId.trim());
  if (!match) return null;
  return { userId: Number(match[1]), ownerId: Number(match[2]) };
};

const mergeUniqueById = (prev, nextItem) => {
  const next = normalizeMessageResponseDTO(nextItem);
  if (!next?.id) return prev;
  if (prev.some((m) => String(m.id) === String(next.id))) return prev;
  return [...prev, next];
};

export const useChatSocket = ({
  currentRole,
  currentUserId,
  roomId,
  isOpen,
  onAccepted,
  onRejected,
  socketUrl = SOCKET_URL,
}) => {
  const socketRef = useRef(null);

  const [socketConnected, setSocketConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [typingByUserId, setTypingByUserId] = useState({});
  const [presenceByUserId, setPresenceByUserId] = useState({});

  const activeUserId = Number(currentUserId);
  const parsedIds = useMemo(() => parseRoomId(roomId), [roomId]);

  const shouldConnect =
    Boolean(isOpen) &&
    Boolean(roomId) &&
    Number.isFinite(activeUserId) &&
    activeUserId > 0 &&
    Boolean(parsedIds);

  const setOnline = useCallback(
    async (online) => {
      if (!Number.isFinite(activeUserId) || activeUserId <= 0) return;
      try {
        await chatApi.updateStatus({ userId: activeUserId, online: !!online });
      } catch {
        // Presence is best-effort; don't break chat.
      }
    },
    [activeUserId]
  );

  useEffect(() => {
    if (!shouldConnect) {
      // Cleanup if previously connected.
      if (socketRef.current) {
        try {
          socketRef.current.disconnect();
        } catch {
          // ignore
        }
        socketRef.current = null;
      }
      return;
    }

    // Clear stale room state.
    // Do it async to avoid react-hooks/set-state-in-effect warnings.
    setTimeout(() => {
      setMessages([]);
      setTypingByUserId({});
      setPresenceByUserId({});
    }, 0);

    const socket = io(socketUrl, {
      transports: ["websocket"],
      reconnection: true,
      query: getSocketQuery({ currentRole, currentUserId: activeUserId }),
    });

    socketRef.current = socket;

    socket.on("connect", async () => {
      setSocketConnected(true);
      socket.emit("join_room", String(roomId));
      await setOnline(true);

      // Load existing messages from REST to match backend contract.
      // (Backend provides GET /chat/history/{roomId}).
      try {
        const historyRes = await chatApi.getHistory(String(roomId));
        const historyList = normalizeHistory(historyRes);
        setMessages(historyList);
      } catch {
        // History is best-effort; new messages will still stream via socket.
      }
    });

    socket.on("disconnect", () => {
      setSocketConnected(false);
      setOnline(false);
    });

    socket.on("chat_history", (payload) => {
      // SocketModule emits List<MessageResponseDTO> directly.
      const list = Array.isArray(payload) ? payload : [];
      const normalized = list.map(normalizeMessageResponseDTO);
      setMessages(normalized);
    });

    socket.on("receive_message", (payload) => {
      if (!payload) return;
      // Ensure room match (backend should already do this via room operations).
      if (payload?.roomId && String(payload.roomId) !== String(roomId)) return;
      setMessages((prev) => mergeUniqueById(prev, payload));
    });

    socket.on("chat_accepted", (payload) => {
      // AcceptChat sends both: chat_accepted + receive_message for the auto-reply.
      // So we only update status (avoid duplicate message insertion).
      if (!payload) return;
      if (payload?.roomId && String(payload.roomId) !== String(roomId)) return;
      onAccepted?.(payload);
    });

    socket.on("chat_rejected", (payload) => {
      if (!payload) return;
      if (payload?.roomId && String(payload.roomId) !== String(roomId)) return;
      onRejected?.(payload);
      setMessages((prev) => mergeUniqueById(prev, payload));
    });

    socket.on("typing", (dto) => {
      if (!dto) return;
      if (dto?.roomId && String(dto.roomId) !== String(roomId)) return;
      const uid = Number(dto?.userId);
      if (!Number.isFinite(uid)) return;
      setTypingByUserId((prev) => ({ ...prev, [uid]: !!dto.typing }));
    });

    socket.on("user_status", (status) => {
      if (!status) return;
      const uid = Number(status?.userId);
      if (!Number.isFinite(uid)) return;
      setPresenceByUserId((prev) => ({
        ...prev,
        [uid]: !!status?.online,
      }));
    });

    return () => {
      try {
        socket.disconnect();
      } catch {
        // ignore
      }
      socketRef.current = null;
      setSocketConnected(false);
      setTypingByUserId({});
      setPresenceByUserId({});
      setOnline(false);
    };
  }, [
    shouldConnect,
    roomId,
    currentRole,
    currentUserId,
    activeUserId,
    setOnline,
    onAccepted,
    onRejected,
    socketUrl,
  ]);

  const sendMessage = useCallback(
    async (text) => {
      if (!text || !parsedIds) return;
      const msg = String(text).trim();
      if (!msg) return;

      const senderRole = currentRole === "PROPERTY_OWNER" ? "PROPERTY_OWNER" : "USER";

      const outgoingPayload = {
        userId: parsedIds.userId,
        ownerId: parsedIds.ownerId,
        senderRole,
        message: msg,
      };

      const sock = socketRef.current;
      if (sock?.connected) {
        sock.emit("send_message", outgoingPayload);
        return;
      }

      // Fallback to REST (also works for the first message).
      await chatApi.sendMessage(outgoingPayload);
    },
    [currentRole, parsedIds]
  );

  const sendTyping = useCallback(
    (typing) => {
      if (!parsedIds || !roomId) return;
      const sock = socketRef.current;
      if (!sock?.connected) return;

      const dto = {
        roomId: String(roomId),
        userId: activeUserId,
        typing: !!typing,
      };
      sock.emit("typing", dto);
    },
    [parsedIds, roomId, activeUserId]
  );

  return {
    socketConnected,
    messages,
    typingByUserId,
    presenceByUserId,
    sendMessage,
    sendTyping,
  };
};

