import { useState, useId } from 'react';
import { messagingApi } from '../api/messagingApi';
import type { AssignableUser } from '../../tasks';

interface QuickMessageFormProps {
    users: AssignableUser[];
    loading: boolean;
    setLoading: (v: boolean) => void;
    onDone: () => void;
    onNavigateMessages: () => void;
}

export function QuickMessageForm({ users, loading, setLoading, onDone, onNavigateMessages }: QuickMessageFormProps) {
    const [targetUserId, setTargetUserId] = useState('');
    const [message, setMessage] = useState('');
    const id = useId();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!targetUserId || !message.trim()) return;
        setLoading(true);
        try {
            const conv = await messagingApi.startConversation(targetUserId);
            await messagingApi.sendMessage(conv.id, { content: message.trim() });
            onDone();
            onNavigateMessages();
        } catch { /* */ }
        setLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor={`${id}-target`} className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Kime *</label>
                <select id={`${id}-target`} value={targetUserId} onChange={e => setTargetUserId(e.target.value)}
                    className="w-full mt-1 px-4 py-2.5 bg-[#18181b]/60 border border-white/[0.06] rounded-xl text-sm text-white outline-none focus:border-pink-500/50 transition-colors" required>
                    <option value="">Kişi seçiniz</option>
                    {users.map(u => (
                        <option key={u.id} value={u.id}>{u.fullName} ({u.globalRole === 'ADMIN' ? 'Admin' : u.globalRole === 'AGENCY_STAFF' ? 'Ajans' : 'Müşteri'})</option>
                    ))}
                </select>
            </div>
            <div>
                <label htmlFor={`${id}-message`} className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Mesaj *</label>
                <textarea id={`${id}-message`} value={message} onChange={e => setMessage(e.target.value)}
                    className="w-full mt-1 px-4 py-2.5 bg-[#18181b]/60 border border-white/[0.06] rounded-xl text-sm text-white outline-none focus:border-pink-500/50 transition-colors resize-none" rows={3} placeholder="Mesajınızı yazın..." required />
            </div>
            <button type="submit" disabled={loading}
                className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-sm font-bold transition-all disabled:opacity-50">
                {loading ? 'Oluşturuluyor...' : 'Mesaj Gönder'}
            </button>
        </form>
    );
}