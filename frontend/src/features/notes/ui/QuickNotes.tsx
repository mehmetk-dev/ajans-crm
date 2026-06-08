import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Circle, CircleCheck, Plus, StickyNote, Trash2 } from 'lucide-react';
import { useCreateNote, useDeleteNote, useNotes, useToggleNote } from '../hooks/useNotes';
import { parseCreateNoteInput } from '../model/note.schema';

interface QuickNotesProps {
    limit?: number;
    title?: string;
    accent?: 'amber' | 'pink';
}

const accentClasses = {
    amber: {
        icon: 'text-amber-400',
        input: 'focus:border-amber-500/30',
        button: 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20',
    },
    pink: {
        icon: 'text-pink-400',
        input: 'focus:border-pink-500/30',
        button: 'bg-pink-500/10 text-pink-400 hover:bg-pink-500/20',
    },
};

export function QuickNotes({ limit = 10, title = 'Hizli Notlar', accent = 'pink' }: QuickNotesProps) {
    const [content, setContent] = useState('');
    const { data, isLoading } = useNotes({ page: 0, size: limit });
    const createNote = useCreateNote();
    const toggleNote = useToggleNote();
    const deleteNote = useDeleteNote();
    const colors = accentClasses[accent];
    const notes = data?.content ?? [];

    const submit = () => {
        const parsed = parseCreateNoteInput(content);
        createNote.mutate(parsed, {
            onSuccess: () => setContent(''),
        });
    };

    return (
        <div className="space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <StickyNote className={`w-5 h-5 ${colors.icon}`} />
                {title}
            </h2>
            <div className="flex gap-2">
                <input
                    value={content}
                    onChange={event => setContent(event.target.value)}
                    onKeyDown={event => {
                        if (event.key === 'Enter' && content.trim()) {
                            submit();
                        }
                    }}
                    maxLength={5000}
                    placeholder="Yeni not ekle..."
                    className={`flex-1 bg-[#0C0C0E] border border-white/[0.06] rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none ${colors.input}`}
                />
                <button
                    onClick={submit}
                    disabled={!content.trim() || createNote.isPending}
                    className={`px-4 py-2.5 rounded-xl disabled:opacity-50 transition-colors ${colors.button}`}
                    aria-label="Not ekle"
                >
                    <Plus className="w-4 h-4" />
                </button>
            </div>

            {isLoading ? (
                <p className="text-center text-zinc-600 text-xs py-4">Notlar yukleniyor...</p>
            ) : notes.length === 0 ? (
                <div className="text-center py-8 bg-[#0C0C0E]/80 border border-white/[0.06] rounded-2xl">
                    <StickyNote className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
                    <p className="text-zinc-600 text-sm">Henuz not eklenmemis</p>
                </div>
            ) : (
                <div className="space-y-1.5">
                    <AnimatePresence mode="popLayout">
                        {notes.map(note => (
                            <motion.div
                                key={note.id}
                                layout
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="flex items-center gap-3 bg-[#0C0C0E] border border-white/[0.06] rounded-xl px-4 py-3 group"
                            >
                                <button
                                    onClick={() => toggleNote.mutate(note.id)}
                                    className="shrink-0"
                                    aria-label={note.isOpen ? 'Notu tamamla' : 'Notu yeniden ac'}
                                >
                                    {note.isOpen
                                        ? <Circle className="w-4 h-4 text-zinc-600" />
                                        : <CircleCheck className="w-4 h-4 text-pink-500" />}
                                </button>
                                <span className={`flex-1 text-sm ${note.isOpen ? 'text-white' : 'text-zinc-600 line-through'}`}>
                                    {note.content}
                                </span>
                                {note.companyName && (
                                    <span className="text-[10px] text-zinc-600 bg-white/5 px-2 py-0.5 rounded">
                                        {note.companyName}
                                    </span>
                                )}
                                <button
                                    onClick={() => deleteNote.mutate(note.id)}
                                    className="text-zinc-700 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                                    aria-label="Notu sil"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}
