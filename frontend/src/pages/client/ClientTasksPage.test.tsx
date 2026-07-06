import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ClientTasksPage from './ClientTasksPage';

const listClientMock = vi.fn();
const listReviewsBatchMock = vi.fn();
const listReviewsMock = vi.fn();
const reviewMock = vi.fn();
const canCreateClientTaskMock = vi.fn();

vi.mock('framer-motion', () => ({
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    motion: {
        div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div {...props}>{children}</div>,
    },
}));

vi.mock('../../store/AuthContext', () => ({
    useAuth: () => ({
        user: {
            id: 'user-1',
            companyId: 'company-1',
            email: 'user@test.com',
            fullName: 'Test User',
            globalRole: 'COMPANY_USER',
            membershipRole: null,
            avatarUrl: null,
        },
    }),
}));

vi.mock('../../features/tasks', () => ({
    taskApi: {
        listClient: (...args: unknown[]) => listClientMock(...args),
        listReviewsBatch: (...args: unknown[]) => listReviewsBatchMock(...args),
        listReviews: (...args: unknown[]) => listReviewsMock(...args),
        review: (...args: unknown[]) => reviewMock(...args),
        canCreateClientTask: (...args: unknown[]) => canCreateClientTaskMock(...args),
    },
    taskKeys: {
        all: ['tasks'],
        clientList: (status?: string) => ['tasks', 'client', 'list', status ?? 'ALL'],
        reviewsBatch: (taskIds: string[]) => ['tasks', 'client', 'reviews-batch', taskIds.join(',')],
        clientCreatePermission: (companyId: string) => ['tasks', 'client', 'can-create', companyId],
    },
    TaskCreateDialog: () => null,
}));

function page(content: unknown[] = []) {
    return {
        content,
        totalElements: content.length,
        totalPages: 1,
        number: 0,
        size: 20,
    };
}

function renderPage() {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false, gcTime: Infinity },
        },
    });

    return render(
        <QueryClientProvider client={queryClient}>
            <ClientTasksPage />
        </QueryClientProvider>,
    );
}

describe('ClientTasksPage', () => {
    beforeEach(() => {
        listClientMock.mockReset();
        listReviewsBatchMock.mockReset();
        listReviewsMock.mockReset();
        reviewMock.mockReset();
        canCreateClientTaskMock.mockReset();
        listClientMock.mockResolvedValue(page());
        listReviewsBatchMock.mockResolvedValue({});
        canCreateClientTaskMock.mockResolvedValue({ canCreate: false });
    });

    it('loads tasks with server-side status filters and batches completed task reviews', async () => {
        const doneTask = {
            id: 'task-done',
            companyId: 'company-1',
            companyName: 'Company',
            assignedToId: 'staff-1',
            assignedToName: 'Staff User',
            createdById: 'staff-1',
            createdByName: 'Staff User',
            title: 'Tamamlanan görev',
            description: null,
            category: 'OTHER',
            priority: null,
            status: 'DONE',
            startDate: null,
            startTime: null,
            endDate: null,
            endTime: null,
            completedAt: '2026-06-20T10:00:00Z',
            createdAt: '2026-06-19T10:00:00Z',
            updatedAt: '2026-06-20T10:00:00Z',
        };
        listClientMock.mockImplementation((_page: number, _size: number, status?: string) => {
            if (status === 'DONE') return Promise.resolve(page([doneTask]));
            return Promise.resolve(page());
        });

        renderPage();

        await waitFor(() => {
            expect(listClientMock).toHaveBeenCalledWith(0, 50, 'TODO');
            expect(listClientMock).toHaveBeenCalledWith(0, 50, 'IN_PROGRESS');
            expect(listClientMock).toHaveBeenCalledWith(0, 50, 'OVERDUE');
            expect(listClientMock).toHaveBeenCalledWith(0, 50, 'DONE');
        });

        expect(listClientMock).not.toHaveBeenCalledWith(0, 100);
        await waitFor(() => {
            expect(listReviewsBatchMock).toHaveBeenCalledWith(['task-done']);
        });
        expect(listReviewsMock).not.toHaveBeenCalled();
    });
});
