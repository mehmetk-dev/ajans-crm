import api from '../../../api/client';
import type { CreateNoteInput, Note, NoteFilters, NotePage } from './note.types';

export const noteApi = {
    list: ({ page = 0, size = 20, companyId }: NoteFilters = {}) =>
        api.get<NotePage>('/staff/notes', {
            params: { page, size, companyId: companyId || undefined },
        }).then(response => response.data),

    create: (input: CreateNoteInput) =>
        api.post<Note>('/staff/notes', input).then(response => response.data),

    toggle: (noteId: string) =>
        api.put<Note>(`/staff/notes/${noteId}/toggle`).then(response => response.data),

    delete: (noteId: string) =>
        api.delete<void>(`/staff/notes/${noteId}`).then(response => response.data),
};
