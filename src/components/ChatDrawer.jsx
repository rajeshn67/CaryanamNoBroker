import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MessageCircle, Send, X } from "lucide-react";
import { chatApi, propertyApi } from "../services/api";
import { useChatSocket } from "../chat/useChatSocket";
import { buildRoomId } from "../chat/chatModel";

const USER_CHAT_MEMBERS_KEY = "userChatMembers";
const DEFAULT_FIRST_MESSAGE = "I am intersting your propery";

const safeParse = (value, fallback) => {
  try {
    const parsed = JSON.parse(value);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
};

const decodeJwtPayload = (token) => {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length < 2) return null;

  try {
    // JWT uses base64url, but `atob` expects base64.
    const base64url = parts[1];
    const base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
    const padding = "=".repeat((4 - (base64.length % 4)) % 4);
    const json = atob(base64 + padding);
    return JSON.parse(json);
  } catch {
    return null;
  }
};

const getFullNameFromPayload = (payload) => {
  if (!payload) return null;
  return (
    payload.fullName ||
    payload.full_name ||
    payload.name ||
    payload.user?.fullName ||
    payload.user?.name ||
    payload.owner?.fullName ||
    payload.owner?.name ||
    null
  );
};

const getMyFullNameFromToken = (currentRole) => {
  // In this app: user auth token is `userToken`, owner auth token is `ownerToken`.
  const tokenKey =
    currentRole === "PROPERTY_OWNER" ? "ownerToken" : "userToken";
  const token = localStorage.getItem(tokenKey);
  return getFullNameFromPayload(decodeJwtPayload(token)) || "You";
};

const getInitials = (name) => {
  const s = (name || "").trim();
  if (!s) return "U";
  const parts = s.split(/\s+/).filter(Boolean);
  const a = parts[0]?.[0] || "";
  const b = parts.length > 1 ? parts[parts.length - 1]?.[0] || "" : "";
  return (a + b).toUpperCase();
};

const formatTime = (value) => {
  if (!value) return "";
  const num = Number(value);
  const d = Number.isFinite(num) ? new Date(num) : new Date(String(value));
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const formatChatStatus = (status) => {
  const s = String(status || "");
  if (s === "PENDING") return "Pending";
  if (s === "ACCEPTED") return "Accepted";
  if (s === "REJECTED") return "Rejected";
  return s;
};

const readUserChats = () =>
  safeParse(localStorage.getItem(USER_CHAT_MEMBERS_KEY) || "[]", []);

const writeUserChats = (chats) =>
  localStorage.setItem(USER_CHAT_MEMBERS_KEY, JSON.stringify(chats));

const getOwnerIdFromProperty = (property) => {
  const candidates = [
    property?.ownerId,
    property?.ownerID,
    property?.owner_id,
    property?._raw?.ownerId,
    property?._raw?.ownerID,
    property?._raw?.owner_id,
    property?._raw?.userId,
    property?._raw?.propertyOwnerId,
    property?._raw?.propertyOwnerID,
    property?._raw?.property_owner_id,
    property?._raw?.owner?.id,
    property?._raw?.owner?.ownerId,
    property?._raw?.user?.id,
    property?._raw?.propertyOwner?.id,
  ];
  for (const candidate of candidates) {
    const numeric = Number(candidate);
    if (Number.isFinite(numeric) && numeric > 0) return numeric;
  }
  return null;
};

const getOwnerNameFromProperty = (property, fallbackOwnerId) => {
  return (
    property?.ownerName ||
    property?._raw?.ownerName ||
    property?._raw?.owner?.name ||
    property?._raw?.owner?.fullName ||
    "Owner"
  );
};

const getUserFullNameFromChatItem = (item) => {
  return (
    item?.fullName ||
    item?.userFullName ||
    item?.user?.fullName ||
    item?.user?.name ||
    item?.userName ||
    item?.name ||
    "User"
  );
};

const normalizeList = (response) => {
  const payload = response?.data;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

const ChatDrawer = ({
  isOpen,
  onClose,
  currentRole,
  currentUserId,
  selectedProperty,
  onCountChange,
}) => {
  const [loading, setLoading] = useState(false);
  const [startingChat, setStartingChat] = useState(false);
  const [members, setMembers] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const typingTimeoutRef = useRef(null);
  const typingSentRef = useRef(false);
  const bottomRef = useRef(null);

  const isOwner = currentRole === "PROPERTY_OWNER";
  const myFullName = useMemo(
    () => getMyFullNameFromToken(currentRole),
    [currentRole]
  );

  const refreshMembers = useCallback(async () => {
    if (!currentUserId || !isOpen) return;
    setLoading(true);
    setError("");
    try {
      if (isOwner) {
        const [pendingRes, acceptedRes, rejectedRes] = await Promise.all([
          chatApi.getPendingChats(currentUserId),
          chatApi.getAcceptedChats(currentUserId),
          chatApi.getRejectedChats(currentUserId),
        ]);
        const pending = normalizeList(pendingRes).map((item) => ({
          roomId: item?.roomId || buildRoomId(item?.userId, currentUserId),
          userId: item?.userId,
          ownerId: currentUserId,
          name: getUserFullNameFromChatItem(item),
          propertyTitle: item?.propertyTitle || "Property",
          status: "PENDING",
        }));
        const accepted = normalizeList(acceptedRes).map((item) => ({
          roomId: item?.roomId || buildRoomId(item?.userId, currentUserId),
          userId: item?.userId,
          ownerId: currentUserId,
          name: getUserFullNameFromChatItem(item),
          propertyTitle: item?.propertyTitle || "Property",
          status: "ACCEPTED",
        }));
        const rejected = normalizeList(rejectedRes).map((item) => ({
          roomId: item?.roomId || buildRoomId(item?.userId, currentUserId),
          userId: item?.userId,
          ownerId: currentUserId,
          name: getUserFullNameFromChatItem(item),
          propertyTitle: item?.propertyTitle || "Property",
          status: "REJECTED",
        }));

        const combined = [...pending, ...accepted, ...rejected];
        setMembers(combined);
        onCountChange?.(combined.length);
      } else {
        const userChats = readUserChats()
          .map((item) => {
            const normalizedUserId = Number(item?.userId);
            const normalizedOwnerId = Number(item?.ownerId);
            const normalizedRoomId =
              item?.roomId ||
              buildRoomId(normalizedUserId, normalizedOwnerId);

            return {
              ...item,
              userId: normalizedUserId,
              ownerId: normalizedOwnerId,
              roomId: normalizedRoomId,
              status: item?.status || "PENDING",
            };
          })
          .filter(
          (item) => Number(item?.userId) === Number(currentUserId)
          );
        setMembers(userChats);
        onCountChange?.(userChats.length);
      }
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load chats");
    } finally {
      setLoading(false);
    }
  }, [currentUserId, isOpen, isOwner, onCountChange]);

  useEffect(() => {
    refreshMembers();
  }, [refreshMembers]);

  useEffect(() => {
    const autoCreateRequest = async () => {
      if (!isOpen || !selectedProperty || isOwner || !currentUserId) return;
      setError("");
      setStartingChat(true);
      try {
        let resolvedProperty = selectedProperty;
        let ownerId = getOwnerIdFromProperty(selectedProperty);

        // When user clicks "Chat" from a property card (browse list), the mapped
        // property object might not include ownerId. Fetch full property details
        // to derive ownerId and open the conversation.
        if (!ownerId) {
          const propertyId =
            selectedProperty?.id ||
            selectedProperty?.propertyId ||
            selectedProperty?._raw?.id ||
            selectedProperty?._raw?.propertyId;

          if (propertyId) {
            try {
              const res = await propertyApi.getById(propertyId);
              const dto = res?.data?.data ?? res?.data ?? null;
              if (dto) {
                resolvedProperty = dto;
                ownerId = getOwnerIdFromProperty(dto);
              }
            } catch {
              // Ignore here; we handle final error below.
            }
          }
        }

        if (!ownerId) {
          setError("Owner id not found for this property");
          return;
        }

        const existing = readUserChats().find(
          (item) =>
            Number(item.userId) === Number(currentUserId) &&
            Number(item.ownerId) === Number(ownerId)
        );
        if (existing) {
          setActiveRoom({
            ...existing,
            roomId:
              existing.roomId ||
              buildRoomId(Number(currentUserId), Number(ownerId)),
          });
          return;
        }

        try {
          const res = await chatApi.sendMessage({
            userId: Number(currentUserId),
            ownerId: Number(ownerId),
            senderRole: "USER",
            message: DEFAULT_FIRST_MESSAGE,
          });
          const payload = res?.data?.data || {};
          const created = {
            roomId:
              payload?.roomId ||
              buildRoomId(Number(currentUserId), Number(ownerId)),
            userId: Number(currentUserId),
            ownerId: Number(ownerId),
            name:
              getOwnerNameFromProperty(resolvedProperty, ownerId) || "Owner",
            propertyTitle:
              resolvedProperty?.title ||
              resolvedProperty?._raw?.title ||
              selectedProperty?.title ||
              "Property",
            status: "PENDING",
          };
          const next = [...readUserChats(), created];
          writeUserChats(next);
          setMembers(next);
          onCountChange?.(next.length);
          setActiveRoom(created);
        } catch (e) {
          setError(
            e?.response?.data?.message ||
              "Unable to start chat request"
          );
        }
      } finally {
        setStartingChat(false);
      }
    };
    autoCreateRequest();
  }, [
    currentUserId,
    isOpen,
    isOwner,
    onCountChange,
    refreshMembers,
    selectedProperty,
  ]);

  const updateUserChatStatusInStorage = useCallback(
    (targetRoomId, nextStatus) => {
      try {
        const current = readUserChats();
        const next = current.map((item) => {
          const normalizedUserId = Number(item?.userId);
          const normalizedOwnerId = Number(item?.ownerId);
          const normalizedRoomId =
            item?.roomId || buildRoomId(normalizedUserId, normalizedOwnerId);
          if (!normalizedRoomId) return item;

          if (String(normalizedRoomId) !== String(targetRoomId)) return item;
          return {
            ...item,
            roomId: normalizedRoomId,
            status: nextStatus,
          };
        });
        writeUserChats(next);
      } catch {
        // best-effort (local storage only)
      }
    },
    []
  );

  const handleAcceptedEvent = useCallback(
    (payload) => {
      const rid = payload?.roomId;
      if (!rid) return;

      setActiveRoom((prev) =>
        prev && String(prev.roomId) === String(rid)
          ? { ...prev, status: "ACCEPTED" }
          : prev
      );

      if (isOwner) refreshMembers();
      else {
        updateUserChatStatusInStorage(rid, "ACCEPTED");
        refreshMembers();
      }
    },
    [isOwner, refreshMembers, updateUserChatStatusInStorage]
  );

  const handleRejectedEvent = useCallback(
    (payload) => {
      const rid = payload?.roomId;
      if (!rid) return;

      setActiveRoom((prev) =>
        prev && String(prev.roomId) === String(rid)
          ? { ...prev, status: "REJECTED" }
          : prev
      );

      if (isOwner) refreshMembers();
      else {
        updateUserChatStatusInStorage(rid, "REJECTED");
        refreshMembers();
      }
    },
    [isOwner, refreshMembers, updateUserChatStatusInStorage]
  );

  const {
    socketConnected,
    messages,
    typingByUserId,
    presenceByUserId,
    sendMessage,
    sendTyping,
  } = useChatSocket({
    currentRole,
    currentUserId,
    roomId: activeRoom?.roomId,
    isOpen,
    onAccepted: handleAcceptedEvent,
    onRejected: handleRejectedEvent,
  });

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
      if (typingSentRef.current) {
        sendTyping(false);
        typingSentRef.current = false;
      }
    };
  }, [sendTyping]);

  useEffect(() => {
    // Switching rooms should reset draft + typing indicators.
    setDraft("");
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    if (typingSentRef.current) {
      sendTyping(false);
      typingSentRef.current = false;
    }
  }, [activeRoom?.roomId, sendTyping]);

  useEffect(() => {
    // Keep the most recent message in view.
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages.length, activeRoom?.roomId]);

  const pendingCount = useMemo(
    () => members.filter((m) => m.status === "PENDING").length,
    [members]
  );

  const handleDraftChange = useCallback(
    (e) => {
      const next = e.target.value;
      setDraft(next);

      // Typing indicator only makes sense while the chat is active.
      if (activeRoom?.status !== "ACCEPTED") return;

      if (!next.trim()) {
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = null;
        }
        if (typingSentRef.current) {
          sendTyping(false);
          typingSentRef.current = false;
        }
        return;
      }

      if (!typingSentRef.current) {
        sendTyping(true);
        typingSentRef.current = true;
      }

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        sendTyping(false);
        typingSentRef.current = false;
        typingTimeoutRef.current = null;
      }, 1200);
    },
    [activeRoom?.status, sendTyping]
  );

  const handleOwnerDecision = async (accept) => {
    if (!activeRoom?.roomId) return;
    try {
      const payload = {
        roomId: activeRoom.roomId,
        senderRole: "PROPERTY_OWNER",
      };
      if (accept) await chatApi.acceptChat(payload);
      else await chatApi.rejectChat(payload);
      await refreshMembers();
      setActiveRoom((prev) =>
        prev
          ? { ...prev, status: accept ? "ACCEPTED" : "REJECTED" }
          : prev
      );
    } catch (e) {
      setError(e?.response?.data?.message || "Action failed");
    }
  };

  const handleSend = async () => {
    const text = draft.trim();
    if (!text || !activeRoom) return;
    if (activeRoom.status !== "ACCEPTED") return;
    try {
      await sendMessage(text);
      setDraft("");
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
      if (typingSentRef.current) {
        sendTyping(false);
        typingSentRef.current = false;
      }
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to send message");
    }
  };

  const otherDisplayName = activeRoom?.name || (isOwner ? "User" : "Owner");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] pointer-events-none">
      <div
        className="absolute inset-0 bg-black/20 pointer-events-auto"
        onClick={onClose}
      />
      <aside className="absolute right-0 top-0 h-full w-full sm:w-[430px] bg-white shadow-2xl border-l border-slate-200 pointer-events-auto flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="flex items-center gap-2">
            <MessageCircle size={18} />
            <p className="font-semibold">Messages</p>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
              {members.length}
            </span>
            {isOwner && pendingCount > 0 && (
              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                Pending {pendingCount}
              </span>
            )}
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800">
            <X size={18} />
          </button>
        </div>

        {error && <p className="px-4 py-2 text-sm text-red-600">{error}</p>}

        <div className="grid grid-cols-5 min-h-0 flex-1">
          <div className="col-span-2 border-r overflow-y-auto">
            {loading || startingChat ? (
              <p className="p-3 text-sm text-slate-500">Loading chats...</p>
            ) : members.length === 0 ? (
              <p className="p-3 text-sm text-slate-500">No chats yet</p>
            ) : (
              members.map((item) => (
                <button
                  key={item.roomId}
                  onClick={() => setActiveRoom(item)}
                  className={`w-full text-left p-3 border-b hover:bg-slate-50 transition ${
                    activeRoom?.roomId === item.roomId ? "bg-slate-50" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-sm shrink-0 border border-blue-100">
                      {getInitials(item.name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold truncate">{item.name}</p>
                      <p className="text-xs text-slate-500 truncate">
                        {item.propertyTitle}
                      </p>
                      <p className="text-[11px] mt-1 text-blue-600">
                        {formatChatStatus(item.status)}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>

          <div className="col-span-3 flex flex-col min-h-0">
            {!activeRoom ? (
              <div className="h-full flex items-center justify-center text-slate-500 text-sm px-4 text-center">
                Select a chat member to open conversation
              </div>
            ) : (
              <>
                <div className="px-3 py-2 border-b">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate">
                        {isOwner ? "Chat with " : "Chat with "}
                        {otherDisplayName}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {activeRoom.propertyTitle}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs border border-slate-200">
                        {getInitials(myFullName)}
                      </div>
                      <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs border border-blue-100">
                        {getInitials(otherDisplayName)}
                      </div>
                    </div>
                  </div>
                  {(() => {
                    const otherUserId = activeRoom
                      ? Number(isOwner ? activeRoom.userId : activeRoom.ownerId)
                      : null;
                    const otherOnline =
                      otherUserId && presenceByUserId[otherUserId] !== undefined
                        ? presenceByUserId[otherUserId]
                        : undefined;
                    const otherTyping = otherUserId
                      ? typingByUserId[otherUserId]
                      : false;

                    return (
                      <div className="text-[11px] text-slate-500 mt-1 space-y-0.5">
                        {activeRoom.status === "ACCEPTED" && (
                          <p>{socketConnected ? "Live" : "Connecting..."}</p>
                        )}
                        {typeof otherOnline === "boolean" && (
                          <p>{otherOnline ? "Online" : "Offline"}</p>
                        )}
                        {otherTyping && <p>Typing...</p>}
                      </div>
                    );
                  })()}
                </div>

                {isOwner && activeRoom.status === "PENDING" && (
                  <div className="px-3 py-2 border-b flex gap-2">
                    <button
                      onClick={() => handleOwnerDecision(true)}
                      className="px-3 py-1.5 text-xs bg-green-600 text-white rounded"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleOwnerDecision(false)}
                      className="px-3 py-1.5 text-xs bg-red-600 text-white rounded"
                    >
                      Reject
                    </button>
                  </div>
                )}

                <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-slate-50">
                  {messages.length === 0 ? (
                    <p className="text-xs text-slate-500">
                      {activeRoom.status === "PENDING"
                        ? "Waiting for owner acceptance"
                        : "No messages yet"}
                    </p>
                  ) : (
                    messages.map((message) => {
                      const mine =
                        String(message.senderRole).toUpperCase() ===
                        (isOwner ? "PROPERTY_OWNER" : "USER");
                      return (
                        <div
                          key={message.id}
                          className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm shadow-sm ${
                            mine
                              ? "ml-auto bg-blue-600 text-white"
                              : "bg-white border border-slate-200 text-slate-700"
                          }`}
                        >
                          <div
                            className={`text-[11px] font-semibold mb-1 ${
                              mine ? "text-blue-100/90" : "text-slate-400"
                            }`}
                          >
                            {mine ? myFullName : otherDisplayName}
                          </div>
                          {message.text}
                          {message.createdAt && (
                            <div
                              className={`text-[10px] mt-1 opacity-70 ${
                                mine ? "text-blue-100" : "text-slate-500"
                              }`}
                            >
                              {formatTime(message.createdAt)}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                  <div ref={bottomRef} />
                </div>

                <div className="p-3 border-t flex gap-2">
                  <input
                    value={draft}
                    onChange={handleDraftChange}
                    placeholder={
                      activeRoom.status === "ACCEPTED"
                        ? "Type a message..."
                        : activeRoom.status === "REJECTED"
                        ? "Chat rejected"
                        : "Waiting for owner acceptance"
                    }
                    disabled={activeRoom.status !== "ACCEPTED"}
                    onBlur={() => {
                      if (typingTimeoutRef.current) {
                        clearTimeout(typingTimeoutRef.current);
                        typingTimeoutRef.current = null;
                      }
                      if (typingSentRef.current) {
                        sendTyping(false);
                        typingSentRef.current = false;
                      }
                    }}
                    className="flex-1 px-3 py-2 border rounded-lg text-sm disabled:bg-slate-100"
                  />
                  <button
                    onClick={handleSend}
                    disabled={activeRoom.status !== "ACCEPTED" || !draft.trim()}
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg disabled:bg-slate-300"
                  >
                    <Send size={16} />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
};

export default ChatDrawer;
