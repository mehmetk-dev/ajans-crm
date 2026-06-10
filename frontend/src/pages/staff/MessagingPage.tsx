import { useEffect, useState, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, MessageSquare } from "lucide-react";
import { useAuth } from "../../store/AuthContext";
import {
  messagingApi,
  useWebSocket,
  useConversationWebSocketHandlers,
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

export default function MessagingPage() {
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
  const [tab, setTab] = useState<"dm" | "group">("dm");
  const [groups, setGroups] = useState<GroupConversationResponse[]>([]);
  const [activeGroup, setActiveGroup] =
    useState<GroupConversationResponse | null>(null);
  const [groupMessages, setGroupMessages] = useState<GroupMessageResponse[]>(
    [],
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { handleWsMessage, handleGlobalMessage, handleReadReceipt } =
    useConversationWebSocketHandlers(
      activeConv?.id || null,
      user?.id || null,
      setConversations,
      setMessages,
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
        messagingApi.getMyConversations(),
        messagingApi.getMyGroups(),
      ]);
      setConversations(convData);
      setGroups(groupData);
    } catch {
      setError("Konuşmalar yüklenemedi");
    }
    setLoading(false);
  };

  const selectConversation = async (conv: ConversationResponse) => {
    setActiveConv(conv);
    setActiveGroup(null);
    setMsgLoading(true);
    try {
      const data = await messagingApi.getMessages(conv.id);
      setMessages(data.content);
      setConversations((prev) =>
        prev.map((c) => (c.id === conv.id ? { ...c, unreadCount: 0 } : c)),
      );
    } catch {
      setError("Mesajlar yüklenemedi");
    }
    setMsgLoading(false);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConv) return;
    if (connected && wsSend(activeConv.id, newMessage)) {
      setNewMessage("");
    } else {
      try {
        const sent = await messagingApi.sendMessage(activeConv.id, {
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
      } catch {
        setError("Mesaj gönderilemedi");
      }
    }
  };

  const openNewConversation = async () => {
    setShowNewConv(true);
    const data = await messagingApi.getContacts().catch(() => []);
    setContacts(data);
  };

  const startConversationWith = async (targetUserId: string) => {
    try {
      const created = await messagingApi.startConversation(targetUserId);
      if (!conversations.find((c) => c.id === created.id)) {
        setConversations((prev) => [created, ...prev]);
      }
      setActiveConv(created);
      setActiveGroup(null);
      setShowNewConv(false);
      selectConversation(created);
    } catch (e) {
      console.error("Failed to start conversation", e);
    }
  };

  const selectGroup = async (group: GroupConversationResponse) => {
    setActiveGroup(group);
    setActiveConv(null);
    setMsgLoading(true);
    try {
      const data = await messagingApi.getGroupMessages(group.id);
      setGroupMessages(data.content);
      setGroups((prev) =>
        prev.map((g) => (g.id === group.id ? { ...g, unreadCount: 0 } : g)),
      );
    } catch {
      setError("Mesajlar yüklenemedi");
    }
    setMsgLoading(false);
  };

  const handleGroupSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeGroup) return;
    try {
      const sent = await messagingApi.sendGroupMessage(activeGroup.id, {
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
    } catch {
      setError("Mesaj gönderilemedi");
    }
  };

  return (
    <div className="flex h-[calc(100dvh-3.5rem)] bg-[#09090b] -m-4 md:-m-8 rounded-none md:rounded-2xl overflow-hidden border-0 md:border md:border-white/[0.06] relative">
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-red-500/90 text-white px-4 py-2 rounded-xl text-sm font-medium shadow-lg"
          >
            {error}
            <button
              onClick={() => setError(null)}
              className="ml-3 text-white/70 hover:text-white"
            >
              <X className="w-3 h-3 inline" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

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
            />
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-zinc-600 p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center mb-4">
              <MessageSquare className="w-8 h-8 text-zinc-700" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">
              Acente CRM Mesajlaşma
            </h3>
            <p className="max-w-sm text-sm">
              Sol taraftan bir görüşme seçin veya yeni bir sohbet başlatmak için{" "}
              <b>+</b> butonuna tıklayın.
            </p>
          </div>
        )}
      </div>

      <NewConversationModal
        open={showNewConv}
        contacts={contacts}
        onClose={() => setShowNewConv(false)}
        onSelect={startConversationWith}
      />
    </div>
  );
}
