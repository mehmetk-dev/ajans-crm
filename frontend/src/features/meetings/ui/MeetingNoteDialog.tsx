import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useAddMeetingNote, useCompleteMeeting } from '../hooks/useMeetings';

export type MeetingNoteMode = 'complete' | 'add';

interface MeetingNoteDialogProps {
    meetingId: string | null;
    mode: MeetingNoteMode;
    onClose: () => void;
}

export function MeetingNoteDialog({ meetingId, mode, onClose }: MeetingNoteDialogProps) {
    const [content, setContent] = useState('');
    const completeMeeting = useCompleteMeeting();
    const addNote = useAddMeetingNote();
    const isPending = completeMeeting.isPending || addNote.isPending;

    const close = () => {
        setContent('');
        onClose();
    };

    const submit = async () => {
        if (!meetingId || !content.trim()) return;
        const input = { id: meetingId, content: content.trim() };
        if (mode === 'complete') {
            await completeMeeting.mutateAsync(input);
        } else {
            await addNote.mutateAsync(input);
        }
        close();
    };

    return (
        <AnimatePresence>
            {meetingId && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    onClick={close}>
                    <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.95, y: 20 }}
                        className="bg-[#0C0C0E] border border-white/[0.08] rounded-2xl w-full max-w-md shadow-2xl"
                        onClick={event => event.stopPropagation()}>
                        <div className="flex items-center justify-between p-5 border-b border-white/[0.06]">
                            <h3 className="text-lg font-bold text-white">
                                {mode === 'complete' ? 'Toplantıyı Tamamla' : 'Toplantı Notu Yaz'}
                            </h3>
                            <button onClick={close} className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-white/5">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-5 space-y-4">
                            <p className="text-xs text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-3">
                                {mode === 'complete'
                                    ? 'Toplantıyı tamamlamadan önce notlarınızı yazın.'
                                    : 'Bu toplantı hakkındaki notlarınızı yazın.'}
                            </p>
                            <textarea value={content} onChange={event => setContent(event.target.value)}
                                className="w-full px-4 py-3 bg-[#18181b]/60 border border-white/[0.06] rounded-xl text-sm text-white outline-none focus:border-cyan-500/50 resize-none"
                                rows={5} autoFocus />
                            <button onClick={submit} disabled={!content.trim() || isPending}
                                className={`w-full py-3 text-white rounded-xl text-sm font-bold disabled:opacity-50 ${
                                    mode === 'complete' ? 'bg-pink-600 hover:bg-pink-500' : 'bg-amber-600 hover:bg-amber-500'
                                }`}>
                                {isPending ? 'Kaydediliyor...' : mode === 'complete' ? 'Tamamla & Kaydet' : 'Notumu Kaydet'}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
