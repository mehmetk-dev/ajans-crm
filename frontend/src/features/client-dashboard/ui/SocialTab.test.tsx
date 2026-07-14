import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SocialTab } from './SocialTab';
import type { IgOverviewResponse } from '../../instagram/instagram.types';

const overview: IgOverviewResponse = {
    connected: true,
    username: 'fogistanbul',
    errorMessage: null,
    followersCount: 1200,
    followsCount: 200,
    mediaCount: 40,
    impressions: 8000,
    reach: 5000,
    profileViews: 120,
    websiteClicks: 18,
    totalLikes: 600,
    totalComments: 45,
    followersGained: 30,
    followersLost: 4,
    dailyTrend: [],
    recentMedia: [],
};

describe('SocialTab', () => {
    it('surfaces failed snapshot metadata while preserving the last data', () => {
        render(
            <SocialTab
                ig={overview}
                navigate={vi.fn()}
                igConnected
                snapshot={{
                    status: 'FAILED',
                    lastSyncedAt: '2026-07-14T09:00:00Z',
                    nextSyncAt: '2026-07-14T10:00:00Z',
                    stale: true,
                    errorMessage: 'Meta unavailable',
                }}
            />,
        );

        expect(screen.getByText(/Son başarılı Instagram verisi korunuyor/i)).toBeInTheDocument();
        expect(screen.getByText('1.2K')).toBeInTheDocument();
    });

    it('routes disconnected clients to the dedicated Instagram connection page', () => {
        const navigate = vi.fn();
        render(<SocialTab ig={undefined} navigate={navigate} igConnected={false} />);

        screen.getByRole('button', { name: 'Instagram Bağla' }).click();

        expect(navigate).toHaveBeenCalledWith('/client/instagram');
    });
});
