import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    AlertCircle, Building2, Calendar, CheckCircle2, ChevronDown, ChevronUp,
    Clock, FileText, MapPin, MessageSquare, Trash2, Users,
} from 'lucide-react';
import type { MeetingResponse } from '../api/meeting.types';
import { meetingStatusMeta } from '../model/meeting.constants';
import { hasMeetingNote, isMeetingParticipant, needsMeetingNote } from '../model/meeting.utils';
import { UserAvatar } from '../../../components/UserAvatar';

interface MeetingCardProps {
    meeting: MeetingResponse;
    userId?: string;
    isAdmin: boolean;
    onComplete: (meetingId: string) => void;
    onAddNote: (meetingId: string) => void;
    onDelete: (meetingId: string) => void;
}

export function MeetingCard({
    meeting,
    userId,
    isAdmin,
    onComplete,
    onAddNote,
    onDelete,
}: MeetingCardProps) {
    const [expanded, setExpanded] = useState(false);
    const [notesExpanded, setNotesExpanded] = useState(false);
    const status = meetingStatusMeta[meeting.status];
    const canManage = meeting.createdById === userId || isAdmin;
    const canAddNote = isMeetingParticipant(meeting, userId) && !hasMeetingNote(meeting, userId);
    const noteNeeded = needsMeetingNote(meeting, userId);

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className={`bg-[#0C0C0E] border rounded-2xl overflow-hidden ${
                noteNeeded ? 'border-amber-500/30' : 'border-white/[0.06]'
            }`}>
            <button type="button" onClick={() => setExpanded(value => !value)}
                className="w-full p-5 text-left hover:bg-white/[0.01] transition-colors">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-base font-bold text-white truncate">{meeting.title}</h3>
                            <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold border ${status.bg} ${status.color}`}>
                                {status.label}
                            </span>
                            {noteNeeded && <span className="text-[10px] font-bold text-amber-400">Not Yazın</span>}
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-500">
                            <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />{formatDate(meeting.meetingDate)}</span>
                            {meeting.durationMinutes && <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{meeting.durationMinutes} dk</span>}
                            {meeting.location && <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{meeting.location}</span>}
                            <span className="flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5" />{meeting.companyName || 'Ajans İçi'}</span>
                            <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" />{meeting.participants.length} katılımcı</span>
                        </div>
                    </div>
                    {expanded ? <ChevronUp className="w-4 h-4 text-zinc-500" /> : <ChevronDown className="w-4 h-4 text-zinc-500" />}
                </div>
            </button>

            <AnimatePresence>
                {expanded && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <div className="px-5 pb-5 border-t border-white/[0.06] pt-4 space-y-4">
                            {meeting.description && <p className="text-sm text-zinc-400">{meeting.description}</p>}
                            <ParticipantList meeting={meeting} />
                            {meeting.notes.length > 0 && (
                                <div>
                                    <button onClick={() => setNotesExpanded(value => !value)}
                                        className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-widest hover:text-white">
                                        <FileText className="w-3.5 h-3.5" /> Toplantı Notları ({meeting.notes.length})
                                        {notesExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                    </button>
                                    {notesExpanded && (
                                        <div className="mt-2 space-y-2">
                                            {meeting.notes.map(note => (
                                                <div key={`${note.userId}-${note.createdAt}`} className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-3">
                                                    <div className="flex items-center gap-2">
                                                        <UserAvatar name={note.fullName} avatarUrl={note.avatarUrl} className="h-6 w-6 rounded-lg text-[10px]" fallbackClassName="bg-cyan-500/10 text-cyan-400" />
                                                        <span className="text-xs font-bold text-cyan-400">{note.fullName}</span>
                                                    </div>
                                                    <p className="text-sm text-zinc-300 whitespace-pre-wrap mt-1">{note.content}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                            <div className="flex items-center gap-2 pt-2">
                                {meeting.status === 'PLANNED' && canManage && (
                                    <button onClick={() => onComplete(meeting.id)}
                                        className="flex items-center gap-2 px-4 py-2 bg-pink-600 hover:bg-pink-500 text-white rounded-xl text-xs font-bold">
                                        <CheckCircle2 className="w-3.5 h-3.5" /> Tamamla
                                    </button>
                                )}
                                {meeting.status === 'COMPLETED' && canAddNote && (
                                    <button onClick={() => onAddNote(meeting.id)}
                                        className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold">
                                        <MessageSquare className="w-3.5 h-3.5" /> Notumu Yaz
                                    </button>
                                )}
                                {meeting.status === 'PLANNED' && canManage && (
                                    <button onClick={() => onDelete(meeting.id)}
                                        className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 rounded-xl text-xs font-bold border border-red-500/20">
                                        <Trash2 className="w-3.5 h-3.5" /> Sil
                                    </button>
                                )}
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] text-zinc-600">
                                <span>Oluşturan:</span>
                                <UserAvatar name={meeting.createdByName} avatarUrl={meeting.createdByAvatarUrl} className="h-4 w-4 rounded text-[8px]" />
                                <span>{meeting.createdByName}</span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

function ParticipantList({ meeting }: { meeting: MeetingResponse }) {
    return (
        <div>
            <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Katılımcılar</h4>
            <div className="flex flex-wrap gap-2">
                {meeting.participants.map(participant => (
                    <div key={participant.userId}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-2 ${
                            meeting.status !== 'COMPLETED'
                                ? 'bg-white/[0.04] border-white/[0.06] text-zinc-300'
                                : participant.noteSubmitted
                                    ? 'bg-pink-500/10 border-pink-500/20 text-pink-400'
                                    : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                        }`}>
                        <UserAvatar
                            name={participant.fullName}
                            avatarUrl={participant.avatarUrl}
                            className="h-5 w-5 rounded-md text-[9px]"
                            fallbackClassName="bg-white/[0.06] text-zinc-300"
                        />
                        {participant.fullName}
                        {meeting.status === 'COMPLETED' && (
                            participant.noteSubmitted
                                ? <CheckCircle2 className="w-3 h-3" />
                                : <AlertCircle className="w-3 h-3" />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

function formatDate(value: string) {
    return new Date(value).toLocaleDateString('tr-TR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}
