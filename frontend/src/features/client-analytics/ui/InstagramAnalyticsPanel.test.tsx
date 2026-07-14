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

    it('renders lightweight media previews with views using limited reels and posts requests', async () => {
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
            recentMedia: [
                {
                    id: 'reel-1',
                    caption: 'Showroom reels',
                    mediaType: 'VIDEO',
                    mediaProductType: 'REELS',
                    mediaUrl: '',
                    thumbnailUrl: 'https://example.com/reel.jpg',
                    permalink: 'https://instagram.com/reel/1',
                    timestamp: '2026-07-08T00:00:00+0000',
                    likeCount: 120,
                    commentsCount: 8,
                },
                {
                    id: 'post-1',
                    caption: 'Yeni koleksiyon',
                    mediaType: 'IMAGE',
                    mediaProductType: 'FEED',
                    mediaUrl: 'https://example.com/post.jpg',
                    thumbnailUrl: '',
                    permalink: 'https://instagram.com/p/1',
                    timestamp: '2026-07-08T00:00:00+0000',
                    likeCount: 80,
                    commentsCount: 4,
                },
            ],
        });
        const getReels = vi.spyOn(igApi, 'getReels').mockResolvedValue([
            {
                id: 'reel-1',
                caption: 'Showroom reels',
                thumbnailUrl: 'https://example.com/reel.jpg',
                permalink: 'https://instagram.com/reel/1',
                timestamp: '2026-07-08T00:00:00+0000',
                likeCount: 120,
                commentsCount: 8,
                plays: 1500,
                reach: 900,
                saved: 10,
                shares: 4,
            },
        ]);
        const getPosts = vi.spyOn(igApi, 'getPosts').mockResolvedValue([
            {
                id: 'post-1',
                caption: 'Yeni koleksiyon',
                mediaType: 'IMAGE',
                mediaUrl: 'https://example.com/post.jpg',
                permalink: 'https://instagram.com/p/1',
                timestamp: '2026-07-08T00:00:00+0000',
                likeCount: 80,
                commentsCount: 4,
                impressions: 730,
                reach: 600,
                saved: 6,
                shares: 2,
            },
        ]);

        renderPanel();

        await waitFor(() => expect(getOverview).toHaveBeenCalledTimes(1));

        expect(getStatus).toHaveBeenCalledWith('company-1', '/client/instagram');
        expect(await screen.findByText('Showroom reels')).toBeInTheDocument();
        expect(screen.getByText('Yeni koleksiyon')).toBeInTheDocument();
        expect(screen.getByText('1500')).toBeInTheDocument();
        expect(screen.getByText('730')).toBeInTheDocument();
        expect(getReels).toHaveBeenCalledWith('company-1', 3);
        expect(getPosts).toHaveBeenCalledWith('company-1', 3);
    });

    it('does not show false empty states while media snapshots are loading', async () => {
        vi.spyOn(igApi, 'getStatus').mockResolvedValue({
            configured: true,
            connected: true,
            authUrl: '',
            username: 'fogistanbul',
            igUserId: 'ig-1',
        });
        vi.spyOn(igApi, 'getOverview').mockResolvedValue({
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
        vi.spyOn(igApi, 'getReels').mockReturnValue(new Promise(() => undefined));
        vi.spyOn(igApi, 'getPosts').mockReturnValue(new Promise(() => undefined));

        renderPanel();

        await waitFor(() => {
            expect(igApi.getReels).toHaveBeenCalled();
            expect(igApi.getPosts).toHaveBeenCalled();
        });
        expect(screen.queryByText('Bu ay henüz reels paylaşılmadı')).not.toBeInTheDocument();
        expect(screen.queryByText('Bu ay henüz gönderi paylaşılmadı')).not.toBeInTheDocument();
        expect(screen.getAllByText(/verileri hazırlanıyor/i)).toHaveLength(2);
    });
});
