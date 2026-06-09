import type { MeetingStatus } from '../api/meeting.types';

export const meetingStatusMeta: Record<MeetingStatus, { label: string; color: string; bg: string }> = {
    PLANNED: {
        label: 'Planlandı',
        color: 'text-blue-400',
        bg: 'bg-blue-500/10 border-blue-500/20',
    },
    COMPLETED: {
        label: 'Tamamlandı',
        color: 'text-pink-400',
        bg: 'bg-pink-500/10 border-pink-500/20',
    },
    CANCELLED: {
        label: 'İptal',
        color: 'text-red-400',
        bg: 'bg-red-500/10 border-red-500/20',
    },
};
