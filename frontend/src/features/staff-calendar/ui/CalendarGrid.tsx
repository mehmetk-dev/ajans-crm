import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import type { DateIndex, QuickFilter } from '../model/calendar.types';
import { DAYS, MONTHS, isDateInRange, selectionLabel } from '../model/calendar.utils';
import { ShootAgenda } from './ShootAgenda';
import { MeetingAgenda } from './MeetingAgenda';
import { TaskAgenda } from './TaskAgenda';
import type { TaskResponse } from '../../tasks';
import type { ShootResponse } from '../../shoots';
import type { AgendaItems } from '../model/calendar.types';

interface CalendarGridProps {
    year: number;
    month: number;
    days: import('./../model/calendar.types').CalendarDay[];
    dateIndex: DateIndex;
    selectedDate: string | null;
    quickFilter: QuickFilter;
    todayKey: string;
    selection: [string, string] | null;
    agenda: AgendaItems;
    onSelectDate: (key: string) => void;
    onChangeMonth: (offset: number) => void;
    onSelectTask: (task: TaskResponse) => void;
    onSelectShoot: (shoot: ShootResponse) => void;
}

export function CalendarGrid({
    year, month, days, dateIndex,
    selectedDate, quickFilter, todayKey,
    selection, agenda,
    onSelectDate, onChangeMonth, onSelectTask, onSelectShoot,
}: CalendarGridProps) {
    return (
        <>
            <div className="bg-[#0C0C0E] border border-white/[0.06] rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-white/[0.06]">
                    <button onClick={() => onChangeMonth(-1)} className="p-2 rounded-lg hover:bg-white/5 text-zinc-400">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <h2 className="text-lg font-bold text-white">{MONTHS[month]} {year}</h2>
                    <button onClick={() => onChangeMonth(1)} className="p-2 rounded-lg hover:bg-white/5 text-zinc-400">
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <div className="grid grid-cols-7 border-b border-white/[0.06] min-w-[500px]">
                        {DAYS.map(day => (
                            <div key={day} className="p-2 text-center text-[10px] font-bold text-zinc-600 uppercase">
                                {day}
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-7 min-w-[500px]">
                        {days.map(({ date, currentMonth }) => {
                            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                            const tasks = dateIndex.tasks[key] ?? [];
                            const meetings = dateIndex.meetings[key] ?? [];
                            const shoots = dateIndex.shoots[key] ?? [];
                            const selected = selectedDate === key;
                            const highlighted = selection ? isDateInRange(key, selection[0], selection[1]) : false;
                            return (
                                <button key={key} onClick={() => onSelectDate(key)}
                                    className={`relative p-2 min-h-[78px] border-b border-r border-white/[0.03] text-left ${
                                        !currentMonth ? 'opacity-30'
                                            : selected ? 'bg-pink-500/10'
                                                : highlighted ? 'bg-pink-500/5'
                                                    : key === todayKey ? 'bg-white/[0.03]' : 'hover:bg-white/[0.02]'
                                    }`}>
                                    <span className={`text-xs font-medium ${
                                        key === todayKey ? 'bg-pink-500 text-white px-1.5 py-0.5 rounded-md' : 'text-zinc-400'
                                    }`}>{date.getDate()}</span>
                                    <div className="mt-2 space-y-1">
                                        {tasks.length > 0 && (
                                            <p className="text-[9px] text-pink-400 truncate">{tasks.length} görev</p>
                                        )}
                                        {meetings.length > 0 && (
                                            <p className="text-[9px] text-cyan-400 truncate">{meetings.length} toplantı</p>
                                        )}
                                        {shoots.length > 0 && (
                                            <p className="text-[9px] text-violet-400 truncate">{shoots.length} çekim</p>
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {selection && (
                <div className="bg-[#0C0C0E] border border-white/[0.06] rounded-2xl p-5 space-y-5">
                    <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4" /> {selectionLabel(selectedDate, quickFilter)}
                    </h3>
                    <ShootAgenda shoots={agenda.shoots} onSelect={onSelectShoot} />
                    <MeetingAgenda meetings={agenda.meetings} />
                    <TaskAgenda tasks={agenda.tasks} onSelect={onSelectTask} />
                    {agenda.tasks.length === 0 && agenda.meetings.length === 0 && agenda.shoots.length === 0 && (
                        <p className="text-zinc-600 text-sm text-center py-4">Bu aralıkta kayıt yok</p>
                    )}
                </div>
            )}

            <div className="flex items-center gap-4 text-xs text-zinc-600">
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-pink-500" /> Görev</span>
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-cyan-500" /> Toplantı</span>
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-violet-500" /> Çekim</span>
            </div>
        </>
    );
}