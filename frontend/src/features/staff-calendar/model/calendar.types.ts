import type { MeetingResponse } from '../../meetings';
import type { ShootResponse } from '../../shoots';
import type { TaskResponse } from '../../tasks';

export type QuickFilter = 'none' | 'today' | 'week' | 'month';

export interface CalendarDay {
    date: Date;
    currentMonth: boolean;
}

export interface DateIndex {
    tasks: Record<string, TaskResponse[]>;
    meetings: Record<string, MeetingResponse[]>;
    shoots: Record<string, ShootResponse[]>;
}

export interface AgendaItems {
    tasks: TaskResponse[];
    meetings: MeetingResponse[];
    shoots: ShootResponse[];
}