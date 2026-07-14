import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { OverviewTab } from './OverviewTab';

describe('OverviewTab advertising links', () => {
    it('shows real Google Ads and Meta Ads connection states', () => {
        const navigate = vi.fn();
        render(
            <OverviewTab
                ga={undefined}
                sc={undefined}
                ig={undefined}
                navigate={navigate}
                upcomingShoots={[]}
                activeTasks={[]}
                gaSnapshot={undefined}
                scSnapshot={undefined}
                igSnapshot={undefined}
                gaConnected={false}
                scConnected={false}
                igConnected={false}
                googleAdsConnected
                metaAdsConnected={false}
            />,
        );

        fireEvent.click(screen.getByRole('button', { name: 'Google Ads — Bağlı' }));
        fireEvent.click(screen.getByRole('button', { name: 'Meta Ads — Bağlı değil' }));

        expect(navigate).toHaveBeenNthCalledWith(1, '/client/google-ads');
        expect(navigate).toHaveBeenNthCalledWith(2, '/client/meta-ads');
    });
});
