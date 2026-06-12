import { useState } from 'react';
import { TaskDetailPanel } from '../../features/tasks';
import { ShootDetailPanel } from '../../features/shoots';
import { useStaffCalendar, CalendarGrid } from '../../features/staff-calendar';
import type { TaskResponse } from '../../features/tasks';
import type { ShootResponse } from '../../features/shoots';

export default function StaffCalendarPage() {
    const [selectedTask, setSelectedTask] = useState<TaskResponse | null>(null);
    const [selectedShoot, setSelectedShoot] = useState<ShootResponse | null>(null);
    const {
        year, month, selectedDate, quickFilter, days, dateIndex,
        selection, agenda, todayKey, changeMonth, selectQuickFilter, selectDate,
    } = useStaffCalendar();

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

            <CalendarGrid
                year={year} month={month} days={days} dateIndex={dateIndex}
                selectedDate={selectedDate} quickFilter={quickFilter} todayKey={todayKey}
                selection={selection} agenda={agenda}
                onSelectDate={selectDate} onChangeMonth={changeMonth}
                onSelectTask={setSelectedTask} onSelectShoot={setSelectedShoot}
            />

            <TaskDetailPanel task={selectedTask} onClose={() => setSelectedTask(null)} />
            <ShootDetailPanel shoot={selectedShoot} scope="staff" onClose={() => setSelectedShoot(null)} />
        </div>
    );
}