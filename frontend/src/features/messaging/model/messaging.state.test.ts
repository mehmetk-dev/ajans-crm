import { describe, expect, it } from "vitest";
import type { ConversationResponse, GroupConversationResponse, GroupMessageResponse, MessageResponse } from "../api/messaging.types";
import {
  appendIncomingGroupThreadMessage,
  applyIncomingDirectMessage,
  applyIncomingGroupMessage,
} from "./messaging.state";

describe("messaging state helpers", () => {
  it("updates last message and unread count for an inactive direct conversation", () => {
    const conversation = conversationFixture("conv-1");
    const message = messageFixture("conv-1", "Son DM");

    const result = applyIncomingDirectMessage([conversation], null, message);

    expect(result[0].lastMessage?.content).toBe("Son DM");
    expect(result[0].updatedAt).toBe(message.createdAt);
    expect(result[0].unreadCount).toBe(1);
  });

  it("updates last message and unread count for an inactive group", () => {
    const group = groupFixture("group-1");
    const message = groupMessageFixture("group-1", "Son grup mesajı");

    const result = applyIncomingGroupMessage([group], null, message);

    expect(result[0].lastMessage?.content).toBe("Son grup mesajı");
    expect(result[0].updatedAt).toBe(message.createdAt);
    expect(result[0].unreadCount).toBe(1);
  });

  it("does not increment unread count for the active group", () => {
    const group = { ...groupFixture("group-1"), unreadCount: 2 };
    const message = groupMessageFixture("group-1", "Aktif grup mesajı");

    const result = applyIncomingGroupMessage([group], "group-1", message);

    expect(result[0].lastMessage?.content).toBe("Aktif grup mesajı");
    expect(result[0].unreadCount).toBe(2);
  });

  it("appends incoming group messages to the active thread without duplicates", () => {
    const existing = groupMessageFixture("group-1", "Eski mesaj");
    const incoming = { ...groupMessageFixture("group-1", "Yeni mesaj"), id: "group-message-2" };

    const appended = appendIncomingGroupThreadMessage([existing], "group-1", incoming);
    const duplicated = appendIncomingGroupThreadMessage(appended, "group-1", incoming);
    const inactive = appendIncomingGroupThreadMessage(appended, "group-2", {
      ...incoming,
      id: "group-message-3",
    });

    expect(appended.map((message) => message.content)).toEqual(["Eski mesaj", "Yeni mesaj"]);
    expect(duplicated).toHaveLength(2);
    expect(inactive).toHaveLength(2);
  });
});

function conversationFixture(id: string): ConversationResponse {
  return {
    id,
    otherUserId: "other",
    otherUserName: "Other User",
    otherUserAvatarUrl: null,
    otherUserRole: "COMPANY_USER",
    otherUserCompanyName: null,
    otherUserMembershipRole: null,
    otherUserPositionTitle: null,
    updatedAt: "2026-07-08T10:00:00Z",
    createdAt: "2026-07-08T09:00:00Z",
    messageCount: 0,
    unreadCount: 0,
    lastMessage: null,
  };
}

function messageFixture(conversationId: string, content: string): MessageResponse {
  return {
    id: "message-1",
    conversationId,
    senderId: "sender",
    senderName: "Sender User",
    senderAvatarUrl: null,
    content,
    isRead: false,
    approvalPending: false,
    createdAt: "2026-07-08T11:00:00Z",
  };
}

function groupFixture(id: string): GroupConversationResponse {
  return {
    id,
    name: "Musteri Grubu",
    companyId: "company-1",
    companyName: "Client",
    avatarUrl: null,
    memberCount: 2,
    unreadCount: 0,
    updatedAt: "2026-07-08T10:00:00Z",
    createdAt: "2026-07-08T09:00:00Z",
    lastMessage: null,
    members: [],
  };
}

function groupMessageFixture(groupId: string, content: string): GroupMessageResponse {
  return {
    id: "group-message-1",
    groupId,
    senderId: "sender",
    senderName: "Sender User",
    senderAvatarUrl: null,
    senderGlobalRole: "AGENCY_STAFF",
    content,
    createdAt: "2026-07-08T11:00:00Z",
  };
}
