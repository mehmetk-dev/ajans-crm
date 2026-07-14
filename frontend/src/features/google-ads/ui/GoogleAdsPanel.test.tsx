import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { integrationSnapshotApi } from '../../integration-snapshots/api/integrationSnapshotApi';
import type { ClientIntegrationSnapshotOverviewResponse } from '../../integration-snapshots/integrationSnapshot.types';
import { googleAdsApi } from '../api/googleAdsApi';
import type { GoogleAdsOverviewResponse } from '../googleAds.types';
import GoogleAdsPanel from './GoogleAdsPanel';

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
    campaigns: [],
    dailyTrend: [],
};

describe('GoogleAdsPanel', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it('renders the persisted Ads snapshot without issuing duplicate status or live overview requests', async () => {
        const status = {
            connected: true,
            hasAdsScope: true,
            needsReconnect: false,
            customerId: '1234567890',
            authUrl: '',
        };
        const getStatus = vi.spyOn(googleAdsApi, 'getStatus').mockResolvedValue(status);
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
                <MemoryRouter>
                    <GoogleAdsPanel companyId="company-1" initialStatus={status} />
                </MemoryRouter>
            </QueryClientProvider>,
        );

        await waitFor(() => expect(screen.getByText(/125,50/)).toBeInTheDocument());

        expect(snapshotOverview).toHaveBeenCalledWith('company-1');
        expect(getStatus).not.toHaveBeenCalled();
        expect(liveOverview).not.toHaveBeenCalled();
        expect(screen.getByText(/Son güncelleme:/)).toBeInTheDocument();

        fireEvent.click(screen.getByTitle("Google Ads snapshot'ını yenile"));
        await waitFor(() => expect(refreshSnapshot).toHaveBeenCalledWith('company-1'));
    });
});
