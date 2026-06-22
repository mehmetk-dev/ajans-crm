import { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import type { Note } from '../api/note.types';
import { useDeleteNote } from '../hooks/useNotes';
import { UserAvatar } from '../../../components/UserAvatar';

interface NoteCardProps {
    note: Note;
    index: number;
}

export function NoteCard({ note, index }: NoteCardProps) {
    const [expanded, setExpanded] = useState(false);
    const deleteNote = useDeleteNote();
    const isLong = note.content.length > 200;
    const visibleContent = expanded || !isLong
        ? note.content
        : `${note.content.slice(0, 200)}...`;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
            className="p-4 bg-white/[0.02] border border-white/[0.06] rounded-2xl hover:border-white/[0.1] transition-colors"
        >
            <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 min-w-0">
                    <UserAvatar
                        name={note.userName}
                        avatarUrl={note.userAvatarUrl}
                        className="h-5 w-5 rounded-md text-[9px]"
                        fallbackClassName="bg-orange-500/10 text-orange-400"
                    />
                    <span className="text-[11px] text-zinc-500">{note.userName}</span>
                    {note.companyName && (
                        <span className="flex items-center gap-1 text-[10px] text-orange-400/60 bg-orange-500/10 px-1.5 py-0.5 rounded">
                            <Building2 className="w-2.5 h-2.5" />
                            {note.companyName}
                        </span>
                    )}
                </div>
                <button
                    onClick={() => deleteNote.mutate(note.id)}
                    className="text-zinc-700 hover:text-red-400 transition-colors shrink-0"
                    aria-label="Notu sil"
                >
                    <Trash2 className="w-3.5 h-3.5" />
                </button>
            </div>

            <div className={`prose prose-invert prose-sm max-w-none text-zinc-300 ${!expanded && isLong ? 'max-h-[120px] overflow-hidden' : ''}`}>
                <ReactMarkdown>{visibleContent}</ReactMarkdown>
            </div>

            {isLong && (
                <button
                    onClick={() => setExpanded(current => !current)}
                    className="flex items-center gap-1 mt-2 text-[11px] text-pink-400 hover:text-pink-300 transition-colors"
                >
                    {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    {expanded ? 'Daralt' : 'Devamini oku'}
                </button>
            )}

            <p className="text-[10px] text-zinc-700 mt-2">
                {new Date(note.createdAt).toLocaleDateString('tr-TR', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                })}
            </p>
        </motion.div>
    );
}
