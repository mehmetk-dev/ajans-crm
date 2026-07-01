import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { igApi } from '../../instagram';
import InstagramAnalyticsPanel from './InstagramAnalyticsPanel';

function renderPanel() {
    const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });

    return render(
        <QueryClientProvider client={queryClient}>
            <MemoryRouter>
                <InstagramAnalyticsPanel companyId="company-1" />
            </MemoryRouter>
        </QueryClientProvider>,
    );
}

describe('InstagramAnalyticsPanel', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('does not fetch Instagram metrics when the account is not connected', async () => {
        const getStatus = vi.spyOn(igApi, 'getStatus').mockResolvedValue({
            configured: true,
            connected: false,
            authUrl: 'https://facebook.example/oauth?state=company-1:/client/instagram',
            username: '',
            igUserId: '',
        });
        const getOverview = vi.spyOn(igApi, 'getOverview').mockResolvedValue({} as never);
        const getReels = vi.spyOn(igApi, 'getReels').mockResolvedValue([]);
        const getPosts = vi.spyOn(igApi, 'getPosts').mockResolvedValue([]);

        renderPanel();

        const allConnectLinks = await screen.findAllByText(/Bağla$/);

        expect(getOverview).not.toHaveBeenCalled();
        expect(getReels).not.toHaveBeenCalled();
        expect(getPosts).not.toHaveBeenCalled();
        expect(getStatus).toHaveBeenCalledWith('company-1', '/client/instagram');
        expect(allConnectLinks).toHaveLength(3);
    });

    it('does not fetch reels and posts automatically when the account is connected', async () => {
        const getStatus = vi.spyOn(igApi, 'getStatus').mockResolvedValue({
            configured: true,
            connected: true,
            authUrl: '',
            username: 'fogistanbul',
            igUserId: 'ig-1',
        });
        const getOverview = vi.spyOn(igApi, 'getOverview').mockResolvedValue({
            connected: true,
            username: 'fogistanbul',
            errorMessage: null,
            followersCount: 1200,
            followsCount: 300,
            mediaCount: 42,
            impressions: 9000,
            reach: 4500,
            profileViews: 300,
            websiteClicks: 25,
            totalLikes: 640,
            totalComments: 78,
            followersGained: 40,
            followersLost: 12,
            dailyTrend: [],
            recentMedia: [],
        });
        const getReels = vi.spyOn(igApi, 'getReels').mockResolvedValue([]);
        const getPosts = vi.spyOn(igApi, 'getPosts').mockResolvedValue([]);

        renderPanel();

        await waitFor(() => expect(getOverview).toHaveBeenCalledTimes(1));

        expect(getStatus).toHaveBeenCalledWith('company-1', '/client/instagram');
        expect(getReels).not.toHaveBeenCalled();
        expect(getPosts).not.toHaveBeenCalled();
    });
});
