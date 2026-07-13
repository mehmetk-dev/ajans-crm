import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { QuickTaskForm } from './QuickTaskForm';

const { createMock } = vi.hoisted(() => ({
    createMock: vi.fn(() => new Promise(() => undefined)),
}));

vi.mock('../api/taskApi', () => ({
    taskApi: { create: createMock },
}));

describe('QuickTaskForm', () => {
    beforeEach(() => {
        createMock.mockClear();
    });

    it('submits only once before the loading prop renders', () => {
        render(
            <QuickTaskForm
                companies={[]}
                users={[{
                    id: 'assignee-1',
                    fullName: 'Assignee User',
                    email: 'assignee@example.com',
                    globalRole: 'AGENCY_STAFF',
                    avatarUrl: null,
                }]}
                companyId=""
                setCompanyId={vi.fn()}
                loading={false}
                setLoading={vi.fn()}
                onDone={vi.fn()}
            />,
        );

        fireEvent.change(screen.getByLabelText('Görev Başlığı *'), { target: { value: 'Hızlı görev' } });
        fireEvent.change(screen.getByLabelText('Atanan Kişi *'), { target: { value: 'assignee-1' } });
        const submitButton = screen.getByRole('button', { name: 'Görev Oluştur' });
        fireEvent.click(submitButton);
        fireEvent.click(submitButton);

        expect(createMock).toHaveBeenCalledTimes(1);
    });
});
