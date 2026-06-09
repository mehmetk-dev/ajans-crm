import type { TaskCategory, TaskResponse, TaskStatus } from '../api/task.types';

export const TASK_STATUS_META: Record<TaskStatus, { label: string; badge: string }> = {
    TODO: { label: 'Bekliyor', badge: 'bg-zinc-800 text-zinc-400' },
    IN_PROGRESS: { label: 'Devam Ediyor', badge: 'bg-blue-900/30 text-blue-400' },
    DONE: { label: 'Tamamlandı', badge: 'bg-pink-900/30 text-pink-400' },
    OVERDUE: { label: 'Gecikmiş', badge: 'bg-red-900/30 text-red-400' },
};

export const TASK_CATEGORY_LABELS: Record<TaskCategory, string> = {
    REELS: 'Reels',
    BLOG: 'Blog',
    PAYLASIM: 'Paylaşım',
    SEO: 'SEO',
    TASARIM: 'Tasarım',
    TOPLANTI: 'Toplantı',
    OTHER: 'Diğer',
};

export function effectiveTaskStatus(task: TaskResponse): TaskStatus {
    if (task.status === 'DONE' || task.status === 'OVERDUE' || !task.endDate) {
        return task.status;
    }
    const time = task.endTime?.slice(0, 5) ?? '23:59';
    const deadline = new Date(`${task.endDate.slice(0, 10)}T${time}:00`);
    return !Number.isNaN(deadline.getTime()) && deadline.getTime() < Date.now()
        ? 'OVERDUE'
        : task.status;
}
