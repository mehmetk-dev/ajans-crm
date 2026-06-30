import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
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

        const connectLink = await screen.findByRole('link', { name: /Instagram'ı Bağla/i });

        expect(getOverview).not.toHaveBeenCalled();
        expect(getReels).not.toHaveBeenCalled();
        expect(getPosts).not.toHaveBeenCalled();
        expect(getStatus).toHaveBeenCalledWith('company-1', '/client/instagram');
        expect(connectLink).toHaveAttribute('href', '/client/instagram');
    });
});
