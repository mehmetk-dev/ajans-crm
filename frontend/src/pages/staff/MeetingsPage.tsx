import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, Plus, X } from 'lucide-react';
import { useAuth } from '../../store/AuthContext';
import {
    MeetingCard,
    MeetingForm,
    MeetingNoteDialog,
    meetingStatusMeta,
    needsMeetingNote,
    useDeleteMeeting,
    useMeetings,
    type MeetingNoteMode,
    type MeetingStatus,
} from '../../features/meetings';

type MeetingFilter = 'ALL' | Extract<MeetingStatus, 'PLANNED' | 'COMPLETED'>;

export default function MeetingsPage() {
    const { user } = useAuth();
    const { data, isLoading } = useMeetings();
    const deleteMeeting = useDeleteMeeting();
    const [filter, setFilter] = useState<MeetingFilter>('ALL');
    const [showCreate, setShowCreate] = useState(false);
    const [noteDialog, setNoteDialog] = useState<{ meetingId: string; mode: MeetingNoteMode } | null>(null);

    const meetings = useMemo(() => (data?.content ?? []).filter(meeting =>
        filter === 'ALL' || meeting.status === filter
    ), [data, filter]);
    const pendingNoteCount = meetings.filter(meeting => needsMeetingNote(meeting, user?.id)).length;

    const removeMeeting = (meetingId: string) => {
        if (window.confirm('Toplantıyı silmek istediğinize emin misiniz?')) {
            deleteMeeting.mutate(meetingId);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-white tracking-tight">Toplantılar</h1>
                    <p className="text-sm text-zinc-500 mt-1">{meetings.length} toplantı</p>
                </div>
                <button onClick={() => setShowCreate(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-sm font-bold">
                    <Plus className="w-4 h-4" /> Yeni Toplantı
                </button>
            </div>

            <div className="flex gap-2">
                {(['PLANNED', 'COMPLETED', 'ALL'] as const).map(value => (
                    <button key={value} onClick={() => setFilter(value)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold ${
                            filter === value ? 'bg-cyan-600 text-white' : 'bg-white/[0.04] text-zinc-400'
                        }`}>
                        {value === 'ALL' ? 'Tümü' : meetingStatusMeta[value].label}
                    </button>
                ))}
            </div>

            {pendingNoteCount > 0 && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-400 mt-0.5" />
                    <p className="text-sm text-amber-300">
                        Tamamlanan {pendingNoteCount} toplantı için notunuz bekleniyor.
                    </p>
                </div>
            )}

            {isLoading ? (
                <div className="text-center py-20 text-zinc-500">Yükleniyor...</div>
            ) : meetings.length === 0 ? (
                <div className="text-center py-20 text-zinc-500">Toplantı bulunamadı</div>
            ) : (
                <div className="space-y-3">
                    {meetings.map(meeting => (
                        <MeetingCard key={meeting.id} meeting={meeting} userId={user?.id}
                            isAdmin={user?.globalRole === 'ADMIN'}
                            onComplete={meetingId => setNoteDialog({ meetingId, mode: 'complete' })}
                            onAddNote={meetingId => setNoteDialog({ meetingId, mode: 'add' })}
                            onDelete={removeMeeting} />
                    ))}
                </div>
            )}

            <AnimatePresence>
                {showCreate && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                        onClick={() => setShowCreate(false)}>
                        <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }}
                            className="bg-[#0C0C0E] border border-white/[0.08] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
                            onClick={event => event.stopPropagation()}>
                            <div className="flex items-center justify-between p-5 border-b border-white/[0.06]">
                                <h3 className="text-lg font-bold text-white">Yeni Toplantı</h3>
                                <button onClick={() => setShowCreate(false)} className="text-zinc-500 hover:text-white">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="p-5">
                                <MeetingForm onSuccess={() => setShowCreate(false)} />
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <MeetingNoteDialog meetingId={noteDialog?.meetingId ?? null}
                mode={noteDialog?.mode ?? 'add'} onClose={() => setNoteDialog(null)} />
        </div>
    );
}
