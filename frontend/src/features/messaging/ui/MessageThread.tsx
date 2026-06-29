import { X, Users, Check, CheckCheck } from "lucide-react";
import type {
  MessageResponse,
  ConversationResponse,
  GroupMessageResponse,
  GroupConversationResponse,
} from "../api/messaging.types";
import { formatMessageTime, getRoleLabel } from "../model/messaging.utils";
import { UserAvatar } from "../../../components/UserAvatar";

// DM Thread
interface DmThreadProps {
  conversation: ConversationResponse;
  messages: MessageResponse[];
  currentUserId: string;
  loading: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  onClose: () => void;
}

export function DmMessageThread({
  conversation,
  messages,
  currentUserId,
  loading,
  messagesEndRef,
  onClose,
}: DmThreadProps) {
  return (
    <>
      <div className="h-16 border-b border-white/[0.06] flex items-center px-6 bg-[#0C0C0E]/80">
        <div className="flex items-center gap-3">
          <button
            className="md:hidden text-zinc-400 hover:text-white mr-2"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </button>
          <UserAvatar
            name={conversation.otherUserName}
            avatarUrl={conversation.otherUserAvatarUrl}
            className="h-8 w-8 rounded-full border border-white/[0.06] text-[10px]"
          />
          <div>
            <h3 className="text-sm font-bold text-white">
              {conversation.otherUserName}
            </h3>
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider">
              {getRoleLabel(
                conversation.otherUserRole,
                conversation.otherUserMembershipRole,
                conversation.otherUserCompanyName,
              ) ||
                (conversation.otherUserRole === "ADMIN"
                  ? "Yönetici"
                  : conversation.otherUserRole === "AGENCY_STAFF"
                    ? "Ajans Çalışanı"
                    : "Kullanıcı")}
              {conversation.otherUserPositionTitle
                ? " · " + conversation.otherUserPositionTitle
                : ""}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
        {loading ? (
          <div className="text-center py-12 text-zinc-600 text-sm">
            Mesajlar yükleniyor...
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12 text-zinc-600 text-sm">
            İlk mesajı gönderin
          </div>
        ) : (
          messages.map((msg) => {
            const isMine = msg.senderId === currentUserId;
            return (
              <div key={msg.id} className={`flex items-end gap-2 ${isMine ? "justify-end" : "justify-start"}`}>
                {!isMine && (
                  <UserAvatar
                    name={msg.senderName}
                    avatarUrl={msg.senderAvatarUrl}
                    className="h-7 w-7 rounded-full text-[10px]"
                  />
                )}
                <div
                  className={`max-w-[75%] md:max-w-[60%] rounded-2xl px-4 py-3 ${
                    isMine
                      ? "bg-cyan-500 text-white rounded-br-sm"
                      : "bg-[#18181b] text-zinc-100 rounded-bl-sm border border-white/[0.06]"
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {msg.content}
                  </p>
                  <div
                    className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${isMine ? "text-cyan-200" : "text-zinc-500"}`}
                  >
                    <span>{formatMessageTime(msg.createdAt)}</span>
                    {isMine &&
                      (msg.isRead ? (
                        <CheckCheck className="w-3.5 h-3.5 text-blue-400" />
                      ) : (
                        <Check className="w-3.5 h-3.5 text-cyan-900" />
                      ))}
                  </div>
                </div>
                {isMine && (
                  <UserAvatar
                    name={msg.senderName}
                    avatarUrl={msg.senderAvatarUrl}
                    className="h-7 w-7 rounded-full text-[10px]"
                    fallbackClassName="bg-cyan-500/20 text-cyan-100"
                  />
                )}
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>
    </>
  );
}

// Group Thread
interface GroupThreadProps {
  group: GroupConversationResponse;
  messages: GroupMessageResponse[];
  currentUserId: string;
  loading: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  onClose: () => void;
}

export function GroupMessageThread({
  group,
  messages,
  currentUserId,
  loading,
  messagesEndRef,
  onClose,
}: GroupThreadProps) {
  return (
    <>
      <div className="h-16 border-b border-white/[0.06] flex items-center px-6 bg-[#0C0C0E]/80">
        <div className="flex items-center gap-3">
          <button
            className="md:hidden text-zinc-400 hover:text-white mr-2"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </button>
          <div className="h-8 w-8 rounded-full bg-cyan-500/10 flex items-center justify-center border border-white/[0.06]">
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">{group.name}</h3>
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider">
              {group.memberCount} üye · {group.companyName}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
        {loading ? (
          <div className="text-center py-12 text-zinc-600 text-sm">
            Mesajlar yükleniyor...
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12 text-zinc-600 text-sm">
            Gruba ilk mesajı gönderin
          </div>
        ) : (
          messages.map((msg) => {
            const isMine = msg.senderId === currentUserId;
            return (
              <div key={msg.id} className={`flex items-end gap-2 ${isMine ? "justify-end" : "justify-start"}`}>
                {!isMine && (
                  <UserAvatar
                    name={msg.senderName}
                    avatarUrl={msg.senderAvatarUrl}
                    className="h-7 w-7 rounded-full text-[10px]"
                  />
                )}
                <div
                  className={`max-w-[75%] md:max-w-[60%] rounded-2xl px-4 py-3 ${
                    isMine
                      ? "bg-cyan-500 text-white rounded-br-sm"
                      : "bg-[#18181b] text-zinc-100 rounded-bl-sm border border-white/[0.06]"
                  }`}
                >
                  {!isMine && (
                    <p
                      className={`text-[11px] font-semibold mb-1 ${msg.senderGlobalRole === "ADMIN" || msg.senderGlobalRole === "AGENCY_STAFF" ? "text-orange-400" : "text-cyan-400"}`}
                    >
                      {msg.senderName}
                      {(msg.senderGlobalRole === "ADMIN" ||
                        msg.senderGlobalRole === "AGENCY_STAFF") && (
                        <span className="ml-1.5 text-[9px] bg-orange-500/20 text-orange-300 px-1.5 py-0.5 rounded-full">
                          Ajans
                        </span>
                      )}
                    </p>
                  )}
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {msg.content}
                  </p>
                  <div
                    className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${isMine ? "text-cyan-200" : "text-zinc-500"}`}
                  >
                    <span>{formatMessageTime(msg.createdAt)}</span>
                  </div>
                </div>
                {isMine && (
                  <UserAvatar
                    name={msg.senderName}
                    avatarUrl={msg.senderAvatarUrl}
                    className="h-7 w-7 rounded-full text-[10px]"
                    fallbackClassName="bg-cyan-500/20 text-cyan-100"
                  />
                )}
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>
    </>
  );
}
