import type { ContentPlatform, ContentStatus } from '../api/contentPlan.types';

export const contentPlatforms: Array<{ value: ContentPlatform; label: string }> = [
    { value: 'INSTAGRAM', label: 'Instagram' },
    { value: 'TIKTOK', label: 'TikTok' },
    { value: 'YOUTUBE', label: 'YouTube' },
    { value: 'FACEBOOK', label: 'Facebook' },
    { value: 'LINKEDIN', label: 'LinkedIn' },
    { value: 'TWITTER', label: 'Twitter' },
    { value: 'WEBSITE', label: 'Web Sitesi' },
];

export const contentSizes = [
    '1080x1080', '1080x1350', '1080x1920', '1920x1080',
    '1200x628', '820x312', '500x500', 'Diğer',
];

export const contentStatusMeta: Record<ContentStatus, {
    label: string;
    className: string;
}> = {
    DRAFT: { label: 'Taslak', className: 'bg-zinc-500/10 text-zinc-400' },
    WAITING_APPROVAL: { label: 'Onay Bekliyor', className: 'bg-amber-500/10 text-amber-400' },
    REVISION: { label: 'Revize', className: 'bg-orange-500/10 text-orange-400' },
    APPROVED: { label: 'Onaylandı', className: 'bg-emerald-500/10 text-emerald-400' },
    PUBLISHED: { label: 'Yayınlandı', className: 'bg-pink-500/10 text-pink-400' },
};
