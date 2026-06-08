import type { MaintenanceCategory } from '../api/maintenanceLog.types';

export const MAINTENANCE_CATEGORY_OPTIONS: Array<{
    value: MaintenanceCategory;
    label: string;
}> = [
    { value: 'update', label: 'Güncelleme' },
    { value: 'fix', label: 'Hata Düzeltme' },
    { value: 'feature', label: 'Yeni Özellik' },
    { value: 'security', label: 'Güvenlik' },
    { value: 'content', label: 'İçerik' },
    { value: 'seo', label: 'SEO' },
    { value: 'other', label: 'Diğer' },
];

export const MAINTENANCE_CATEGORY_LABELS = Object.fromEntries(
    MAINTENANCE_CATEGORY_OPTIONS.map(option => [option.value, option.label])
) as Record<MaintenanceCategory, string>;

export const MAINTENANCE_CATEGORY_COLORS: Record<MaintenanceCategory, string> = {
    update: 'bg-blue-500/10 text-blue-400',
    fix: 'bg-red-500/10 text-red-400',
    feature: 'bg-emerald-500/10 text-emerald-400',
    security: 'bg-amber-500/10 text-amber-400',
    content: 'bg-violet-500/10 text-violet-400',
    seo: 'bg-pink-500/10 text-pink-400',
    other: 'bg-zinc-700/50 text-zinc-400',
};
