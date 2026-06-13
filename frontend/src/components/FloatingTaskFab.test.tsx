import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('../features/tasks', () => ({
    QuickTaskForm: ({ onDone }: { onDone: () => void }) => (
        <div>
            <span>QuickTaskForm</span>
            <button onClick={onDone}>task-done</button>
        </div>
    ),
    taskApi: { listAssignableUsers: vi.fn().mockResolvedValue([]) },
}));

vi.mock('../features/meetings', () => ({
    MeetingForm: ({ onSuccess }: { onSuccess: () => void }) => (
        <div>
            <span>MeetingForm</span>
            <button onClick={onSuccess}>meeting-success</button>
        </div>
    ),
}));

vi.mock('../features/shoots', () => ({
    ShootForm: ({ onSuccess }: { onSuccess: () => void }) => (
        <div>
            <span>ShootForm</span>
            <button onClick={onSuccess}>shoot-success</button>
        </div>
    ),
}));

vi.mock('../features/pr-projects', () => ({
    PrProjectForm: ({ onSuccess }: { onSuccess: () => void }) => (
        <div>
            <span>PrProjectForm</span>
            <button onClick={onSuccess}>project-success</button>
        </div>
    ),
}));

vi.mock('../features/messaging', () => ({
    QuickMessageForm: ({ onDone, onNavigateMessages }: { onDone: () => void; onNavigateMessages: () => void }) => (
        <div>
            <span>QuickMessageForm</span>
            <button onClick={onDone}>msg-done</button>
            <button onClick={onNavigateMessages}>msg-navigate</button>
        </div>
    ),
}));

vi.mock('../features/company', () => ({
    companyApi: { listStaffAccessible: vi.fn().mockResolvedValue([]) },
}));

import FloatingTaskFab from './FloatingTaskFab';

function makeWrapper() {
    const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    return ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            <MemoryRouter>{children}</MemoryRouter>
        </QueryClientProvider>
    );
}

describe('FloatingTaskFab', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('renders a toggle button but no action menu by default', () => {
        render(<FloatingTaskFab />, { wrapper: makeWrapper() });

        const button = screen.getByRole('button');
        expect(button).toBeInTheDocument();
        expect(screen.queryByText('Görev')).not.toBeInTheDocument();
        expect(screen.queryByText('Toplantı')).not.toBeInTheDocument();
    });

    it('opens the action menu when the fab is clicked', () => {
        render(<FloatingTaskFab />, { wrapper: makeWrapper() });

        fireEvent.click(screen.getByRole('button'));

        expect(screen.getByText('Görev')).toBeInTheDocument();
        expect(screen.getByText('Toplantı')).toBeInTheDocument();
        expect(screen.getByText('Çekim')).toBeInTheDocument();
        expect(screen.getByText('Proje')).toBeInTheDocument();
        expect(screen.getByText('Mesaj')).toBeInTheDocument();
    });

    it('closes the action menu when the overlay is clicked', async () => {
        render(<FloatingTaskFab />, { wrapper: makeWrapper() });

        fireEvent.click(screen.getByRole('button'));
        expect(screen.getByText('Görev')).toBeInTheDocument();

        const overlay = document.querySelector('.fixed.inset-0.z-30');
        if (overlay) fireEvent.click(overlay);

        await waitFor(() => {
            expect(screen.queryByText('Görev')).not.toBeInTheDocument();
        });
    });

    it('opens the task form when "Görev" is selected and closes on done', async () => {
        render(<FloatingTaskFab />, { wrapper: makeWrapper() });

        fireEvent.click(screen.getByRole('button'));
        fireEvent.click(screen.getByText('Görev'));

        expect(await screen.findByText('QuickTaskForm')).toBeInTheDocument();
        expect(screen.getByText(/Yeni Görev/)).toBeInTheDocument();

        fireEvent.click(screen.getByText('task-done'));

        await waitFor(() => {
            expect(screen.queryByText('QuickTaskForm')).not.toBeInTheDocument();
        });
    });

    it('opens the meeting form when "Toplantı" is selected', async () => {
        render(<FloatingTaskFab />, { wrapper: makeWrapper() });

        fireEvent.click(screen.getByRole('button'));
        fireEvent.click(screen.getByText('Toplantı'));

        expect(await screen.findByText('MeetingForm')).toBeInTheDocument();
    });

    it('opens the shoot form when "Çekim" is selected', async () => {
        render(<FloatingTaskFab />, { wrapper: makeWrapper() });

        fireEvent.click(screen.getByRole('button'));
        fireEvent.click(screen.getByText('Çekim'));

        expect(await screen.findByText('ShootForm')).toBeInTheDocument();
    });

    it('opens the project form when "Proje" is selected', async () => {
        render(<FloatingTaskFab />, { wrapper: makeWrapper() });

        fireEvent.click(screen.getByRole('button'));
        fireEvent.click(screen.getByText('Proje'));

        expect(await screen.findByText('PrProjectForm')).toBeInTheDocument();
    });

    it('opens the message form when "Mesaj" is selected', async () => {
        render(<FloatingTaskFab />, { wrapper: makeWrapper() });

        fireEvent.click(screen.getByRole('button'));
        fireEvent.click(screen.getByText('Mesaj'));

        expect(await screen.findByText('QuickMessageForm')).toBeInTheDocument();
    });
});
