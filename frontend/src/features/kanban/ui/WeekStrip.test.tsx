import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { WeekStrip } from './WeekStrip';
import type { TaskResponse } from '../../tasks';
import type { ShootResponse } from '../../shoots';
import type { MeetingResponse } from '../../meetings';

function buildTask(overrides: Partial<TaskResponse> = {}): TaskResponse {
    return {
        id: 't-1',
        companyId: 'c-1',
        companyName: 'Co',
        assignedToId: 'u-1',
        assignedToName: 'User',
        createdById: 'u-1',
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
    };
}

function buildShoot(overrides: Partial<ShootResponse> = {}): ShootResponse {
    return {
        id: 's-1',
        companyId: 'c-1',
        companyName: 'Co',
        title: 'Shoot',
        description: null,
        shootDate: '2026-06-13T10:00:00Z',
        shootTime: '10:00',
        location: null,
        status: 'PLANNED',
        photographerId: 'u-1',
        photographerName: 'Photog',
        notes: null,
        createdById: 'u-1',
        createdByName: 'User',
        participants: [],
        equipment: [],
        linkedContentCount: 0,
        createdAt: '2026-06-01T00:00:00Z',
        ...overrides,
    };
}

function buildMeeting(overrides: Partial<MeetingResponse> = {}): MeetingResponse {
    return {
        id: 'm-1',
        companyId: 'c-1',
        companyName: 'Co',
        title: 'Meeting',
        description: null,
        meetingDate: '2026-06-13T10:00:00Z',
        startTime: '10:00',
        endTime: '11:00',
        status: 'PLANNED',
        location: null,
        createdById: 'u-1',
        createdByName: 'User',
        participantIds: [],
        createdAt: '2026-06-01T00:00:00Z',
        ...overrides,
    } as MeetingResponse;
}

describe('WeekStrip', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date(2026, 5, 11, 10, 0, 0));
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('renders 7 day buttons', () => {
        render(
            <WeekStrip
                shoots={[]}
                tasks={[]}
                meetings={[]}
                selectedDay={null}
                onSelectDay={vi.fn()}
            />,
        );

        const buttons = screen.getAllByRole('button');
        expect(buttons).toHaveLength(7);
        expect(screen.getByText('Pzt')).toBeInTheDocument();
        expect(screen.getByText('Paz')).toBeInTheDocument();
    });

    it('invokes onSelectDay with the clicked day key', () => {
        const onSelectDay = vi.fn();
        render(
            <WeekStrip
                shoots={[]}
                tasks={[]}
                meetings={[]}
                selectedDay={null}
                onSelectDay={onSelectDay}
            />,
        );

        const buttons = screen.getAllByRole('button');
        fireEvent.click(buttons[0]);
        expect(onSelectDay).toHaveBeenCalled();
    });

    it('toggles off when the currently selected day is clicked again', () => {
        const onSelectDay = vi.fn();
        const todayKey = '2026-06-11';
        render(
            <WeekStrip
                shoots={[]}
                tasks={[]}
                meetings={[]}
                selectedDay={todayKey}
                onSelectDay={onSelectDay}
            />,
        );

        const buttons = screen.getAllByRole('button');
        const todayButton = buttons.find(b => b.textContent?.includes('11'));
        expect(todayButton).toBeDefined();
        fireEvent.click(todayButton!);

        expect(onSelectDay).toHaveBeenCalledWith(null);
    });

    it('clears the selection when the current day is clicked', () => {
        const onSelectDay = vi.fn();
        render(
            <WeekStrip
                shoots={[]}
                tasks={[]}
                meetings={[]}
                selectedDay={null}
                onSelectDay={onSelectDay}
            />,
        );

        const buttons = screen.getAllByRole('button');
        const todayButton = buttons.find(b => b.textContent?.includes('11'));
        fireEvent.click(todayButton!);

        expect(onSelectDay).toHaveBeenCalledWith(null);
    });
});
