import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor, act } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../../store/AuthContext', () => ({
    useAuth: () => ({
        user: {
            id: 'user-1',
            email: 'user@test.com',
            fullName: 'Test User',
            globalRole: 'AGENCY_STAFF',
            membershipRole: null,
            avatarUrl: null,
            companyId: 'company-1',
        },
        isLoading: false,
        login: vi.fn(),
        logout: vi.fn(),
    }),
}));

import type { GaOverviewResponse, GaStatusResponse } from '../googleAnalytics.types';
import { googleAnalyticsApi } from '../api/googleAnalyticsApi';
import { integrationSnapshotApi } from '../../integration-snapshots/api/integrationSnapshotApi';
import type { ClientIntegrationSnapshotOverviewResponse } from '../../integration-snapshots/integrationSnapshot.types';
import { useGADetailPage } from './useGADetailPage';

function snapshotWith(ga: GaOverviewResponse): ClientIntegrationSnapshotOverviewResponse {
    return {
        ga,
        gaSnapshot: {
            status: 'READY',
            lastSyncedAt: '2026-07-14T09:00:00Z',
            nextSyncAt: '2026-07-14T15:00:00Z',
            stale: false,
            errorMessage: null,
        },
    } as ClientIntegrationSnapshotOverviewResponse;
}

function makeWrapper() {
    const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    return ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
}

describe('useGADetailPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        window.history.replaceState({}, '', '/');
        vi.restoreAllMocks();
    });

    it('loads the default 30-day report from the persisted snapshot', async () => {
        const status: GaStatusResponse = {
            connected: true,
            propertyId: 'prop-1',
            authUrl: '',
        };
        const overview: GaOverviewResponse = {
            connected: true,
            propertyId: 'prop-1',
            errorMessage: null,
            sessions: 100,
            totalUsers: 80,
            newUsers: 20,
            pageViews: 200,
            bounceRate: 0.4,
            avgSessionDuration: 120,
            dailyTrend: [],
            trafficSources: [{ name: 'Organic', value: 50 }, { name: 'Direct', value: 30 }],
            topPages: [{ name: '/home', value: 100 }, { name: '/about', value: 50 }],
            topCountries: [{ name: 'TR', value: 60 }, { name: 'US', value: 40 }],
        };
        vi.spyOn(googleAnalyticsApi, 'getStatus').mockResolvedValue(status);
        const liveOverview = vi.spyOn(googleAnalyticsApi, 'getOverview').mockResolvedValue(overview);
        const snapshotOverview = vi.spyOn(integrationSnapshotApi, 'getOverview')
            .mockResolvedValue(snapshotWith(overview));

        const { result } = renderHook(() => useGADetailPage(), { wrapper: makeWrapper() });

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.status).toEqual(status);
        expect(result.current.data).toEqual(overview);
        expect(result.current.totalSources).toBe(80);
        expect(result.current.totalPages).toBe(150);
        expect(result.current.maxPageViews).toBe(100);
        expect(result.current.error).toBeNull();
        expect(result.current.snapshotMeta).toEqual(snapshotWith(overview).gaSnapshot);
        expect(snapshotOverview).toHaveBeenCalledWith('company-1');
        expect(liveOverview).not.toHaveBeenCalled();
    });

    it('uses the live overview endpoint for a non-default date preset', async () => {
        const status: GaStatusResponse = {
            connected: true,
            propertyId: 'prop-1',
            authUrl: '',
        };
        const overview: GaOverviewResponse = {
            connected: true,
            propertyId: 'prop-1',
            errorMessage: null,
            sessions: 7,
            totalUsers: 6,
            newUsers: 2,
            pageViews: 12,
            bounceRate: 20,
            avgSessionDuration: 30,
            dailyTrend: [],
            trafficSources: [],
            topPages: [],
            topCountries: [],
        };
        vi.spyOn(googleAnalyticsApi, 'getStatus').mockResolvedValue(status);
        vi.spyOn(integrationSnapshotApi, 'getOverview').mockResolvedValue(snapshotWith(overview));
        const liveOverview = vi.spyOn(googleAnalyticsApi, 'getOverview').mockResolvedValue(overview);

        const { result } = renderHook(() => useGADetailPage(), { wrapper: makeWrapper() });
        await waitFor(() => expect(result.current.loading).toBe(false));

        act(() => result.current.setActivePreset(0));

        await waitFor(() => {
            expect(liveOverview).toHaveBeenLastCalledWith('company-1', '7daysAgo', 'today');
        });
        expect(result.current.snapshotMeta).toBeNull();
    });

    it('forces only the Google Analytics snapshot when refreshing the default range', async () => {
        const status: GaStatusResponse = {
            connected: true,
            propertyId: 'prop-1',
            authUrl: '',
        };
        const overview: GaOverviewResponse = {
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
        vi.spyOn(googleAnalyticsApi, 'getStatus').mockResolvedValue(status);
        vi.spyOn(integrationSnapshotApi, 'getOverview').mockResolvedValue(snapshotWith(overview));
        const refreshSnapshot = vi.spyOn(integrationSnapshotApi, 'refreshGoogleAnalytics')
            .mockResolvedValue(undefined);

        const { result } = renderHook(() => useGADetailPage(), { wrapper: makeWrapper() });
        await waitFor(() => expect(result.current.loading).toBe(false));

        await act(async () => {
            await result.current.refresh();
        });

        await waitFor(() => expect(refreshSnapshot).toHaveBeenCalledWith('company-1'));
    });

    it('skips overview fetch when status.connected is false', async () => {
        const status: GaStatusResponse = {
            connected: false,
            propertyId: '',
            authUrl: 'https://oauth',
        };
        const getStatus = vi.spyOn(googleAnalyticsApi, 'getStatus').mockResolvedValue(status);
        const getOverview = vi.spyOn(googleAnalyticsApi, 'getOverview').mockResolvedValue({} as GaOverviewResponse);

        const { result } = renderHook(() => useGADetailPage(), { wrapper: makeWrapper() });

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(getStatus).toHaveBeenCalledWith('company-1');
        expect(getOverview).not.toHaveBeenCalled();
        expect(result.current.data).toBeNull();
    });

    it('clears the OAuth callback flag without duplicating the initial load', async () => {
        window.history.pushState({}, '', '/client/google-analytics?connected=true');
        const replaceState = vi.spyOn(window.history, 'replaceState');
        const status: GaStatusResponse = {
            connected: true,
            propertyId: 'prop-1',
            authUrl: '',
        };
        const overview: GaOverviewResponse = {
            connected: true,
            propertyId: 'prop-1',
            errorMessage: null,
            sessions: 100,
            totalUsers: 80,
            newUsers: 20,
            pageViews: 200,
            bounceRate: 0.4,
            avgSessionDuration: 120,
            dailyTrend: [],
            trafficSources: [],
            topPages: [],
            topCountries: [],
        };
        const getStatus = vi.spyOn(googleAnalyticsApi, 'getStatus').mockResolvedValue(status);
        const getOverview = vi.spyOn(googleAnalyticsApi, 'getOverview').mockResolvedValue(overview);
        vi.spyOn(integrationSnapshotApi, 'getOverview').mockResolvedValue(snapshotWith(overview));

        const { result } = renderHook(() => useGADetailPage(), { wrapper: makeWrapper() });

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(replaceState).toHaveBeenCalledWith({}, '', '/client/google-analytics');
        expect(getStatus).toHaveBeenCalledTimes(1);
        expect(getOverview).not.toHaveBeenCalled();
        expect(result.current.data).toEqual(overview);
    });

    it('captures the API error message on failure', async () => {
        const error = {
            response: { data: { message: 'GA bağlantısı yok' } },
        };
        vi.spyOn(googleAnalyticsApi, 'getStatus').mockRejectedValue(error);
        vi.spyOn(googleAnalyticsApi, 'getOverview').mockRejectedValue(error);

        const { result } = renderHook(() => useGADetailPage(), { wrapper: makeWrapper() });

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.error).toBe('GA bağlantısı yok');
    });

    it('falls back to a default error message when the response has no message', async () => {
        vi.spyOn(googleAnalyticsApi, 'getStatus').mockRejectedValue(new Error('boom'));
        vi.spyOn(googleAnalyticsApi, 'getOverview').mockRejectedValue(new Error('boom'));

        const { result } = renderHook(() => useGADetailPage(), { wrapper: makeWrapper() });

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.error).toBe('Google Analytics verileri yüklenirken hata oluştu');
    });

    it('exposes date preset and custom range controls', async () => {
        vi.spyOn(googleAnalyticsApi, 'getStatus').mockResolvedValue({
            connected: false,
            propertyId: '',
            authUrl: '',
        });
        vi.spyOn(googleAnalyticsApi, 'getOverview').mockResolvedValue({} as GaOverviewResponse);

        const { result } = renderHook(() => useGADetailPage(), { wrapper: makeWrapper() });

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.activePreset).toBe(2);
        expect(result.current.currentRange).toBeDefined();

        await act(async () => result.current.setActivePreset(0));
        expect(result.current.activePreset).toBe(0);
        expect(result.current.showDateMenu).toBe(false);

        await act(async () => result.current.setShowDateMenu(true));
        expect(result.current.showDateMenu).toBe(true);

        await act(async () => result.current.setIsCustomRange(true));
        expect(result.current.isCustomRange).toBe(true);

        await act(async () => result.current.setCustomStart('2026-01-01'));
        await act(async () => result.current.setCustomEnd('2026-01-31'));
        expect(result.current.customStart).toBe('2026-01-01');
        expect(result.current.customEnd).toBe('2026-01-31');
        expect(result.current.currentRange.desc).toBe('2026-01-01 — 2026-01-31');
    });

    it('engagementRate and sessionsPerUser default to 0 when no data', async () => {
        vi.spyOn(googleAnalyticsApi, 'getStatus').mockResolvedValue({
            connected: false,
            propertyId: '',
            authUrl: '',
        });
        vi.spyOn(googleAnalyticsApi, 'getOverview').mockResolvedValue({} as GaOverviewResponse);

        const { result } = renderHook(() => useGADetailPage(), { wrapper: makeWrapper() });

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.engagementRate).toBe('0');
        expect(result.current.sessionsPerUser).toBe('0');
    });
});
