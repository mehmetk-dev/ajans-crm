export const messagingKeys = {
    all: ['messaging'] as const,
    conversations: () => [...messagingKeys.all, 'conversations'] as const,
    conversation: (id: string) => [...messagingKeys.conversations(), id] as const,
    messages: (conversationId: string) => [...messagingKeys.conversation(conversationId), 'messages'] as const,
    contacts: () => [...messagingKeys.all, 'contacts'] as const,
    groups: () => [...messagingKeys.all, 'groups'] as const,
    group: (id: string) => [...messagingKeys.groups(), id] as const,
    groupMessages: (groupId: string) => [...messagingKeys.group(groupId), 'messages'] as const,
};
