import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { noteApi } from '../api/noteApi';
import { noteKeys } from '../api/noteKeys';
import type { CreateNoteInput, NoteFilters } from '../api/note.types';

export function useNotes(filters: NoteFilters = {}) {
    return useQuery({
        queryKey: noteKeys.list(filters),
        queryFn: () => noteApi.list(filters),
    });
}

export function useCreateNote() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (input: CreateNoteInput) => noteApi.create(input),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: noteKeys.all }),
    });
}

export function useToggleNote() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (noteId: string) => noteApi.toggle(noteId),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: noteKeys.all }),
    });
}

export function useDeleteNote() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (noteId: string) => noteApi.delete(noteId),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: noteKeys.all }),
    });
}
