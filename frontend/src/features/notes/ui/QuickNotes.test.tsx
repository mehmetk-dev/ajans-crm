import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { noteApi } from '../api/noteApi';
import { QuickNotes } from './QuickNotes';

function renderQuickNotes() {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false },
        },
    });

    return render(
        <QueryClientProvider client={queryClient}>
            <QuickNotes />
        </QueryClientProvider>
    );
}

describe('QuickNotes', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('lists notes and creates a trimmed note', async () => {
        vi.spyOn(noteApi, 'list').mockResolvedValue({
            content: [{
                id: 'note-1',
                userId: 'user-1',
                userName: 'Test User',
                companyId: null,
                companyName: null,
                content: 'Mevcut not',
                isOpen: true,
                noteDate: '2026-06-09',
                createdAt: '2026-06-09T10:00:00Z',
            }],
            totalElements: 1,
            totalPages: 1,
            number: 0,
            size: 10,
        });
        const createSpy = vi.spyOn(noteApi, 'create').mockResolvedValue({
            id: 'note-2',
            userId: 'user-1',
            userName: 'Test User',
            companyId: null,
            companyName: null,
            content: 'Yeni not',
            isOpen: true,
            noteDate: '2026-06-09',
            createdAt: '2026-06-09T11:00:00Z',
        });

        renderQuickNotes();

        expect(await screen.findByText('Mevcut not')).toBeInTheDocument();
        fireEvent.change(screen.getByPlaceholderText('Yeni not ekle...'), {
            target: { value: '  Yeni not  ' },
        });
        fireEvent.click(screen.getByRole('button', { name: 'Not ekle' }));

        await waitFor(() => {
            expect(createSpy).toHaveBeenCalledWith({ content: 'Yeni not', companyId: undefined });
        });
    });
});
