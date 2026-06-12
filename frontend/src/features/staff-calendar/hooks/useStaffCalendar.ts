import { useMemo, useState } from 'react';
import type { DateIndex, QuickFilter } from '../model/calendar.types';
import { useStaffTasks } from '../../tasks';
import { useMeetings } from '../../meetings';
import { useStaffShoots } from '../../shoots';
import { indexTasks, indexMeetings, indexShoots, collectAgenda } from '../model/calendar.index';
import { getMonthDays, getSelection, formatDateKey } from '../model/calendar.utils';

export function useStaffCalendar() {
    const today = useMemo(() => new Date(), []);
    const [year, setYear] = useState(today.getFullYear());
    const [month, setMonth] = useState(today.getMonth());
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [quickFilter, setQuickFilter] = useState<QuickFilter>('none');
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

    const selectDate = (key: string) => {
        setSelectedDate(current => current === key ? null : key);
        setQuickFilter('none');
    };

    return {
        year, month, selectedDate, quickFilter, days, dateIndex,
        selection, agenda, todayKey, changeMonth, selectQuickFilter, selectDate,
    };
}