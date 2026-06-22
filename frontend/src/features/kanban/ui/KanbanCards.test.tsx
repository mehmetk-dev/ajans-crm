import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { TaskMiniCard, ShootMiniCard, QuickStat } from './KanbanCards';
import type { TaskResponse } from '../../tasks';
import type { ShootResponse } from '../../shoots';

function buildTask(overrides: Partial<TaskResponse> = {}): TaskResponse {
    return {
        id: 'task-1',
        companyId: 'c-1',
        companyName: 'Acme',
        assignedToId: 'u-1',
        assignedToName: 'User',
        createdById: 'u-1',
        createdByName: 'User',
        title: 'Test Task',
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
        id: 'shoot-1',
        companyId: 'c-1',
        companyName: 'Acme',
        title: 'Yeni Çekim',
        description: null,
        shootDate: '2026-06-13T10:00:00Z',
        shootTime: '10:00',
        location: 'Stüdyo',
        status: 'PLANNED',
        photographerId: 'u-1',
        photographerName: 'Photographer',
        photographerAvatarUrl: null,
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

describe('TaskMiniCard', () => {
    it('renders the task title, badge and company name', () => {
        render(<TaskMiniCard task={buildTask({ status: 'IN_PROGRESS' })} />);

        expect(screen.getByText('Test Task')).toBeInTheDocument();
        expect(screen.getByText('Devam Ediyor')).toBeInTheDocument();
        expect(screen.getByText('Acme')).toBeInTheDocument();
    });

    it('calls onClick when the card is clicked', () => {
        const onClick = vi.fn();
        render(<TaskMiniCard task={buildTask()} onClick={onClick} />);

        fireEvent.click(screen.getByText('Test Task'));
        expect(onClick).toHaveBeenCalled();
    });

    it('marks the card as overdue when endDate is in the past', () => {
        const { container } = render(
            <TaskMiniCard task={buildTask({ endDate: '2026-06-01', status: 'TODO' })} />,
        );

        expect(container.firstChild).toHaveClass('border-red-500/20');
    });

    it('falls back to the TODO badge when status is unknown', () => {
        render(<TaskMiniCard task={buildTask({ status: 'TODO' })} />);
        expect(screen.getByText('Bekliyor')).toBeInTheDocument();
    });

    it('does not show the company name when it is null', () => {
        render(<TaskMiniCard task={buildTask({ companyName: null })} />);
        expect(screen.queryByText('Acme')).not.toBeInTheDocument();
    });
});

describe('ShootMiniCard', () => {
    it('renders shoot title, company name and date', () => {
        render(<ShootMiniCard shoot={buildShoot()} />);

        expect(screen.getByText('Yeni Çekim')).toBeInTheDocument();
        expect(screen.getByText('Acme')).toBeInTheDocument();
    });

    it('shows the BUGÜN badge when the shoot is today', () => {
        const today = new Date();
        const todayIso = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 0).toISOString();
        render(<ShootMiniCard shoot={buildShoot({ shootDate: todayIso })} />);

        expect(screen.getByText('BUGÜN')).toBeInTheDocument();
    });

    it('does not show the BUGÜN badge for future shoots', () => {
        render(<ShootMiniCard shoot={buildShoot({ shootDate: '2999-01-01T10:00:00Z' })} />);

        expect(screen.queryByText('BUGÜN')).not.toBeInTheDocument();
    });

    it('does not render the time or location when they are missing', () => {
        render(<ShootMiniCard shoot={buildShoot({ shootTime: null, location: null })} />);

        expect(screen.queryByText('Stüdyo')).not.toBeInTheDocument();
    });
});

describe('QuickStat', () => {
    it('renders the label, value and icon', () => {
        render(
            <QuickStat
                icon={<span data-testid="icon">i</span>}
                label="Aktif"
                value="12"
                accent="bg-pink-500/10"
            />,
        );

        expect(screen.getByTestId('icon')).toBeInTheDocument();
        expect(screen.getByText('Aktif')).toBeInTheDocument();
        expect(screen.getByText('12')).toBeInTheDocument();
    });

    it('accepts a number as the value', () => {
        render(
            <QuickStat
                icon={<span>i</span>}
                label="Toplam"
                value={42}
                accent="bg-blue-500/10"
            />,
        );

        expect(screen.getByText('42')).toBeInTheDocument();
    });
});
