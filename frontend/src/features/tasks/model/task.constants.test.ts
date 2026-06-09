import { describe, expect, it } from 'vitest';
import { effectiveTaskStatus } from './task.constants';
import type { TaskResponse } from '../api/task.types';

function task(overrides: Partial<TaskResponse> = {}): TaskResponse {
    return {
        id: 'task-1',
        companyId: null,
        companyName: null,
        assignedToId: 'user-1',
        assignedToName: 'User',
        createdById: 'user-2',
        createdByName: 'Creator',
        title: 'Task',
        description: null,
        category: 'OTHER',
        priority: null,
        status: 'TODO',
        startDate: null,
        startTime: null,
        endDate: null,
        endTime: null,
        completedAt: null,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
        ...overrides,
    };
}

describe('effectiveTaskStatus', () => {
    it('keeps completed tasks completed', () => {
        expect(effectiveTaskStatus(task({
            status: 'DONE',
            endDate: '2000-01-01T00:00:00Z',
        }))).toBe('DONE');
    });

    it('marks expired active tasks overdue', () => {
        expect(effectiveTaskStatus(task({
            endDate: '2000-01-01T00:00:00Z',
        }))).toBe('OVERDUE');
    });

    it('keeps future tasks active', () => {
        expect(effectiveTaskStatus(task({
            status: 'IN_PROGRESS',
            endDate: '2999-01-01T00:00:00Z',
        }))).toBe('IN_PROGRESS');
    });
});
