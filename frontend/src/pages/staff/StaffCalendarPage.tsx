import { useMemo, useState } from 'react';
import { Building2, Calendar as CalendarIcon, Camera, ChevronLeft, ChevronRight, Clock, MapPin, User } from 'lucide-react';
import {
    TaskDetailPanel,
    useStaffTasks,
    type TaskResponse,
} from '../../features/tasks';
import {
    meetingStatusMeta,
    useMeetings,
    type MeetingResponse,
} from '../../features/meetings';
import {
    ShootDetailPanel,
    useStaffShoots,
    type ShootResponse,
} from '../../features/shoots';

const DAYS = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
const MONTHS = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
];

type QuickFilter = 'none' | 'today' | 'week' | 'month';

interface CalendarDay {
    date: Date;
    currentMonth: boolean;
}

interface DateIndex {
    tasks: Record<string, TaskResponse[]>;
    meetings: Record<string, MeetingResponse[]>;
    shoots: Record<string, ShootResponse[]>;
}

export default function StaffCalendarPage() {
    const today = useMemo(() => new Date(), []);
    const [year, setYear] = useState(today.getFullYear());
    const [month, setMonth] = useState(today.getMonth());
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [quickFilter, setQuickFilter] = useState<QuickFilter>('none');
    const [selectedTask, setSelectedTask] = useState<TaskResponse | null>(null);
    const [selectedShoot, setSelectedShoot] = useState<ShootResponse | null>(null);
    const { data: taskData } = useStaffTasks('all', undefined, 200);
    const { data: meetingData } = useMeetings(200);
    const { data: shootData } = useStaffShoots(0, 200);

    const dateIndex = useMemo<DateIndex>(() => ({
        tasks: indexTasks(taskData?.content ?? []),
        meetings: indexMeetings(meetingData?.content ?? []),
        shoots: indexShoots(shootData?.content ?? []),
    }), [meetingData, shootData, taskData]);
    const days = useMemo(() => getMonthDays(year, month), [year, month]);
    const selection = useMemo(
        () => getSelection(selectedDate, quickFilter, today),
        [quickFilter, selectedDate, today],
    );
    const agenda = useMemo(
        () => collectAgenda(dateIndex, selection),
        [dateIndex, selection],
    );
    const todayKey = formatDateKey(today);

    const changeMonth = (offset: number) => {
        const next = new Date(year, month + offset, 1);
        setYear(next.getFullYear());
        setMonth(next.getMonth());
        setSelectedDate(null);
        setQuickFilter('none');
    };

    const selectQuickFilter = (filter: Exclude<QuickFilter, 'none'>) => {
        setQuickFilter(current => current === filter ? 'none' : filter);
        setSelectedDate(null);
        setYear(today.getFullYear());
        setMonth(today.getMonth());
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-2xl font-black text-white tracking-tight">Takvim</h1>
                    <p className="text-zinc-600 text-sm mt-1">Görev, toplantı ve çekim takvimi</p>
                </div>
                <div className="flex items-center gap-2">
                    {(['today', 'week', 'month'] as const).map(filter => (
                        <button key={filter} onClick={() => selectQuickFilter(filter)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium ${
                                quickFilter === filter
                                    ? 'bg-pink-500 text-white'
                                    : 'bg-pink-500/10 text-pink-400 hover:bg-pink-500/20'
                            }`}>
                            {filter === 'today' ? 'Bugün' : filter === 'week' ? 'Bu Hafta' : 'Bu Ay'}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-[#0C0C0E] border border-white/[0.06] rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-white/[0.06]">
                    <button onClick={() => changeMonth(-1)} className="p-2 rounded-lg hover:bg-white/5 text-zinc-400">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <h2 className="text-lg font-bold text-white">{MONTHS[month]} {year}</h2>
                    <button onClick={() => changeMonth(1)} className="p-2 rounded-lg hover:bg-white/5 text-zinc-400">
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
                            const key = formatDateKey(date);
                            const tasks = dateIndex.tasks[key] ?? [];
                            const meetings = dateIndex.meetings[key] ?? [];
                            const shoots = dateIndex.shoots[key] ?? [];
                            const selected = selectedDate === key;
                            const highlighted = selection ? isDateInRange(key, selection[0], selection[1]) : false;
                            return (
                                <button key={key} onClick={() => {
                                    setSelectedDate(selected ? null : key);
                                    setQuickFilter('none');
                                }} className={`relative p-2 min-h-[78px] border-b border-r border-white/[0.03] text-left ${
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
                    <ShootAgenda shoots={agenda.shoots} onSelect={setSelectedShoot} />
                    <MeetingAgenda meetings={agenda.meetings} />
                    <TaskAgenda tasks={agenda.tasks} onSelect={setSelectedTask} />
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

            <TaskDetailPanel task={selectedTask} onClose={() => setSelectedTask(null)} />
            <ShootDetailPanel shoot={selectedShoot} scope="staff" onClose={() => setSelectedShoot(null)} />
        </div>
    );
}

function ShootAgenda({ shoots, onSelect }: { shoots: ShootResponse[]; onSelect: (shoot: ShootResponse) => void }) {
    if (shoots.length === 0) return null;
    return (
        <section>
            <h4 className="text-xs font-bold text-violet-400 uppercase tracking-widest mb-2">
                Çekimler ({shoots.length})
            </h4>
            <div className="space-y-2">
                {shoots.map(shoot => (
                    <button key={shoot.id} onClick={() => onSelect(shoot)}
                        className="w-full p-3 rounded-xl bg-violet-500/[0.04] border border-violet-500/10 text-left">
                        <p className="text-sm font-medium text-white">{shoot.title}</p>
                        <div className="flex flex-wrap gap-3 mt-1 text-[10px] text-zinc-500">
                            <span className="flex items-center gap-1"><Camera className="w-3 h-3" />{shoot.companyName}</span>
                            {shoot.shootTime && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{shoot.shootTime.slice(0, 5)}</span>}
                            {shoot.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{shoot.location}</span>}
                        </div>
                    </button>
                ))}
            </div>
        </section>
    );
}

function MeetingAgenda({ meetings }: { meetings: MeetingResponse[] }) {
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

function TaskAgenda({ tasks, onSelect }: { tasks: TaskResponse[]; onSelect: (task: TaskResponse) => void }) {
    if (tasks.length === 0) return null;
    return (
        <section>
            <h4 className="text-xs font-bold text-pink-400 uppercase tracking-widest mb-2">
                Görevler ({tasks.length})
            </h4>
            <div className="space-y-2">
                {tasks.map(task => (
                    <button key={task.id} onClick={() => onSelect(task)}
                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.03] text-left">
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{task.title}</p>
                            <div className="flex flex-wrap gap-3 mt-1 text-[10px] text-zinc-500">
                                {task.companyName && <span className="flex items-center gap-1"><Building2 className="w-3 h-3" />{task.companyName}</span>}
                                <span className="flex items-center gap-1"><User className="w-3 h-3" />{task.assignedToName}</span>
                            </div>
                        </div>
                        <span className="text-[9px] font-bold text-zinc-500">{task.status}</span>
                    </button>
                ))}
            </div>
        </section>
    );
}

function indexTasks(tasks: TaskResponse[]) {
    const index: Record<string, TaskResponse[]> = {};
    tasks.forEach(task => {
        const start = task.startDate?.slice(0, 10);
        const end = task.endDate?.slice(0, 10);
        if (!start && !end) return;
        const keys = start && end ? dateRange(start, end) : [start ?? end!];
        keys.forEach(key => addToIndex(index, key, task));
    });
    return index;
}

function indexMeetings(meetings: MeetingResponse[]) {
    const index: Record<string, MeetingResponse[]> = {};
    meetings.forEach(meeting => addToIndex(index, formatDateKey(new Date(meeting.meetingDate)), meeting));
    return index;
}

function indexShoots(shoots: ShootResponse[]) {
    const index: Record<string, ShootResponse[]> = {};
    shoots.forEach(shoot => {
        if (shoot.shootDate) addToIndex(index, formatDateKey(new Date(shoot.shootDate)), shoot);
    });
    return index;
}

function addToIndex<T extends { id: string }>(index: Record<string, T[]>, key: string, item: T) {
    const items = index[key] ?? [];
    if (!items.some(existing => existing.id === item.id)) {
        index[key] = [...items, item];
    }
}

function collectAgenda(index: DateIndex, range: [string, string] | null) {
    if (!range) return { tasks: [], meetings: [], shoots: [] };
    const taskIds = new Set<string>();
    const meetingIds = new Set<string>();
    const shootIds = new Set<string>();
    const tasks: TaskResponse[] = [];
    const meetings: MeetingResponse[] = [];
    const shoots: ShootResponse[] = [];
    Object.keys({ ...index.tasks, ...index.meetings, ...index.shoots }).sort().forEach(key => {
        if (!isDateInRange(key, range[0], range[1])) return;
        (index.tasks[key] ?? []).forEach(task => {
            if (!taskIds.has(task.id)) {
                taskIds.add(task.id);
                tasks.push(task);
            }
        });
        (index.meetings[key] ?? []).forEach(meeting => {
            if (!meetingIds.has(meeting.id)) {
                meetingIds.add(meeting.id);
                meetings.push(meeting);
            }
        });
        (index.shoots[key] ?? []).forEach(shoot => {
            if (!shootIds.has(shoot.id)) {
                shootIds.add(shoot.id);
                shoots.push(shoot);
            }
        });
    });
    return { tasks, meetings, shoots };
}

function getSelection(selectedDate: string | null, filter: QuickFilter, today: Date): [string, string] | null {
    if (selectedDate) return [selectedDate, selectedDate];
    if (filter === 'today') {
        const key = formatDateKey(today);
        return [key, key];
    }
    if (filter === 'week') return getWeekRange(today);
    if (filter === 'month') return getMonthRange(today);
    return null;
}

function selectionLabel(selectedDate: string | null, filter: QuickFilter) {
    if (selectedDate) {
        return new Date(`${selectedDate}T00:00:00`).toLocaleDateString('tr-TR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
        });
    }
    return filter === 'today' ? 'Bugün' : filter === 'week' ? 'Bu Hafta' : 'Bu Ay';
}

function getMonthDays(year: number, month: number): CalendarDay[] {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const mondayOffset = (firstDay.getDay() + 6) % 7;
    const days: CalendarDay[] = [];
    for (let offset = mondayOffset; offset > 0; offset--) {
        days.push({ date: new Date(year, month, 1 - offset), currentMonth: false });
    }
    for (let day = 1; day <= lastDay.getDate(); day++) {
        days.push({ date: new Date(year, month, day), currentMonth: true });
    }
    while (days.length % 7 !== 0) {
        days.push({ date: new Date(year, month + 1, days.length - lastDay.getDate() - mondayOffset + 1), currentMonth: false });
    }
    return days;
}

function dateRange(start: string, end: string) {
    const keys: string[] = [];
    const current = new Date(`${start}T00:00:00`);
    const last = new Date(`${end}T00:00:00`);
    while (current <= last) {
        keys.push(formatDateKey(current));
        current.setDate(current.getDate() + 1);
    }
    return keys;
}

function getWeekRange(date: Date): [string, string] {
    const day = date.getDay();
    const monday = new Date(date.getFullYear(), date.getMonth(), date.getDate() + (day === 0 ? -6 : 1 - day));
    const sunday = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 6);
    return [formatDateKey(monday), formatDateKey(sunday)];
}

function getMonthRange(date: Date): [string, string] {
    return [
        formatDateKey(new Date(date.getFullYear(), date.getMonth(), 1)),
        formatDateKey(new Date(date.getFullYear(), date.getMonth() + 1, 0)),
    ];
}

function formatDateKey(date: Date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function isDateInRange(key: string, start: string, end: string) {
    return key >= start && key <= end;
}

function formatMeetingTime(value: string) {
    return new Date(value).toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
    });
}
