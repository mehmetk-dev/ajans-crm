import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TaskCreateDialog } from './TaskCreateDialog';

const mutateMock = vi.fn();

vi.mock('framer-motion', () => ({
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    motion: {
        div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div {...props}>{children}</div>,
    },
}));

vi.mock('../hooks/useTasks', () => ({
    useAssignableUsers: () => ({
        data: [
            {
                id: 'assignee-1',
                fullName: 'Assignee User',
                email: 'assignee@example.com',
                globalRole: 'AGENCY_STAFF',
                avatarUrl: null,
            },
        ],
    }),
    useNotificationRecipients: () => ({ data: [] }),
    useCreateTask: () => ({ mutate: mutateMock, isPending: false }),
}));

describe('TaskCreateDialog', () => {
    beforeEach(() => {
        mutateMock.mockReset();
    });

    it('omits notifyUserIds when no notification recipients are selected', () => {
        render(
            <TaskCreateDialog
                open
                companies={[]}
                mode="staff"
                onClose={vi.fn()}
            />,
        );

        fireEvent.change(screen.getByLabelText('Görev Başlığı *'), { target: { value: 'Ajans içi görev' } });
        fireEvent.change(screen.getByLabelText('Atanan Kişi *'), { target: { value: 'assignee-1' } });
        fireEvent.click(screen.getByRole('button', { name: 'Görevi Oluştur' }));

        expect(mutateMock).toHaveBeenCalledTimes(1);
        expect(mutateMock.mock.calls[0][0]).not.toHaveProperty('notifyUserIds');
    });

    it('submits only once when the form fires twice before the pending state renders', () => {
        render(
            <TaskCreateDialog
                open
                companies={[]}
                mode="staff"
                onClose={vi.fn()}
            />,
        );

        fireEvent.change(screen.getByLabelText('Görev Başlığı *'), { target: { value: 'Çift tıklama testi' } });
        fireEvent.change(screen.getByLabelText('Atanan Kişi *'), { target: { value: 'assignee-1' } });
        const submitButton = screen.getByRole('button', { name: 'Görevi Oluştur' });
        fireEvent.click(submitButton);
        fireEvent.click(submitButton);

        expect(mutateMock).toHaveBeenCalledTimes(1);
    });
});
