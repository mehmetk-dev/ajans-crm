import { useEffect, useState, useRef, useCallback } from "react";
import { clientApi } from "../../api/clientPanel";
import { useAuth } from "../../store/AuthContext";
import {
  useWebSocket,
  ConversationList,
  DmMessageThread,
  GroupMessageThread,
  MessageComposer,
  NewConversationModal,
} from "../../features/messaging";
import type {
  ConversationResponse,
  MessageResponse,
  ContactResponse,
  GroupConversationResponse,
  GroupMessageResponse,
} from "../../features/messaging";
import { MessageSquare } from "lucide-react";
import { getApiErrorMessage } from "../../lib/apiError";

export default function ClientMessagingPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ConversationResponse[]>(
    [],
  );
  const [activeConv, setActiveConv] = useState<ConversationResponse | null>(
    null,
  );
  const [messages, setMessages] = useState<MessageResponse[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [msgLoading, setMsgLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showNewConv, setShowNewConv] = useState(false);
  const [contacts, setContacts] = useState<ContactResponse[]>([]);
  const [contactsLoading, setContactsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [tab, setTab] = useState<"dm" | "group">("dm");
  const [groups, setGroups] = useState<GroupConversationResponse[]>([]);
  const [activeGroup, setActiveGroup] =
    useState<GroupConversationResponse | null>(null);
  const [groupMessages, setGroupMessages] = useState<GroupMessageResponse[]>(
    [],
  );

  const handleWsMessage = useCallback((msg: MessageResponse) => {
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
  }, []);

  const handleGlobalMessage = useCallback(
    (msg: MessageResponse) => {
      if (msg.conversationId === activeConv?.id) return;
      setConversations((prev) => {
        const existing = prev.find((c) => c.id === msg.conversationId);
        if (existing) {
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
        }
        return prev;
      });
    },
    [activeConv?.id],
  );

  const handleReadReceipt = useCallback(
    (data: { conversationId: string }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.senderId === user?.id && m.conversationId === data.conversationId
            ? { ...m, isRead: true }
            : m,
        ),
      );
    },
    [user?.id],
  );

  const { connected, sendMessage: wsSend } = useWebSocket({
    conversationId: activeConv?.id || null,
    userId: user?.id || null,
    onMessage: handleWsMessage,
    onGlobalMessage: handleGlobalMessage,
    onReadReceipt: handleReadReceipt,
  });

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadConversations = async () => {
    try {
      const [convData, groupData] = await Promise.all([
        clientApi.getMyConversations(),
        clientApi.getMyGroups(),
      ]);
      setConversations(convData);
      setGroups(groupData);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Konuşmalar yüklenemedi"));
    } finally {
      setLoading(false);
    }
  };

  const selectConversation = async (conv: ConversationResponse) => {
    setActiveConv(conv);
    setActiveGroup(null);
    setMsgLoading(true);
    try {
      const data = await clientApi.getMessages(conv.id);
      setMessages(data.content);
      setConversations((prev) =>
        prev.map((c) => (c.id === conv.id ? { ...c, unreadCount: 0 } : c)),
      );
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Mesajlar yüklenemedi"));
    } finally {
      setMsgLoading(false);
    }
  };

  const openNewConversation = async () => {
    setShowNewConv(true);
    setContactsLoading(true);
    try {
      const data = await clientApi.getContacts();
      setContacts(data);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Kişiler yüklenemedi"));
    } finally {
      setContactsLoading(false);
    }
  };

  const startConversationWith = async (targetUserId: string) => {
    try {
      const created = await clientApi.startConversation(targetUserId);
      const existing = conversations.find((c) => c.id === created.id);
      if (!existing) {
        setConversations((prev) => [created, ...prev]);
      }
      setActiveConv(created);
      setActiveGroup(null);
      setShowNewConv(false);
      selectConversation(created);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Konuşma başlatılamadı"));
    }
  };

  const selectGroup = async (group: GroupConversationResponse) => {
    setActiveGroup(group);
    setActiveConv(null);
    setMsgLoading(true);
    try {
      const data = await clientApi.getGroupMessages(group.id);
      setGroupMessages(data.content);
      setGroups((prev) =>
        prev.map((g) => (g.id === group.id ? { ...g, unreadCount: 0 } : g)),
      );
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Mesajlar yüklenemedi"));
    } finally {
      setMsgLoading(false);
    }
  };

  const handleGroupSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeGroup) return;
    try {
      const sent = await clientApi.sendGroupMessage(activeGroup.id, {
        content: newMessage,
      });
      setGroupMessages((prev) => [...prev, sent]);
      setNewMessage("");
      setGroups((prev) =>
        prev.map((g) =>
          g.id === activeGroup.id
            ? { ...g, lastMessage: sent, updatedAt: sent.createdAt }
            : g,
        ),
      );
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Mesaj gönderilemedi"));
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConv) return;

    if (connected && wsSend(activeConv.id, newMessage)) {
      setNewMessage("");
    } else {
      try {
        const sent = await clientApi.sendMessage(activeConv.id, {
          content: newMessage,
        });
        setMessages((prev) => [...prev, sent]);
        setNewMessage("");
        setConversations((prev) =>
          prev.map((c) =>
            c.id === activeConv.id
              ? { ...c, lastMessage: sent, updatedAt: sent.createdAt }
              : c,
          ),
        );
      } catch (err: unknown) {
        setError(getApiErrorMessage(err, "Mesaj gönderilemedi"));
      }
    }
  };

  return (
    <div className="flex h-[calc(100dvh-3.5rem)] bg-[#09090b] -m-4 md:-m-8 rounded-none md:rounded-2xl overflow-hidden border-0 md:border md:border-white/[0.06] relative">
      {error && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-red-500/90 text-white px-4 py-2 rounded-xl text-sm font-medium shadow-lg">
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-3 text-white/70 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      <div
        className={`w-full md:w-80 bg-[#0C0C0E] border-r border-white/[0.06] flex flex-col ${activeConv || activeGroup ? "hidden md:flex" : "flex"}`}
      >
        <ConversationList
          conversations={conversations}
          groups={groups}
          activeConvId={activeConv?.id || null}
          activeGroupId={activeGroup?.id || null}
          tab={tab}
          loading={loading}
          onSelectConversation={selectConversation}
          onSelectGroup={selectGroup}
          onNewConversation={openNewConversation}
          onTabChange={setTab}
        />
      </div>

      <div
        className={`flex-1 flex flex-col bg-[#09090b] ${!activeConv && !activeGroup ? "hidden md:flex" : "flex"}`}
      >
        {activeGroup ? (
          <>
            <GroupMessageThread
              group={activeGroup}
              messages={groupMessages}
              currentUserId={user?.id || ""}
              loading={msgLoading}
              messagesEndRef={messagesEndRef}
              onClose={() => setActiveGroup(null)}
            />
            <MessageComposer
              value={newMessage}
              onChange={setNewMessage}
              onSubmit={handleGroupSend}
              placeholder="Gruba mesaj yazın..."
            />
          </>
        ) : activeConv ? (
          <>
            <DmMessageThread
              conversation={activeConv}
              messages={messages}
              currentUserId={user?.id || ""}
              loading={msgLoading}
              messagesEndRef={messagesEndRef}
              onClose={() => setActiveConv(null)}
            />
            <MessageComposer
              value={newMessage}
              onChange={setNewMessage}
              onSubmit={handleSend}
              placeholder="Mesajınızı yazın..."
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-zinc-700" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                Acente İletişimi
              </h3>
              <p className="text-zinc-600 text-sm mt-1 max-w-sm">
                Soldaki listeden bir konuşma seçin
              </p>
            </div>
          </div>
        )}
      </div>

      <NewConversationModal
        open={showNewConv}
        contacts={contacts}
        loading={contactsLoading}
        onClose={() => setShowNewConv(false)}
        onSelect={startConversationWith}
      />
    </div>
  );
}
