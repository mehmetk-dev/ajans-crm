import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, X, ListTodo, Users, Camera, Rocket, MessageSquare } from 'lucide-react';
import { messagingApi } from '../api/messaging';
import { QuickTaskForm, taskApi, type AssignableUser } from '../features/tasks';
import { MeetingForm } from '../features/meetings';
import { ShootForm } from '../features/shoots';
import { PrProjectForm } from '../features/pr-projects';
import { companyApi, type CompanyResponse } from '../features/company';
import { useNavigate } from 'react-router-dom';

type ActionType = 'task' | 'meeting' | 'shoot' | 'project' | 'message';

const ACTIONS: { type: ActionType; icon: React.ReactNode; label: string; color: string; bg: string }[] = [
    { type: 'task', icon: <ListTodo className="w-5 h-5" />, label: 'Görev', color: 'text-pink-400', bg: 'bg-pink-500/10 hover:bg-pink-500/20 border-pink-500/20' },
    { type: 'meeting', icon: <Users className="w-5 h-5" />, label: 'Toplantı', color: 'text-cyan-400', bg: 'bg-cyan-500/10 hover:bg-cyan-500/20 border-cyan-500/20' },
    { type: 'shoot', icon: <Camera className="w-5 h-5" />, label: 'Çekim', color: 'text-blue-400', bg: 'bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/20' },
    { type: 'project', icon: <Rocket className="w-5 h-5" />, label: 'Proje', color: 'text-pink-400', bg: 'bg-pink-500/10 hover:bg-pink-500/20 border-pink-500/20' },
    { type: 'message', icon: <MessageSquare className="w-5 h-5" />, label: 'Mesaj', color: 'text-amber-400', bg: 'bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/20' },
];

const inputCls = "w-full mt-1 px-4 py-2.5 bg-[#18181b]/60 border border-white/[0.06] rounded-xl text-sm text-white outline-none focus:border-pink-500/50 transition-colors";
const labelCls = "text-[10px] font-bold text-zinc-500 uppercase tracking-widest";

export default function FloatingTaskFab() {
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);
    const [action, setAction] = useState<ActionType | null>(null);
    const [companies, setCompanies] = useState<CompanyResponse[]>([]);
    const [users, setUsers] = useState<AssignableUser[]>([]);
    const [loading, setLoading] = useState(false);
    const [companyId, setCompanyId] = useState<string>('');

    useEffect(() => {
        if (menuOpen || action) {
            companyApi.listStaffAccessible().then(setCompanies).catch(() => {});
            taskApi.listAssignableUsers(companyId || undefined).then(setUsers).catch(() => {});
        }
    }, [menuOpen, action, companyId]);

    const closeAll = () => { setMenuOpen(false); setAction(null); setCompanyId(''); };
    const openForm = (t: ActionType) => { setMenuOpen(false); setAction(t); };

    return (
        <>
            {/* FAB Button */}
            <button onClick={() => setMenuOpen(o => !o)}
                className={`fixed bottom-8 right-8 h-14 w-14 rounded-full bg-pink-600 hover:bg-pink-500 text-white shadow-2xl shadow-pink-500/20 flex items-center justify-center transition-all hover:scale-110 active:scale-95 z-40 group`}>
                <Plus className={`w-6 h-6 transition-transform duration-300 ${menuOpen ? 'rotate-45' : 'group-hover:rotate-90'}`} />
            </button>

            {/* Quick Action Popup — bottom-right above FAB */}
            <AnimatePresence>
                {menuOpen && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 z-30" onClick={() => setMenuOpen(false)} />
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 400 }}
                            className="fixed bottom-24 right-8 z-50 w-52 bg-[#0C0C0E] border border-white/[0.08] rounded-2xl shadow-2xl shadow-black/40 overflow-hidden"
                        >
                            <div className="p-2 space-y-0.5">
                                {ACTIONS.map((a, i) => (
                                    <motion.button
                                        key={a.type}
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.03 }}
                                        onClick={() => openForm(a.type)}
                                        className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl hover:bg-white/[0.04] transition-colors"
                                    >
                                        <div className={a.color}>{a.icon}</div>
                                        <span className="text-sm font-medium text-white">{a.label}</span>
                                    </motion.button>
                                ))}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Form Modal */}
            <AnimatePresence>
                {action && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                        onClick={closeAll}>
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            className="bg-[#0C0C0E] border border-white/[0.08] rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto"
                            onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-between p-5 border-b border-white/[0.06]">
                                <h3 className="text-lg font-bold text-white">
                                    Yeni {ACTIONS.find(a => a.type === action)?.label}
                                </h3>
                                <button onClick={closeAll} className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-white/5 transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="p-5">
                                {action === 'task' && <QuickTaskForm companies={companies} users={users} companyId={companyId} setCompanyId={setCompanyId} loading={loading} setLoading={setLoading} onDone={closeAll} />}
                                {action === 'meeting' && <MeetingForm onSuccess={closeAll} />}
                                {action === 'shoot' && <ShootForm onSuccess={closeAll} />}
                                {action === 'project' && <PrProjectForm onSuccess={closeAll} />}
                                {action === 'message' && <MessageForm users={users} loading={loading} setLoading={setLoading} onDone={closeAll} navigate={navigate} />}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

function UserSelect({ users, value, onChange, label = 'Atanan Kişi *', required = true }: { users: AssignableUser[]; value: string; onChange: (v: string) => void; label?: string; required?: boolean }) {
    return (
        <div>
            <label className={labelCls}>{label}</label>
            <select value={value} onChange={e => onChange(e.target.value)} className={inputCls} required={required}>
                <option value="">Kişi seçiniz</option>
                {users.map(u => (
                    <option key={u.id} value={u.id}>{u.fullName} ({u.globalRole === 'ADMIN' ? 'Admin' : u.globalRole === 'AGENCY_STAFF' ? 'Ajans' : 'Müşteri'})</option>
                ))}
            </select>
        </div>
    );
}

function SubmitBtn({ loading, label, color = 'bg-pink-600 hover:bg-pink-500' }: { loading: boolean; label: string; color?: string }) {
    return (
        <button type="submit" disabled={loading}
            className={`w-full py-3 ${color} text-white rounded-xl text-sm font-bold transition-all disabled:opacity-50`}>
            {loading ? 'Oluşturuluyor...' : label}
        </button>
    );
}

/* ─── Message Form ─── */
function MessageForm({ users, loading, setLoading, onDone, navigate }: { users: AssignableUser[]; loading: boolean; setLoading: (v: boolean) => void; onDone: () => void; navigate: ReturnType<typeof useNavigate> }) {
    const [targetUserId, setTargetUserId] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!targetUserId || !message.trim()) return;
        setLoading(true);
        try {
            const conv = await messagingApi.startConversation(targetUserId);
            await messagingApi.sendMessage(conv.id, { content: message.trim() });
            onDone();
            navigate('/staff/messages');
        } catch { /* */ }
        setLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <UserSelect users={users} value={targetUserId} onChange={setTargetUserId} label="Kime *" />
            <div>
                <label className={labelCls}>Mesaj *</label>
                <textarea value={message} onChange={e => setMessage(e.target.value)} className={`${inputCls} resize-none`} rows={3} placeholder="Mesajınızı yazın..." required />
            </div>
            <SubmitBtn loading={loading} label="Mesaj Gönder" color="bg-amber-600 hover:bg-amber-500" />
        </form>
    );
}
