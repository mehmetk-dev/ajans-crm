import type { FileFilterKey } from '../api/file.types';

export const FILE_FILTERS: { key: FileFilterKey; label: string }[] = [
    { key: '', label: 'Hepsi' },
    { key: 'image/', label: 'Görseller' },
    { key: 'video/', label: 'Videolar' },
    { key: 'application/', label: 'Belgeler' },
];

export const ACCEPTED_MEDIA_TYPES =
    'image/*,video/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.*';
