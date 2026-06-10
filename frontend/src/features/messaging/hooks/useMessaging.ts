import { useCallback } from "react";
import type {
  ConversationResponse,
  MessageResponse,
} from "../api/messaging.types";

// WebSocket entegrasyonu ile yerel state yönetimi için
export interface MessagingState {
  conversations: ConversationResponse[];
  setConversations: React.Dispatch<
    React.SetStateAction<ConversationResponse[]>
  >;
}

export function useConversationWebSocketHandlers(
  activeConvId: string | null,
  userId: string | null,
  setConversations: React.Dispatch<
    React.SetStateAction<ConversationResponse[]>
  >,
  setMessages: React.Dispatch<React.SetStateAction<MessageResponse[]>>,
) {
  const handleWsMessage = useCallback(
    (msg: MessageResponse) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
      setConversations((prev) =>
        prev.map((c) =>
          c.id === msg.conversationId
            ? { ...c, lastMessage: msg, updatedAt: msg.createdAt }
            : c,
        ),
      );
    },
    [setMessages, setConversations],
  );

  const handleGlobalMessage = useCallback(
    (msg: MessageResponse) => {
      if (msg.conversationId === activeConvId) return;
      setConversations((prev) => {
        const existing = prev.find((c) => c.id === msg.conversationId);
        if (!existing) return prev;
        return prev.map((c) =>
          c.id === msg.conversationId
            ? {
                ...c,
                lastMessage: msg,
                updatedAt: msg.createdAt,
                unreadCount: c.unreadCount + 1,
              }
            : c,
        );
      });
    },
    [activeConvId, setConversations],
  );

  const handleReadReceipt = useCallback(
    (data: { conversationId: string }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.senderId === userId && m.conversationId === data.conversationId
            ? { ...m, isRead: true }
            : m,
        ),
      );
    },
    [userId, setMessages],
  );

  return { handleWsMessage, handleGlobalMessage, handleReadReceipt };
}
