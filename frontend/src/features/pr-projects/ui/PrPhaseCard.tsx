import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    CheckCircle2,
    ChevronDown,
    ChevronUp,
    FileText,
    MessageSquare,
    Send,
    User,
} from 'lucide-react';
import type { PrProjectPhase, PrProjectStatus } from '../api/prProject.types';
import { formatPrProjectDate } from '../model/prProject.utils';

interface PrPhaseCardProps {
    phase: PrProjectPhase;
    projectStatus: PrProjectStatus;
    expanded: boolean;
    pending?: boolean;
    onToggle: () => void;
    onComplete: () => void;
    onAddNote: (content: string) => void;
}

export function PrPhaseCard({
    phase,
    projectStatus,
    expanded,
    pending,
    onToggle,
    onComplete,
    onAddNote,
}: PrPhaseCardProps) {
    const [note, setNote] = useState('');
    const submitNote = () => {
        const content = note.trim();
        if (!content) return;
        onAddNote(content);
        setNote('');
    };

    return (
        <div className={`bg-[#0C0C0E] border rounded-xl ${
            phase.isCompleted ? 'border-pink-500/10' : 'border-white/[0.04]'
        }`}>
            <button
                type="button"
                onClick={onToggle}
                className="w-full flex items-center gap-3 p-3 text-left"
            >
                <div className={`h-7 w-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                    phase.isCompleted
                        ? 'bg-pink-500/10 text-pink-400'
                        : 'bg-[#18181b] text-zinc-500'
                }`}>
                    {phase.phaseNumber}
                </div>
                <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${
                        phase.isCompleted ? 'text-pink-400' : 'text-white'
                    }`}>
                        {phase.name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                        {phase.assignedToName && (
                            <span className="text-[10px] text-zinc-600 flex items-center gap-0.5">
                                <User className="w-2.5 h-2.5" />
                                {phase.assignedToName}
                            </span>
                        )}
                        {(phase.startDate || phase.endDate) && (
                            <span className="text-[10px] text-zinc-700">
                                {formatPrProjectDate(phase.startDate)} -{' '}
                                {formatPrProjectDate(phase.endDate)}
                            </span>
                        )}
                        {phase.phaseNotes.length > 0 && (
                            <span className="text-[10px] text-violet-500 flex items-center gap-0.5">
                                <MessageSquare className="w-2.5 h-2.5" />
                                {phase.phaseNotes.length}
                            </span>
                        )}
                    </div>
                </div>
                {phase.isCompleted
                    ? <CheckCircle2 className="w-4 h-4 text-pink-500" />
                    : expanded
                        ? <ChevronUp className="w-4 h-4 text-zinc-600" />
                        : <ChevronDown className="w-4 h-4 text-zinc-600" />}
            </button>

            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="px-3 pb-3 space-y-2 border-t border-white/[0.04] pt-2">
                            {phase.notes && (
                                <div className="flex items-start gap-1.5">
                                    <FileText className="w-3 h-3 text-zinc-600 mt-0.5" />
                                    <p className="text-xs text-zinc-400 whitespace-pre-wrap">
                                        {phase.notes}
                                    </p>
                                </div>
                            )}

                            {phase.phaseNotes.map(item => (
                                <div
                                    key={item.id}
                                    className="bg-[#0a0a0b] rounded-lg px-2.5 py-1.5 border border-white/[0.03]"
                                >
                                    <div className="flex justify-between gap-2">
                                        <span className="text-[10px] text-violet-400">
                                            {item.authorName}
                                        </span>
                                        <span className="text-[9px] text-zinc-700">
                                            {formatPrProjectDate(item.createdAt)}
                                        </span>
                                    </div>
                                    <p className="text-xs text-zinc-300 whitespace-pre-wrap">
                                        {item.content}
                                    </p>
                                </div>
                            ))}

                            {projectStatus !== 'COMPLETED' && (
                                <div className="flex items-center gap-1.5">
                                    <input
                                        value={note}
                                        onChange={event => setNote(event.target.value)}
                                        onKeyDown={event => {
                                            if (event.key === 'Enter') submitNote();
                                        }}
                                        placeholder="Not ekle..."
                                        className="flex-1 bg-[#0a0a0b] border border-white/[0.06] rounded-lg px-2.5 py-1.5 text-xs text-white"
                                    />
                                    <button
                                        type="button"
                                        onClick={submitNote}
                                        disabled={!note.trim() || pending}
                                        className="p-1.5 bg-violet-500/10 text-violet-400 rounded-lg disabled:opacity-30"
                                    >
                                        <Send className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            )}

                            {!phase.isCompleted && projectStatus !== 'COMPLETED' && (
                                <button
                                    type="button"
                                    onClick={onComplete}
                                    disabled={pending}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500/10 text-orange-400 rounded-lg text-xs disabled:opacity-50"
                                >
                                    <CheckCircle2 className="w-3 h-3" />
                                    Tamamlandı olarak işaretle
                                </button>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
