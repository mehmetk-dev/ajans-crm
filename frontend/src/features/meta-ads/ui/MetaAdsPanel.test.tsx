import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { integrationSnapshotApi } from '../../integration-snapshots/api/integrationSnapshotApi';
import type { ClientIntegrationSnapshotOverviewResponse } from '../../integration-snapshots/integrationSnapshot.types';
import { metaAdsApi } from '../api/metaAdsApi';
import type { MetaAdsOverviewResponse, MetaAdsStatusResponse } from '../metaAds.types';
import MetaAdsPanel from './MetaAdsPanel';

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
    campaigns: [],
    dailyTrend: [],
};

const status: MetaAdsStatusResponse = {
    connected: true,
    adAccountId: 'act_123456789',
    authUrl: 'https://meta.example/oauth',
};

describe('MetaAdsPanel', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it('renders the persisted Meta Ads snapshot without duplicate status or live overview requests', async () => {
        const getStatus = vi.spyOn(metaAdsApi, 'getStatus').mockResolvedValue(status);
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
        } as ClientIntegrationSnapshotOverviewResponse);
        const refreshMetaAds = vi.fn().mockResolvedValue(undefined);
        Object.assign(integrationSnapshotApi, { refreshMetaAds });

        const queryClient = new QueryClient({
            defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
        });
        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <MetaAdsPanel companyId="company-1" initialStatus={status} />
                </MemoryRouter>
            </QueryClientProvider>,
        );

        await waitFor(() => expect(screen.getByText(/245,75/)).toBeInTheDocument());

        expect(getStatus).not.toHaveBeenCalled();
        expect(liveOverview).not.toHaveBeenCalled();
        expect(screen.getByText(/Son güncelleme:/)).toBeInTheDocument();

        fireEvent.click(screen.getByTitle("Meta Ads snapshot'ını yenile"));
        await waitFor(() => expect(refreshMetaAds).toHaveBeenCalledWith('company-1'));
    });

    it('keeps the last successful metrics visible when the latest sync failed', async () => {
        vi.spyOn(integrationSnapshotApi, 'getOverview').mockResolvedValue({
            metaAds,
            metaAdsSnapshot: {
                status: 'FAILED',
                lastSyncedAt: '2026-07-14T09:00:00Z',
                nextSyncAt: '2026-07-14T15:00:00Z',
                stale: true,
                errorMessage: 'rate limited',
            },
        } as ClientIntegrationSnapshotOverviewResponse);
        const queryClient = new QueryClient({
            defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
        });

        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <MetaAdsPanel companyId="company-1" initialStatus={status} />
                </MemoryRouter>
            </QueryClientProvider>,
        );

        expect(await screen.findByText(/245,75/)).toBeInTheDocument();
        expect(screen.getByText('Son başarılı veri gösteriliyor')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Yeniden bağla' })).toHaveAttribute(
            'href',
            'https://meta.example/oauth',
        );
    });
});
