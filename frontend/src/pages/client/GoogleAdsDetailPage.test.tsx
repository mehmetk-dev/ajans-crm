import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { googleAdsApi, type GoogleAdsOverviewResponse } from '../../features/google-ads';
import {
    integrationSnapshotApi,
    type ClientIntegrationSnapshotOverviewResponse,
} from '../../features/integration-snapshots';
import GoogleAdsDetailPage from './GoogleAdsDetailPage';

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

const ads: GoogleAdsOverviewResponse = {
    connected: true,
    hasAdsScope: true,
    customerId: '1234567890',
    currencyCode: 'TRY',
    errorMessage: null,
    totalSpend: 125.5,
    impressions: 1000,
    clicks: 75,
    conversions: 8,
    ctr: 7.5,
    cpc: 1.67,
    conversionRate: 10.67,
    campaigns: [{
        campaignId: 'campaign-1',
        campaignName: 'Brand Search',
        status: 'ENABLED',
        spend: 125.5,
        impressions: 1000,
        clicks: 75,
        conversions: 8,
        ctr: 7.5,
        cpc: 1.67,
    }],
    dailyTrend: [],
};

describe('GoogleAdsDetailPage', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it('loads the default report from the stored Ads snapshot instead of the live provider endpoint', async () => {
        vi.spyOn(googleAdsApi, 'getStatus').mockResolvedValue({
            connected: true,
            hasAdsScope: true,
            needsReconnect: false,
            customerId: '1234567890',
            authUrl: '',
        });
        const liveOverview = vi.spyOn(googleAdsApi, 'getOverview').mockResolvedValue(ads);
        const snapshotOverview = vi.spyOn(integrationSnapshotApi, 'getOverview').mockResolvedValue({
            ads,
            adsSnapshot: {
                status: 'READY',
                lastSyncedAt: '2026-07-14T09:00:00Z',
                nextSyncAt: '2026-07-14T15:00:00Z',
                stale: false,
                errorMessage: null,
            },
        } as ClientIntegrationSnapshotOverviewResponse);
        const refreshSnapshot = vi.spyOn(integrationSnapshotApi, 'refreshGoogleAds')
            .mockResolvedValue(undefined);
        const queryClient = new QueryClient({
            defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
        });

        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter initialEntries={['/client/google-ads']}>
                    <GoogleAdsDetailPage />
                </MemoryRouter>
            </QueryClientProvider>,
        );

        await waitFor(() => expect(screen.getByText('Brand Search')).toBeInTheDocument());

        expect(snapshotOverview).toHaveBeenCalledWith('company-1');
        expect(liveOverview).not.toHaveBeenCalled();
        expect(screen.getByText(/Son güncelleme:/)).toBeInTheDocument();

        fireEvent.click(screen.getByTitle("Google Ads snapshot'ını yenile"));
        await waitFor(() => expect(refreshSnapshot).toHaveBeenCalledWith('company-1'));
    });
});
