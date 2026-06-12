import type { DateIndex, AgendaItems } from './calendar.types';
import type { TaskResponse } from '../../tasks';
import type { MeetingResponse } from '../../meetings';
import type { ShootResponse } from '../../shoots';
import { formatDateKey, dateRange, isDateInRange } from './calendar.utils';

function addToIndex<T extends { id: string }>(index: Record<string, T[]>, key: string, item: T): void {
    const items = index[key] ?? [];
    if (!items.some(existing => existing.id === item.id)) {
        index[key] = [...items, item];
    }
}

export function indexTasks(tasks: TaskResponse[]): Record<string, TaskResponse[]> {
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

export function indexMeetings(meetings: MeetingResponse[]): Record<string, MeetingResponse[]> {
    const index: Record<string, MeetingResponse[]> = {};
    meetings.forEach(meeting => addToIndex(index, formatDateKey(new Date(meeting.meetingDate)), meeting));
    return index;
}

export function indexShoots(shoots: ShootResponse[]): Record<string, ShootResponse[]> {
    const index: Record<string, ShootResponse[]> = {};
    shoots.forEach(shoot => {
        if (shoot.shootDate) addToIndex(index, formatDateKey(new Date(shoot.shootDate)), shoot);
    });
    return index;
}

export function collectAgenda(dateIndex: DateIndex, range: [string, string] | null): AgendaItems {
    if (!range) return { tasks: [], meetings: [], shoots: [] };
    const taskIds = new Set<string>();
    const meetingIds = new Set<string>();
    const shootIds = new Set<string>();
    const tasks: TaskResponse[] = [];
    const meetings: MeetingResponse[] = [];
    const shoots: ShootResponse[] = [];
    Object.keys({ ...dateIndex.tasks, ...dateIndex.meetings, ...dateIndex.shoots }).sort().forEach(key => {
        if (!isDateInRange(key, range[0], range[1])) return;
        (dateIndex.tasks[key] ?? []).forEach(task => {
            if (!taskIds.has(task.id)) {
                taskIds.add(task.id);
                tasks.push(task);
            }
        });
        (dateIndex.meetings[key] ?? []).forEach(meeting => {
            if (!meetingIds.has(meeting.id)) {
                meetingIds.add(meeting.id);
                meetings.push(meeting);
            }
        });
        (dateIndex.shoots[key] ?? []).forEach(shoot => {
            if (!shootIds.has(shoot.id)) {
                shootIds.add(shoot.id);
                shoots.push(shoot);
            }
        });
    });
    return { tasks, meetings, shoots };
}