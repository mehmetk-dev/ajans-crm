import type {
  ConversationResponse,
  GroupConversationResponse,
  GroupMessageResponse,
  MessageResponse,
} from "../api/messaging.types";

export function applyIncomingDirectMessage(
  conversations: ConversationResponse[],
  activeConversationId: string | null,
  message: MessageResponse,
) {
  const existing = conversations.find((conversation) => conversation.id === message.conversationId);
  if (!existing) return conversations;
  return conversations.map((conversation) =>
    conversation.id === message.conversationId
      ? {
          ...conversation,
          lastMessage: message,
          updatedAt: message.createdAt,
          unreadCount:
            message.conversationId === activeConversationId
              ? conversation.unreadCount
              : conversation.unreadCount + 1,
        }
      : conversation,
  );
}

export function applyIncomingGroupMessage(
  groups: GroupConversationResponse[],
  activeGroupId: string | null,
  message: GroupMessageResponse,
) {
  const existing = groups.find((group) => group.id === message.groupId);
  if (!existing) return groups;
  return groups.map((group) =>
    group.id === message.groupId
      ? {
          ...group,
          lastMessage: message,
          updatedAt: message.createdAt,
          unreadCount:
            message.groupId === activeGroupId
              ? group.unreadCount
              : group.unreadCount + 1,
        }
      : group,
  );
}

export function appendIncomingGroupThreadMessage(
  messages: GroupMessageResponse[],
  activeGroupId: string | null,
  message: GroupMessageResponse,
) {
  if (message.groupId !== activeGroupId) return messages;
  if (messages.some((existing) => existing.id === message.id)) return messages;
  return [...messages, message];
}
