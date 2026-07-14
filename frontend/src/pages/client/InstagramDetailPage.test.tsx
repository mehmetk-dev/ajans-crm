import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../store/AuthContext', () => ({
    useAuth: () => ({
        user: {
            id: 'user-1',
            email: 'user@test.com',
            fullName: 'Test User',
            globalRole: 'COMPANY_USER',
            membershipRole: null,
            avatarUrl: null,
            companyId: 'company-1',
        },
        isLoading: false,
        login: vi.fn(),
        logout: vi.fn(),
    }),
}));

import {
    integrationSnapshotApi,
    type ClientIntegrationSnapshotOverviewResponse,
} from '../../features/integration-snapshots';
import { igApi } from '../../features/instagram';
import type { IgOverviewResponse } from '../../features/instagram/instagram.types';
import InstagramDetailPage from './InstagramDetailPage';

const overview: IgOverviewResponse = {
    connected: true,
    username: 'fogistanbul',
    errorMessage: null,
    warningMessage: null,
    periodStart: '2026-06-15',
    periodEnd: '2026-07-14',
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
};

function snapshotWith(ig: IgOverviewResponse): ClientIntegrationSnapshotOverviewResponse {
    return {
        ig,
        igSnapshot: {
            status: 'READY',
            lastSyncedAt: '2026-07-14T09:00:00Z',
            nextSyncAt: '2026-07-14T10:00:00Z',
            stale: false,
            errorMessage: null,
        },
    } as ClientIntegrationSnapshotOverviewResponse;
}

function renderPage() {
    return render(
        <MemoryRouter initialEntries={['/client/instagram']}>
            <InstagramDetailPage />
        </MemoryRouter>,
    );
}

describe('InstagramDetailPage', () => {
    beforeEach(() => {
        vi.spyOn(igApi, 'getStatus').mockResolvedValue({
            configured: true,
            connected: true,
            authUrl: '',
            username: 'fogistanbul',
            igUserId: 'ig-1',
        });
        vi.spyOn(igApi, 'getReels').mockResolvedValue([]);
        vi.spyOn(igApi, 'getPosts').mockResolvedValue([]);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('loads the default one-month overview from the persisted snapshot', async () => {
        const liveOverview = vi.spyOn(igApi, 'getOverview').mockResolvedValue(overview);
        const snapshotOverview = vi.spyOn(integrationSnapshotApi, 'getOverview')
            .mockResolvedValue(snapshotWith(overview));

        renderPage();

        await waitFor(() => expect(snapshotOverview).toHaveBeenCalledWith('company-1'));

        expect(liveOverview).not.toHaveBeenCalled();
        expect(await screen.findByText('1.2K')).toBeInTheDocument();
        expect(screen.getByText(/Son güncelleme:/)).toBeInTheDocument();
    });

    it('uses the live overview endpoint after selecting the one-week preset', async () => {
        const liveOverview = vi.spyOn(igApi, 'getOverview').mockResolvedValue(overview);
        vi.spyOn(integrationSnapshotApi, 'getOverview').mockResolvedValue(snapshotWith(overview));

        renderPage();
        await screen.findByText('1.2K');

        fireEvent.click(screen.getByRole('button', { name: /Son 1 Ay/ }));
        fireEvent.click(screen.getByRole('button', { name: 'Son 1 Hafta' }));

        await waitFor(() => {
            expect(liveOverview).toHaveBeenLastCalledWith('company-1', '7daysAgo', 'today');
        });
    });

    it('forces only the Instagram overview snapshot from the default view', async () => {
        vi.spyOn(igApi, 'getOverview').mockResolvedValue(overview);
        vi.spyOn(integrationSnapshotApi, 'getOverview').mockResolvedValue(snapshotWith(overview));
        const refreshSnapshot = vi.spyOn(integrationSnapshotApi, 'refreshInstagram')
            .mockResolvedValue(undefined);

        renderPage();
        await screen.findByText('1.2K');

        fireEvent.click(screen.getByTitle("Instagram snapshot'ını yenile"));

        await waitFor(() => expect(refreshSnapshot).toHaveBeenCalledWith('company-1'));
    });
});
