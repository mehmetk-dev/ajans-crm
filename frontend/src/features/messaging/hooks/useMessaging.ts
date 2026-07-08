import { useCallback } from "react";
import type {
  ConversationResponse,
  GroupConversationResponse,
  GroupMessageResponse,
  MessageResponse,
} from "../api/messaging.types";
import {
  appendIncomingGroupThreadMessage,
  applyIncomingDirectMessage,
  applyIncomingGroupMessage,
} from "../model/messaging.state";

// WebSocket entegrasyonu ile yerel state yönetimi için
export interface MessagingState {
  conversations: ConversationResponse[];
  setConversations: React.Dispatch<
    React.SetStateAction<ConversationResponse[]>
  >;
}

export function useConversationWebSocketHandlers(
  activeConvId: string | null,
  activeGroupId: string | null,
  userId: string | null,
  setConversations: React.Dispatch<
    React.SetStateAction<ConversationResponse[]>
  >,
  setGroups: React.Dispatch<React.SetStateAction<GroupConversationResponse[]>>,
  setGroupMessages: React.Dispatch<React.SetStateAction<GroupMessageResponse[]>>,
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
      setConversations((prev) => applyIncomingDirectMessage(prev, activeConvId, msg));
    },
    [activeConvId, setConversations],
  );

  const handleGlobalGroupMessage = useCallback(
    (msg: GroupMessageResponse) => {
      setGroups((prev) => applyIncomingGroupMessage(prev, activeGroupId, msg));
      setGroupMessages((prev) => appendIncomingGroupThreadMessage(prev, activeGroupId, msg));
    },
    [activeGroupId, setGroupMessages, setGroups],
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

  return { handleWsMessage, handleGlobalMessage, handleGlobalGroupMessage, handleReadReceipt };
}
