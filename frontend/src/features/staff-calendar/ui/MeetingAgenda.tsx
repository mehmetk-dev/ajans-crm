import type { MeetingResponse } from '../../meetings';
import { meetingStatusMeta } from '../../meetings';
import { Clock, Building2, MapPin } from 'lucide-react';
import { formatMeetingTime } from '../model/calendar.utils';

interface MeetingAgendaProps {
    meetings: MeetingResponse[];
}

export function MeetingAgenda({ meetings }: MeetingAgendaProps) {
    if (meetings.length === 0) return null;
    return (
        <section>
            <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-2">
                Toplantılar ({meetings.length})
            </h4>
            <div className="space-y-2">
                {meetings.map(meeting => {
                    const status = meetingStatusMeta[meeting.status];
                    return (
                        <div key={meeting.id} className="p-3 rounded-xl bg-cyan-500/[0.04] border border-cyan-500/10">
                            <div className="flex items-center justify-between gap-3">
                                <p className="text-sm font-medium text-white">{meeting.title}</p>
                                <span className={`text-[9px] font-bold ${status.color}`}>{status.label}</span>
                            </div>
                            <div className="flex flex-wrap gap-3 mt-1 text-[10px] text-zinc-500">
                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatMeetingTime(meeting.meetingDate)}</span>
                                <span className="flex items-center gap-1"><Building2 className="w-3 h-3" />{meeting.companyName || 'Ajans İçi'}</span>
                                {meeting.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{meeting.location}</span>}
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}