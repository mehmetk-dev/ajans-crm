import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor, act } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../../store/AuthContext', () => ({
    useAuth: () => ({
        user: {
            id: 'user-1',
            email: 'user@test.com',
            fullName: 'Test User',
            globalRole: 'AGENCY_STAFF',
            membershipRole: null,
            avatarUrl: null,
            companyId: 'company-1',
        },
        isLoading: false,
        login: vi.fn(),
        logout: vi.fn(),
    }),
}));

vi.mock('../../../api/settings', () => ({
    settingsApi: {
        uploadAvatar: vi.fn(),
    },
}));

vi.mock('../../tasks', () => ({
    taskApi: {
        listMine: vi.fn(),
        update: vi.fn(),
    },
    taskKeys: {
        staffList: vi.fn(() => ['tasks', 'staff', 'mine']),
        staffLists: vi.fn(() => ['tasks', 'staff']),
    },
}));

vi.mock('../../meetings', () => ({
    meetingApi: { list: vi.fn() },
    meetingKeys: { staffList: vi.fn(() => ['meetings', 'staff']) },
}));

vi.mock('../../shoots', () => ({
    useStaffShoots: vi.fn(),
}));

vi.mock('../../pr-projects', () => ({
    usePrProjects: vi.fn(),
}));

import type { TaskResponse } from '../../tasks';
import type { ShootResponse } from '../../shoots';
import type { MeetingResponse } from '../../meetings';
import { useStaffShoots } from '../../shoots';
import { usePrProjects } from '../../pr-projects';
import { taskApi, taskKeys } from '../../tasks';
import { meetingApi } from '../../meetings';
import { useKanbanData } from './useKanbanData';

function makeWrapper() {
    const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    return ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
}

const buildTask = (overrides: Partial<TaskResponse> = {}): TaskResponse => ({
    id: 'task-1',
    companyId: 'company-1',
    companyName: 'Co',
    assignedToId: 'user-1',
    assignedToName: 'User',
    createdById: 'user-1',
    createdByName: 'User',
    title: 'Task',
    description: null,
    category: 'OTHER',
    priority: null,
    status: 'TODO',
    startDate: null,
    startTime: null,
    endDate: '2026-06-13',
    endTime: null,
    completedAt: null,
    createdAt: '2026-06-01T00:00:00Z',
    updatedAt: '2026-06-01T00:00:00Z',
    ...overrides,
});

const buildShoot = (overrides: Partial<ShootResponse> = {}): ShootResponse => ({
    id: 'shoot-1',
    companyId: 'company-1',
    companyName: 'Co',
    title: 'Shoot',
    description: null,
    shootDate: '2026-06-13T10:00:00Z',
    shootTime: '10:00',
    location: null,
    status: 'PLANNED',
    photographerId: 'user-1',
    photographerName: 'Photog',
    notes: null,
    createdById: 'user-1',
    createdByName: 'User',
    participants: [],
    equipment: [],
    linkedContentCount: 0,
    createdAt: '2026-06-01T00:00:00Z',
    ...overrides,
});

const buildMeeting = (overrides: Partial<MeetingResponse> = {}): MeetingResponse => ({
    id: 'meeting-1',
    companyId: 'company-1',
    companyName: 'Co',
    title: 'Meeting',
    description: null,
    meetingDate: '2026-06-13T10:00:00Z',
    startTime: '10:00',
    endTime: '11:00',
    status: 'PLANNED',
    location: null,
    createdById: 'user-1',
    createdByName: 'User',
    participantIds: [],
    createdAt: '2026-06-01T00:00:00Z',
    ...overrides,
} as MeetingResponse);

describe('useKanbanData', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    function setupEmpty() {
        vi.mocked(taskApi.listMine).mockResolvedValue({
            content: [],
            totalElements: 0,
            totalPages: 0,
            number: 0,
            size: 50,
        });
        vi.mocked(meetingApi.list).mockResolvedValue({
            content: [],
            totalElements: 0,
            totalPages: 0,
            number: 0,
            size: 50,
        });
        vi.mocked(useStaffShoots).mockReturnValue({
            data: { content: [], totalElements: 0, totalPages: 0, number: 0, size: 50 },
            isLoading: false,
        } as never);
        vi.mocked(usePrProjects).mockReturnValue({
            data: { content: [], totalElements: 0, totalPages: 0, number: 0, size: 50 },
        } as never);
    }

    it('returns empty arrays and 0% completion when no data is loaded', async () => {
        setupEmpty();
        const { result } = renderHook(() => useKanbanData(), { wrapper: makeWrapper() });

        await waitFor(() => {
            expect(result.current.allTasks).toBeDefined();
            expect(result.current.allTasks.length).toBe(0);
        });

        expect(result.current.activeTasks).toEqual([]);
        expect(result.current.overdueTasks).toEqual([]);
        expect(result.current.todayTasks).toEqual([]);
        expect(result.current.upcomingShoots).toEqual([]);
        expect(result.current.todayShoots).toEqual([]);
        expect(result.current.upcomingMeetings).toEqual([]);
        expect(result.current.activePr).toEqual([]);
        expect(result.current.completionRate).toBe(0);
        expect(result.current.selectedTask).toBeNull();
        expect(result.current.selectedDay).toBeNull();
    });

    it('partitions tasks, shoots and meetings by status and date', async () => {
        const pastTask = buildTask({ id: 'past', endDate: '2026-06-10', status: 'TODO' });
        const doneTask = buildTask({ id: 'done', endDate: '2026-06-12', status: 'DONE' });
        const futureTask = buildTask({ id: 'future', endDate: '2026-06-20', status: 'IN_PROGRESS' });
        const todayTask = buildTask({ id: 'today', endDate: '2026-06-13', status: 'TODO' });

        vi.mocked(taskApi.listMine).mockResolvedValue({
            content: [pastTask, doneTask, futureTask, todayTask],
            totalElements: 4,
            totalPages: 1,
            number: 0,
            size: 50,
        });
        vi.mocked(meetingApi.list).mockResolvedValue({
            content: [
                buildMeeting({ id: 'past-meeting', meetingDate: '2026-06-10T10:00:00Z' }),
                buildMeeting({ id: 'future-meeting', meetingDate: '2026-06-20T10:00:00Z' }),
                buildMeeting({ id: 'today-meeting', meetingDate: '2026-06-13T10:00:00Z' }),
            ],
            totalElements: 3,
            totalPages: 1,
            number: 0,
            size: 50,
        });
        vi.mocked(useStaffShoots).mockReturnValue({
            data: {
                content: [
                    buildShoot({ id: 'past-shoot', shootDate: '2026-06-10T10:00:00Z' }),
                    buildShoot({ id: 'today-shoot', shootDate: '2026-06-13T10:00:00Z' }),
                    buildShoot({ id: 'cancelled-shoot', shootDate: '2026-06-13T10:00:00Z', status: 'CANCELLED' }),
                ],
                totalElements: 3,
                totalPages: 1,
                number: 0,
                size: 50,
            },
            isLoading: false,
        } as never);
        vi.mocked(usePrProjects).mockReturnValue({
            data: {
                content: [
                    { id: 'p1', status: 'ACTIVE', companyId: null, companyName: null, name: 'PR 1', description: null, startDate: null, endDate: null, responsibleId: null, responsibleName: null, createdById: 'u1', createdByName: 'U', phases: [], members: [], notes: [], createdAt: '2026-06-01T00:00:00Z', updatedAt: '2026-06-01T00:00:00Z' } as never,
                ],
                totalElements: 1,
                totalPages: 1,
                number: 0,
                size: 50,
            },
        } as never);

        const { result } = renderHook(() => useKanbanData(), { wrapper: makeWrapper() });

        await waitFor(() => {
            expect(result.current.allTasks.length).toBe(4);
        });

        expect(result.current.activeTasks.map(t => t.id)).toEqual(['past', 'future', 'today']);
        expect(result.current.overdueTasks.map(t => t.id)).toEqual(['past']);
        expect(result.current.todayTasks.map(t => t.id)).toEqual(['today']);
        expect(result.current.completionRate).toBe(25);

        expect(result.current.todayShoots.map(s => s.id)).toEqual(['today-shoot']);
        expect(result.current.upcomingShoots.map(s => s.id)).toEqual(['today-shoot']);

        expect(result.current.upcomingMeetings.map(m => m.id)).toEqual(['today-meeting', 'future-meeting']);
        expect(result.current.activePr.map(p => p.id)).toEqual(['p1']);
    });

    it('updates task status, invalidates cache and clears selected task', async () => {
        setupEmpty();
        vi.mocked(taskApi.update).mockResolvedValue(buildTask({ id: 'task-1', status: 'DONE' }));

        const { result } = renderHook(() => useKanbanData(), { wrapper: makeWrapper() });

        await waitFor(() => {
            expect(result.current.allTasks).toEqual([]);
        });

        act(() => result.current.setSelectedTask(buildTask()));
        expect(result.current.selectedTask).not.toBeNull();

        await act(async () => {
            await result.current.handleTaskStatusChange('task-1', 'DONE');
        });

        expect(taskApi.update).toHaveBeenCalledWith('task-1', { status: 'DONE' });
        expect(taskKeys.staffLists).toHaveBeenCalled();
    });

    it('keeps the selected task open when the status update fails', async () => {
        setupEmpty();
        vi.mocked(taskApi.update).mockRejectedValue(new Error('network'));

        const { result } = renderHook(() => useKanbanData(), { wrapper: makeWrapper() });

        await waitFor(() => {
            expect(result.current.allTasks).toEqual([]);
        });

        act(() => result.current.setSelectedTask(buildTask()));
        await act(async () => {
            await result.current.handleTaskStatusChange('task-1', 'DONE');
        });

        expect(result.current.selectedTask).not.toBeNull();
    });

    it('exposes day and task setters plus utility helpers', async () => {
        setupEmpty();
        const { result } = renderHook(() => useKanbanData(), { wrapper: makeWrapper() });

        await waitFor(() => {
            expect(result.current.allTasks).toEqual([]);
        });

        act(() => result.current.setSelectedDay('2026-06-13'));
        expect(result.current.selectedDay).toBe('2026-06-13');

        act(() => result.current.setSelectedTask(null));
        expect(result.current.selectedTask).toBeNull();

        expect(typeof result.current.dateToKey).toBe('function');
        expect(typeof result.current.toLocalDateKey).toBe('function');
        expect(typeof result.current.parseLocalDateKey).toBe('function');
    });

    it('reports loading while task or shoot queries are still loading', async () => {
        vi.mocked(taskApi.listMine).mockResolvedValue({
            content: [],
            totalElements: 0,
            totalPages: 0,
            number: 0,
            size: 50,
        });
        vi.mocked(meetingApi.list).mockResolvedValue({
            content: [],
            totalElements: 0,
            totalPages: 0,
            number: 0,
            size: 50,
        });
        vi.mocked(useStaffShoots).mockReturnValue({
            data: undefined,
            isLoading: true,
        } as never);
        vi.mocked(usePrProjects).mockReturnValue({
            data: undefined,
        } as never);

        const { result } = renderHook(() => useKanbanData(), { wrapper: makeWrapper() });

        await waitFor(() => {
            expect(result.current.isLoading).toBe(true);
        });
    });
});
