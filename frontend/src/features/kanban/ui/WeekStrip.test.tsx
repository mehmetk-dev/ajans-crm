import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { WeekStrip } from './WeekStrip';

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
