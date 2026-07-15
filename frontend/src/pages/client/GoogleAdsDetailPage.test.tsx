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

    it('shows the stored Ads snapshot failure reason instead of a generic connection error', async () => {
        vi.spyOn(googleAdsApi, 'getStatus').mockResolvedValue({
            connected: true,
            hasAdsScope: true,
            needsReconnect: false,
            customerId: '1234567890',
            authUrl: '',
        });
        vi.spyOn(integrationSnapshotApi, 'getOverview').mockResolvedValue({
            ads: {
                ...ads,
                connected: false,
                hasAdsScope: false,
                customerId: null,
                errorMessage: null,
                totalSpend: 0,
                impressions: 0,
                clicks: 0,
                conversions: 0,
                ctr: 0,
                cpc: 0,
                conversionRate: 0,
                campaigns: [],
                dailyTrend: [],
            },
            adsSnapshot: {
                status: 'FAILED',
                lastSyncedAt: null,
                nextSyncAt: '2026-07-14T15:00:00Z',
                stale: true,
                errorMessage: 'Google Ads yönetici hesabının bu müşteri hesabına erişimi yok.',
            },
        } as unknown as ClientIntegrationSnapshotOverviewResponse);
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

        expect(await screen.findByText(
            'Google Ads yönetici hesabının bu müşteri hesabına erişimi yok.',
        )).toBeInTheDocument();
        expect(screen.queryByText(
            'Google Ads snapshot oluşturulamadı. Bağlantıyı kontrol edip tekrar deneyin.',
        )).not.toBeInTheDocument();
    });

    it('selects an Ads account using the exact discovered access path', async () => {
        vi.spyOn(googleAdsApi, 'getStatus').mockResolvedValue({
            connected: true,
            hasAdsScope: true,
            needsReconnect: false,
            customerId: '',
            authUrl: '',
        });
        vi.spyOn(integrationSnapshotApi, 'getOverview').mockResolvedValue({
            ads: { ...ads, connected: false, customerId: null },
            adsSnapshot: null,
        } as unknown as ClientIntegrationSnapshotOverviewResponse);
        vi.spyOn(googleAdsApi, 'getAccounts').mockResolvedValue({
            accounts: [{
                customerId: '2994497086',
                descriptiveName: 'Managed Co',
                loginCustomerId: '8437875152',
                accessType: 'MANAGER',
                managerName: 'Agency MCC',
                status: 'ENABLED',
            }],
            warnings: [],
        });
        const selectAccount = vi.spyOn(googleAdsApi, 'selectAccount').mockResolvedValue(undefined);
        vi.spyOn(integrationSnapshotApi, 'refreshGoogleAds').mockResolvedValue(undefined);
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

        fireEvent.click(await screen.findByRole('button', { name: /Managed Co/ }));
        fireEvent.click(screen.getByRole('button', { name: 'Bu hesabı kullan' }));

        await waitFor(() => expect(selectAccount).toHaveBeenCalledWith('company-1', {
            customerId: '2994497086',
            loginCustomerId: '8437875152',
        }));
    });
});
