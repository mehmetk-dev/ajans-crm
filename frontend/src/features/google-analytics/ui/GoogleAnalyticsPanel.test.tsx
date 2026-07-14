import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { integrationSnapshotApi } from '../../integration-snapshots/api/integrationSnapshotApi';
import type { ClientIntegrationSnapshotOverviewResponse } from '../../integration-snapshots/integrationSnapshot.types';
import { googleAnalyticsApi } from '../api/googleAnalyticsApi';
import type { GaOverviewResponse } from '../googleAnalytics.types';
import GoogleAnalyticsPanel from './GoogleAnalyticsPanel';

const ga: GaOverviewResponse = {
    connected: true,
    propertyId: 'prop-1',
    errorMessage: null,
    sessions: 100,
    totalUsers: 80,
    newUsers: 20,
    pageViews: 200,
    bounceRate: 40,
    avgSessionDuration: 120,
    dailyTrend: [],
    trafficSources: [],
    topPages: [],
    topCountries: [],
};

describe('GoogleAnalyticsPanel', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it('renders the default persisted snapshot without a live overview request', async () => {
        vi.spyOn(googleAnalyticsApi, 'getStatus').mockResolvedValue({
            connected: true,
            propertyId: 'prop-1',
            authUrl: '',
        });
        const liveOverview = vi.spyOn(googleAnalyticsApi, 'getOverview').mockResolvedValue(ga);
        const snapshotOverview = vi.spyOn(integrationSnapshotApi, 'getOverview').mockResolvedValue({
            ga,
            gaSnapshot: {
                status: 'READY',
                lastSyncedAt: '2026-07-14T09:00:00Z',
                nextSyncAt: '2026-07-14T15:00:00Z',
                stale: false,
                errorMessage: null,
            },
        } as ClientIntegrationSnapshotOverviewResponse);
        const queryClient = new QueryClient({
            defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
        });

        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <GoogleAnalyticsPanel companyId="company-1" />
                </MemoryRouter>
            </QueryClientProvider>,
        );

        await waitFor(() => expect(screen.getByText('200')).toBeInTheDocument());

        expect(snapshotOverview).toHaveBeenCalledWith('company-1');
        expect(liveOverview).not.toHaveBeenCalled();
        expect(screen.getByText(/Son güncelleme:/)).toBeInTheDocument();
    });
});
