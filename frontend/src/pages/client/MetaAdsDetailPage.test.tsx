import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { metaAdsApi, type MetaAdsOverviewResponse } from '../../features/meta-ads';
import {
    integrationSnapshotApi,
    type ClientIntegrationSnapshotOverviewResponse,
} from '../../features/integration-snapshots';
import MetaAdsDetailPage from './MetaAdsDetailPage';

vi.mock('../../store/AuthContext', () => ({
    useAuth: () => ({
        user: { id: 'user-1', companyId: 'company-1', globalRole: 'COMPANY_USER' },
        isLoading: false,
    }),
}));

vi.mock('recharts', () => ({
    AreaChart: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
    Area: () => null,
    XAxis: () => null,
    YAxis: () => null,
    CartesianGrid: () => null,
    Tooltip: () => null,
    ResponsiveContainer: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
}));

const metaAds: MetaAdsOverviewResponse = {
    connected: true,
    adAccountId: 'act_123456789',
    adAccountName: 'Fog Meta Ads',
    errorMessage: null,
    totalSpend: 245.75,
    impressions: 8000,
    clicks: 310,
    reach: 6200,
    cpm: 30.72,
    cpc: 0.79,
    ctr: 3.88,
    campaigns: [{
        campaignId: 'campaign-1',
        campaignName: 'Meta Brand',
        status: 'ACTIVE',
        objective: 'OUTCOME_TRAFFIC',
        spend: 245.75,
        impressions: 8000,
        clicks: 310,
        reach: 6200,
        cpm: 30.72,
        cpc: 0.79,
        ctr: 3.88,
    }],
    dailyTrend: [],
};

describe('MetaAdsDetailPage', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it('loads the default report from the stored Meta Ads snapshot and forces a real snapshot refresh', async () => {
        vi.spyOn(metaAdsApi, 'getStatus').mockResolvedValue({
            connected: true,
            adAccountId: 'act_123456789',
            authUrl: '',
        });
        const liveOverview = vi.spyOn(metaAdsApi, 'getOverview').mockResolvedValue(metaAds);
        vi.spyOn(integrationSnapshotApi, 'getOverview').mockResolvedValue({
            metaAds,
            metaAdsSnapshot: {
                status: 'READY',
                lastSyncedAt: '2026-07-14T09:00:00Z',
                nextSyncAt: '2026-07-14T15:00:00Z',
                stale: false,
                errorMessage: null,
            },
        } as unknown as ClientIntegrationSnapshotOverviewResponse);
        const refreshMetaAds = vi.fn().mockResolvedValue(undefined);
        Object.assign(integrationSnapshotApi, { refreshMetaAds });
        const queryClient = new QueryClient({
            defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
        });

        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter initialEntries={['/client/meta-ads']}>
                    <MetaAdsDetailPage />
                </MemoryRouter>
            </QueryClientProvider>,
        );

        await waitFor(() => expect(screen.getByText('Meta Brand')).toBeInTheDocument());

        expect(liveOverview).not.toHaveBeenCalled();
        expect(metaAdsApi.getStatus).toHaveBeenCalledWith('company-1', '/client/meta-ads');
        expect(screen.getByText(/Son güncelleme:/)).toBeInTheDocument();

        fireEvent.click(screen.getByTitle("Meta Ads snapshot'ını yenile"));
        await waitFor(() => expect(refreshMetaAds).toHaveBeenCalledWith('company-1'));
    });

    it('shows an explicit empty-period message instead of zero KPI cards', async () => {
        vi.spyOn(metaAdsApi, 'getStatus').mockResolvedValue({
            connected: true,
            adAccountId: 'act_123456789',
            authUrl: '',
        });
        vi.spyOn(integrationSnapshotApi, 'getOverview').mockResolvedValue({
            metaAds: { ...metaAds, totalSpend: 0, impressions: 0, clicks: 0, reach: 0, campaigns: [] },
            metaAdsSnapshot: {
                status: 'READY',
                lastSyncedAt: '2026-07-14T09:00:00Z',
                nextSyncAt: '2026-07-14T15:00:00Z',
                stale: false,
                errorMessage: null,
            },
        } as unknown as ClientIntegrationSnapshotOverviewResponse);
        const queryClient = new QueryClient({
            defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
        });

        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter initialEntries={['/client/meta-ads']}>
                    <MetaAdsDetailPage />
                </MemoryRouter>
            </QueryClientProvider>,
        );

        expect(await screen.findByText('Bu dönemde reklam performansı yok')).toBeInTheDocument();
    });
});
