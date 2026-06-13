import type { TaskResponse } from '../../tasks';

export function getGreeting(): { text: string; iconType: 'moon' | 'sunrise' | 'sun' | 'coffee' } {
    const h = new Date().getHours();
    if (h < 6) return { text: 'İyi geceler', iconType: 'moon' };
    if (h < 12) return { text: 'Günaydın', iconType: 'sunrise' };
    if (h < 18) return { text: 'İyi günler', iconType: 'sun' };
    return { text: 'İyi akşamlar', iconType: 'coffee' };
}

export const STATUS_BADGE: Record<string, { bg: string; text: string; label: string }> = {
    TODO: { bg: 'bg-zinc-800', text: 'text-zinc-400', label: 'Bekliyor' },
    IN_PROGRESS: { bg: 'bg-blue-900/30', text: 'text-blue-400', label: 'Devam Ediyor' },
    DONE: { bg: 'bg-pink-900/30', text: 'text-pink-400', label: 'Tamamlandı' },
};

export const MOTIVATIONAL = [
    'Her detay, mükemmelliğe giden bir adımdır.',
    'Bugün harika işler çıkaracaksın!',
    'Odaklan, uygula, başar.',
    'Küçük adımlar, büyük sonuçlar.',
    'Yaratıcılık disiplinle buluşunca harikalar olur.',
    'Bugünkü emeğin yarının başarısını getirir.',
    'Sen olmasaydın bu takım eksik olurdu.',
];

export function toLocalDateKey(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

export function dateToKey(iso: string | null): string {
    if (!iso) return '';
    if (iso.length === 10 && !iso.includes('T')) return iso;
    return toLocalDateKey(new Date(iso));
}

export function parseLocalDateKey(key: string): Date {
    const [y, m, d] = key.split('-').map(Number);
    return new Date(y, m - 1, d);
}

export function isToday(iso: string | null) {
    if (!iso) return false;
    return dateToKey(iso) === toLocalDateKey(new Date());
}

export function isFuture(iso: string | null) {
    if (!iso) return false;
    return new Date(iso) >= new Date(new Date().toDateString());
}

export function isOverdue(task: TaskResponse) {
    if (task.status === 'DONE') return false;
    if (!task.endDate) return false;
    return dateToKey(task.endDate) < toLocalDateKey(new Date());
}

export function formatDateShort(iso: string | null) {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
}

export function formatTime(t: string | null) {
    if (!t) return null;
    return t.slice(0, 5);
}