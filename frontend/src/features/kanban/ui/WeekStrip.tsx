import { useMemo } from 'react';
import { CheckCircle2 } from 'lucide-react';
import type { TaskResponse } from '../../tasks';
import type { MeetingResponse } from '../../meetings';
import type { ShootResponse } from '../../shoots';
import { dateToKey, toLocalDateKey } from '../model/kanban.utils';

export function WeekStrip({ shoots, tasks, meetings, selectedDay, onSelectDay }: {
    shoots: ShootResponse[]; tasks: TaskResponse[]; meetings: MeetingResponse[];
    selectedDay: string | null; onSelectDay: (key: string | null) => void;
}) {
    const days = useMemo(() => {
        const arr = [];
        const now = new Date();
        const start = new Date(now);
        start.setDate(now.getDate() - ((now.getDay() + 6) % 7));
        const dayNames = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
        for (let i = 0; i < 7; i++) {
            const d = new Date(start);
            d.setDate(start.getDate() + i);
            const key = toLocalDateKey(d);
            const isCurrent = d.toDateString() === now.toDateString();
            const dayTasks = tasks.filter(t => dateToKey(t.endDate) === key);
            const dayShoots = shoots.filter(s => dateToKey(s.shootDate) === key);
            const dayMeetings = meetings.filter(m => m.meetingDate && dateToKey(m.meetingDate) === key);
            const pendingTasks = dayTasks.filter(t => t.status !== 'DONE');
            const todayKey = toLocalDateKey(new Date());
            const overdueTasks = pendingTasks.filter(t => dateToKey(t.endDate) < todayKey);
            const allDone = dayTasks.length > 0 && pendingTasks.length === 0;
            const hasOverdue = overdueTasks.length > 0;
            arr.push({
                key, dayName: dayNames[i], date: d.getDate(), isCurrent,
                allDone, hasOverdue,
                shootCount: dayShoots.length, taskCount: pendingTasks.length, meetingCount: dayMeetings.length,
            });
        }
        return arr;
    }, [shoots, tasks, meetings]);

    return (
        <div className="grid grid-cols-7 gap-2">
            {days.map((d) => (
                <button
                    key={d.key}
                    onClick={() => onSelectDay(selectedDay === d.key || d.isCurrent ? null : d.key)}
                    className={`relative text-center p-2.5 rounded-xl transition-all cursor-pointer ${
                        selectedDay === d.key
                            ? 'bg-white/[0.06] border-2 border-pink-500/40 ring-1 ring-pink-500/20'
                            : d.isCurrent
                                ? d.allDone
                                    ? 'bg-pink-500/15 border border-pink-500/30'
                                    : 'bg-pink-500/10 border border-pink-500/20'
                                : d.allDone
                                    ? 'bg-pink-500/[0.06] border border-pink-500/15'
                                    : 'bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.10]'
                    }`}
                >
                    {d.hasOverdue && (
                        <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
                        </span>
                    )}
                    {d.allDone && !d.hasOverdue && (
                        <span className="absolute top-1.5 right-1.5">
                            <CheckCircle2 className="w-3 h-3 text-pink-400" />
                        </span>
                    )}
                    <p className={`text-[10px] font-semibold ${d.isCurrent ? 'text-pink-400' : d.allDone ? 'text-pink-500/70' : 'text-zinc-600'}`}>{d.dayName}</p>
                    <p className={`text-lg font-bold mt-0.5 ${d.isCurrent ? 'text-white' : d.allDone ? 'text-pink-400/70' : 'text-zinc-400'}`}>{d.date}</p>
                    <div className="flex justify-center mt-1 gap-0.5">
                        {Array.from({ length: Math.min(d.shootCount, 3) }).map((_, j) => (
                            <div key={`s${j}`} className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                        ))}
                        {Array.from({ length: Math.min(d.taskCount, 3) }).map((_, j) => (
                            <div key={`t${j}`} className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                        ))}
                        {Array.from({ length: Math.min(d.meetingCount, 3) }).map((_, j) => (
                            <div key={`m${j}`} className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                        ))}
                    </div>
                </button>
            ))}
        </div>
    );
}