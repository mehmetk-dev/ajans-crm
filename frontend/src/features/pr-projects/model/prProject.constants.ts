import type { PrProjectStatus } from '../api/prProject.types';

export const prProjectStatusMeta: Record<
    PrProjectStatus,
    { label: string; className: string }
> = {
    ACTIVE: {
        label: 'DEVAM EDİYOR',
        className: 'bg-orange-500/10 text-orange-400',
    },
    COMPLETED: {
        label: 'TAMAMLANDI',
        className: 'bg-pink-500/10 text-pink-400',
    },
    PAUSED: {
        label: 'DURDURULDU',
        className: 'bg-zinc-500/10 text-zinc-400',
    },
};
