import { MessageSquare, Plus, Users } from 'lucide-react';
import type { ConversationResponse, GroupConversationResponse } from '../api/messaging.types';
import { timeAgo } from '../model/messaging.utils';
import { UserAvatar } from '../../../components/UserAvatar';

interface Props {
    conversations: ConversationResponse[];
    groups: GroupConversationResponse[];
    activeConvId: string | null;
    activeGroupId: string | null;
    tab: 'dm' | 'group';
    loading: boolean;
    onSelectConversation: (conv: ConversationResponse) => void;
    onSelectGroup: (group: GroupConversationResponse) => void;
    onNewConversation: () => void;
    onTabChange: (tab: 'dm' | 'group') => void;
}

export function ConversationList({
    conversations, groups, activeConvId, activeGroupId,
    tab, loading, onSelectConversation, onSelectGroup, onNewConversation, onTabChange
}: Props) {
    const totalGroupUnread = groups.reduce((sum, g) => sum + g.unreadCount, 0);

    return (
        <div className="flex flex-col h-full">
            <div className="p-4 border-b border-white/[0.06] flex items-center justify-between">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-cyan-400" />
                    Mesajlar
                </h2>
                <button
                    onClick={onNewConversation}
                    className="h-8 w-8 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 flex items-center justify-center transition-colors"
                >
                    <Plus className="w-4 h-4" />
                </button>
            </div>

            <div className="flex border-b border-white/[0.06]">
                <button
                    onClick={() => onTabChange('dm')}
                    className={`flex-1 py-2.5 text-xs font-semibold tracking-wide transition-colors ${tab === 'dm' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                    Direkt Mesajlar
                </button>
                <button
                    onClick={() => onTabChange('group')}
                    className={`flex-1 py-2.5 text-xs font-semibold tracking-wide transition-colors relative ${tab === 'group' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                    Gruplar
                    {totalGroupUnread > 0 && (
                        <span className="ml-1.5 bg-red-500 text-white text-[9px] font-bold h-4 min-w-4 px-1 rounded-full inline-flex items-center justify-center">
                            {totalGroupUnread}
                        </span>
                    )}
                </button>
            </div>

            <div className="flex-1 overflow-y-auto">
                {loading ? (
                    <div className="text-center py-12 text-zinc-600 text-sm">Yükleniyor...</div>
                ) : tab === 'dm' ? (
                    conversations.length === 0 ? (
                        <div className="text-center py-12 px-4">
                            <MessageSquare className="w-8 h-8 text-zinc-800 mx-auto mb-3" />
                            <p className="text-zinc-600 text-sm">Henüz mesajınız yok</p>
                            <button
                                onClick={onNewConversation}
                                className="mt-3 text-cyan-400 text-xs hover:text-cyan-300 transition-colors"
                            >
                                Kişi seçin ve mesajlaşmaya başlayın →
                            </button>
                        </div>
                    ) : (
                        conversations.map(conv => (
                            <button
                                key={conv.id}
                                onClick={() => onSelectConversation(conv)}
                                className={`w-full p-4 text-left border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors ${activeConvId === conv.id ? 'bg-white/[0.04]' : ''}`}
                            >
                                <div className="flex items-center gap-3">
                                    <UserAvatar name={conv.otherUserName} avatarUrl={conv.otherUserAvatarUrl} className="h-10 w-10 rounded-full text-xs" />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-medium text-white truncate">{conv.otherUserName}</p>
                                            <span className="text-[10px] text-zinc-600 shrink-0 ml-2">
                                                {conv.updatedAt ? timeAgo(conv.updatedAt) : ''}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between mt-1">
                                            <p className="text-xs text-zinc-500 truncate flex-1 pr-2">
                                                {conv.lastMessage?.content || 'Sohbet başladı'}
                                            </p>
                                            {conv.unreadCount > 0 && (
                                                <span className="bg-red-500 text-white text-[10px] font-bold h-4 min-w-4 px-1 rounded-full flex items-center justify-center">
                                                    {conv.unreadCount}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </button>
                        ))
                    )
                ) : (
                    groups.length === 0 ? (
                        <div className="text-center py-12 px-4">
                            <Users className="w-8 h-8 text-zinc-800 mx-auto mb-3" />
                            <p className="text-zinc-600 text-sm">Henüz grup yok</p>
                        </div>
                    ) : (
                        groups.map(group => (
                            <button
                                key={group.id}
                                onClick={() => onSelectGroup(group)}
                                className={`w-full p-4 text-left border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors ${activeGroupId === group.id ? 'bg-white/[0.04]' : ''}`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-cyan-500/10 flex items-center justify-center">
                                        <Users className="w-5 h-5 text-cyan-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-medium text-white truncate">{group.name}</p>
                                            <span className="text-[10px] text-zinc-600 shrink-0 ml-2">
                                                {group.updatedAt ? timeAgo(group.updatedAt) : ''}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between mt-1">
                                            <p className="text-xs text-zinc-500 truncate flex-1 pr-2">
                                                {group.lastMessage
                                                    ? `${group.lastMessage.senderName.split(' ')[0]}: ${group.lastMessage.content}`
                                                    : `${group.memberCount} üye`}
                                            </p>
                                            {group.unreadCount > 0 && (
                                                <span className="bg-red-500 text-white text-[10px] font-bold h-4 min-w-4 px-1 rounded-full flex items-center justify-center">
                                                    {group.unreadCount}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </button>
                        ))
                    )
                )}
            </div>
        </div>
    );
}
