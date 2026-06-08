import type { NoteFilters } from './note.types';

export const noteKeys = {
    all: ['notes'] as const,
    lists: () => [...noteKeys.all, 'list'] as const,
    list: (filters: NoteFilters) => [...noteKeys.lists(), filters] as const,
};
