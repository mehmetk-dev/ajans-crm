import type { ShootDisplayStatus } from '../api/shoot.types';

export const shootStatusMeta: Record<ShootDisplayStatus, { label: string; className: string }> = {
    PLANNED: { label: 'Planlandı', className: 'bg-violet-500/10 text-violet-400' },
    OVERDUE: { label: 'Gecikmiş', className: 'bg-amber-500/10 text-amber-400' },
    COMPLETED: { label: 'Tamamlandı', className: 'bg-emerald-500/10 text-emerald-400' },
    CANCELLED: { label: 'İptal', className: 'bg-red-500/10 text-red-400' },
};
