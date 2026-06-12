export function formatDateKey(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function formatMeetingTime(value: string): string {
    return new Date(value).toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export function getMonthDays(year: number, month: number): import('./calendar.types').CalendarDay[] {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const mondayOffset = (firstDay.getDay() + 6) % 7;
    const days: import('./calendar.types').CalendarDay[] = [];
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

export function dateRange(start: string, end: string): string[] {
    const keys: string[] = [];
    const current = new Date(`${start}T00:00:00`);
    const last = new Date(`${end}T00:00:00`);
    while (current <= last) {
        keys.push(formatDateKey(current));
        current.setDate(current.getDate() + 1);
    }
    return keys;
}

export function getWeekRange(date: Date): [string, string] {
    const day = date.getDay();
    const monday = new Date(date.getFullYear(), date.getMonth(), date.getDate() + (day === 0 ? -6 : 1 - day));
    const sunday = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 6);
    return [formatDateKey(monday), formatDateKey(sunday)];
}

export function getMonthRange(date: Date): [string, string] {
    return [
        formatDateKey(new Date(date.getFullYear(), date.getMonth(), 1)),
        formatDateKey(new Date(date.getFullYear(), date.getMonth() + 1, 0)),
    ];
}

export function isDateInRange(key: string, start: string, end: string): boolean {
    return key >= start && key <= end;
}

export function getSelection(selectedDate: string | null, filter: import('./calendar.types').QuickFilter, today: Date): [string, string] | null {
    if (selectedDate) return [selectedDate, selectedDate];
    if (filter === 'today') {
        const key = formatDateKey(today);
        return [key, key];
    }
    if (filter === 'week') return getWeekRange(today);
    if (filter === 'month') return getMonthRange(today);
    return null;
}

export function selectionLabel(selectedDate: string | null, filter: import('./calendar.types').QuickFilter): string {
    if (selectedDate) {
        return new Date(`${selectedDate}T00:00:00`).toLocaleDateString('tr-TR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
        });
    }
    return filter === 'today' ? 'Bugün' : filter === 'week' ? 'Bu Hafta' : 'Bu Ay';
}

export const DAYS = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'] as const;

export const MONTHS = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
] as const;