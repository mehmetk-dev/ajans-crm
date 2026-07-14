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

import type { ScOverviewResponse, ScStatusResponse } from '../searchConsole.types';
import { searchConsoleApi } from '../api/searchConsoleApi';
import { integrationSnapshotApi } from '../../integration-snapshots/api/integrationSnapshotApi';
import type { ClientIntegrationSnapshotOverviewResponse } from '../../integration-snapshots/integrationSnapshot.types';
import { useSCDetailPage } from './useSCDetailPage';

function snapshotWith(sc: ScOverviewResponse): ClientIntegrationSnapshotOverviewResponse {
    return {
        sc,
        scSnapshot: {
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

describe('useSCDetailPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        window.history.replaceState({}, '', '/client/search-console');
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('loads the default 30-day report from the persisted snapshot', async () => {
        const status: ScStatusResponse = {
            connected: true,
            siteUrl: 'https://example.com',
            hasScScope: true,
            needsReconnect: false,
            authUrl: '',
        };
        const overview: ScOverviewResponse = {
            connected: true,
            siteUrl: 'https://example.com',
            errorMessage: null,
            totalClicks: 50,
            totalImpressions: 1000,
            avgCtr: 0.05,
            avgPosition: 8.5,
            dailyTrend: [],
            topQueries: [],
            topPages: [],
            devices: [{ name: 'DESKTOP', clicks: 30, impressions: 600 }],
            countries: [{ name: 'TR', clicks: 40, impressions: 800 }],
        };
        vi.spyOn(searchConsoleApi, 'getStatus').mockResolvedValue(status);
        const liveOverview = vi.spyOn(searchConsoleApi, 'getOverview').mockResolvedValue(overview);
        const snapshotOverview = vi.spyOn(integrationSnapshotApi, 'getOverview')
            .mockResolvedValue(snapshotWith(overview));

        const { result } = renderHook(() => useSCDetailPage(), { wrapper: makeWrapper() });

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.status).toEqual(status);
        expect(result.current.data).toEqual(overview);
        expect(result.current.error).toBeNull();
        expect(snapshotOverview).toHaveBeenCalledWith('company-1');
        expect(liveOverview).not.toHaveBeenCalled();
    });

    it('skips overview fetch when status.connected is false', async () => {
        const status: ScStatusResponse = {
            connected: false,
            siteUrl: '',
            hasScScope: false,
            needsReconnect: false,
            authUrl: 'https://oauth',
        };
        const getStatus = vi.spyOn(searchConsoleApi, 'getStatus').mockResolvedValue(status);
        const getOverview = vi.spyOn(searchConsoleApi, 'getOverview').mockResolvedValue({} as ScOverviewResponse);

        const { result } = renderHook(() => useSCDetailPage(), { wrapper: makeWrapper() });

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(getStatus).toHaveBeenCalledWith('company-1');
        expect(getOverview).not.toHaveBeenCalled();
        expect(result.current.data).toBeNull();
    });

    it('skips overview fetch when status.connected is true but siteUrl is empty', async () => {
        const status: ScStatusResponse = {
            connected: true,
            siteUrl: '',
            hasScScope: true,
            needsReconnect: true,
            authUrl: '',
        };
        const getStatus = vi.spyOn(searchConsoleApi, 'getStatus').mockResolvedValue(status);
        const getOverview = vi.spyOn(searchConsoleApi, 'getOverview').mockResolvedValue({} as ScOverviewResponse);

        const { result } = renderHook(() => useSCDetailPage(), { wrapper: makeWrapper() });

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(getStatus).toHaveBeenCalled();
        expect(getOverview).not.toHaveBeenCalled();
    });

    it('captures the API error message on failure', async () => {
        const error = {
            response: { data: { message: 'SC izni yok' } },
        };
        vi.spyOn(searchConsoleApi, 'getStatus').mockRejectedValue(error);
        vi.spyOn(searchConsoleApi, 'getOverview').mockRejectedValue(error);

        const { result } = renderHook(() => useSCDetailPage(), { wrapper: makeWrapper() });

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.error).toBe('SC izni yok');
    });

    it('falls back to a default error message when the response has no message', async () => {
        vi.spyOn(searchConsoleApi, 'getStatus').mockRejectedValue(new Error('boom'));
        vi.spyOn(searchConsoleApi, 'getOverview').mockRejectedValue(new Error('boom'));

        const { result } = renderHook(() => useSCDetailPage(), { wrapper: makeWrapper() });

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.error).toBe('Search Console verileri yüklenirken hata oluştu');
    });

    it('exposes date preset and custom range controls', async () => {
        vi.spyOn(searchConsoleApi, 'getStatus').mockResolvedValue({
            connected: false,
            siteUrl: '',
            hasScScope: false,
            needsReconnect: false,
            authUrl: '',
        });
        vi.spyOn(searchConsoleApi, 'getOverview').mockResolvedValue({} as ScOverviewResponse);

        const { result } = renderHook(() => useSCDetailPage(), { wrapper: makeWrapper() });

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.activePreset).toBe(2);
        expect(result.current.currentRange).toBeDefined();

        act(() => result.current.setActivePreset(0));
        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(result.current.activePreset).toBe(0);
        expect(result.current.showDateMenu).toBe(false);

        act(() => result.current.setShowDateMenu(true));
        expect(result.current.showDateMenu).toBe(true);

        act(() => result.current.setCustomStart('2026-01-01'));
        act(() => result.current.setCustomEnd('2026-01-31'));
        act(() => result.current.setIsCustomRange(true));
        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(result.current.isCustomRange).toBe(true);
        expect(result.current.customStart).toBe('2026-01-01');
        expect(result.current.customEnd).toBe('2026-01-31');
        expect(result.current.currentRange.desc).toBe('2026-01-01 — 2026-01-31');
    });

    it('clickThroughRate defaults to 0 when no data', async () => {
        vi.spyOn(searchConsoleApi, 'getStatus').mockResolvedValue({
            connected: false,
            siteUrl: '',
            hasScScope: false,
            needsReconnect: false,
            authUrl: '',
        });
        vi.spyOn(searchConsoleApi, 'getOverview').mockResolvedValue({} as ScOverviewResponse);

        const { result } = renderHook(() => useSCDetailPage(), { wrapper: makeWrapper() });

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.clickThroughRate).toBe('0');
    });

    it('cleans the OAuth callback URL without loading the report twice', async () => {
        window.history.replaceState({}, '', '/client/search-console?connected=true');
        const getStatus = vi.spyOn(searchConsoleApi, 'getStatus').mockResolvedValue({
            connected: false,
            siteUrl: '',
            hasScScope: false,
            needsReconnect: false,
            authUrl: '',
        });

        const { result } = renderHook(() => useSCDetailPage(), { wrapper: makeWrapper() });

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(getStatus).toHaveBeenCalledTimes(1);
        expect(window.location.search).toBe('');
    });

    it('does not reload while editing a custom range before apply', async () => {
        const status: ScStatusResponse = {
            connected: true,
            siteUrl: 'sc-domain:example.com',
            hasScScope: true,
            needsReconnect: false,
            authUrl: '',
        };
        const overview: ScOverviewResponse = {
            connected: true,
            siteUrl: 'sc-domain:example.com',
            errorMessage: null,
            totalClicks: 1,
            totalImpressions: 10,
            avgCtr: 10,
            avgPosition: 4,
            dailyTrend: [],
            topQueries: [],
            topPages: [],
            devices: [],
            countries: [],
        };
        vi.spyOn(searchConsoleApi, 'getStatus').mockResolvedValue(status);
        vi.spyOn(integrationSnapshotApi, 'getOverview').mockResolvedValue(snapshotWith(overview));
        const getOverview = vi.spyOn(searchConsoleApi, 'getOverview').mockResolvedValue(overview);

        const { result } = renderHook(() => useSCDetailPage(), { wrapper: makeWrapper() });
        await waitFor(() => expect(result.current.data).toEqual(overview));

        act(() => {
            result.current.setCustomStart('2026-06-01');
            result.current.setCustomEnd('2026-06-30');
        });
        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 25));
        });

        expect(getOverview).not.toHaveBeenCalled();

        act(() => result.current.setIsCustomRange(true));
        await waitFor(() => {
            expect(getOverview).toHaveBeenLastCalledWith(
                'company-1',
                '2026-06-01',
                '2026-06-30',
            );
        });
    });

    it('keeps the newest date-range response when an older request finishes later', async () => {
        const status: ScStatusResponse = {
            connected: true,
            siteUrl: 'sc-domain:example.com',
            hasScScope: true,
            needsReconnect: false,
            authUrl: '',
        };
        const response = (totalClicks: number): ScOverviewResponse => ({
            connected: true,
            siteUrl: 'sc-domain:example.com',
            errorMessage: null,
            totalClicks,
            totalImpressions: 100,
            avgCtr: totalClicks,
            avgPosition: 5,
            dailyTrend: [],
            topQueries: [],
            topPages: [],
            devices: [],
            countries: [],
        });
        let resolveOlder!: (value: ScOverviewResponse) => void;
        let resolveNewest!: (value: ScOverviewResponse) => void;
        const older = new Promise<ScOverviewResponse>(resolve => { resolveOlder = resolve; });
        const newest = new Promise<ScOverviewResponse>(resolve => { resolveNewest = resolve; });

        vi.spyOn(searchConsoleApi, 'getStatus').mockResolvedValue(status);
        vi.spyOn(integrationSnapshotApi, 'getOverview').mockResolvedValue(snapshotWith(response(1)));
        const getOverview = vi.spyOn(searchConsoleApi, 'getOverview')
            .mockReturnValueOnce(older)
            .mockReturnValueOnce(newest);

        const { result } = renderHook(() => useSCDetailPage(), { wrapper: makeWrapper() });
        await waitFor(() => expect(result.current.data?.totalClicks).toBe(1));

        act(() => result.current.setActivePreset(0));
        await waitFor(() => expect(getOverview).toHaveBeenCalledTimes(1));
        act(() => result.current.setActivePreset(1));
        await waitFor(() => expect(getOverview).toHaveBeenCalledTimes(2));

        await act(async () => resolveNewest(response(200)));
        await waitFor(() => expect(result.current.data?.totalClicks).toBe(200));
        await act(async () => resolveOlder(response(100)));

        expect(result.current.data?.totalClicks).toBe(200);
    });

    it('surfaces an OAuth callback error without starting an overview request', async () => {
        window.history.replaceState(
            {},
            '',
            '/client/search-console?oauthError=Google+izni+reddedildi',
        );
        const getStatus = vi.spyOn(searchConsoleApi, 'getStatus').mockResolvedValue({
            connected: false,
            siteUrl: '',
            hasScScope: false,
            needsReconnect: false,
            authUrl: 'https://google.example/oauth',
        });
        const getOverview = vi.spyOn(searchConsoleApi, 'getOverview');

        const { result } = renderHook(() => useSCDetailPage(), { wrapper: makeWrapper() });

        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(result.current.error).toBe('Google izni reddedildi');
        expect(getStatus).toHaveBeenCalledTimes(1);
        expect(getOverview).not.toHaveBeenCalled();
        expect(window.location.search).toBe('');
    });

    it('surfaces site-save failures', async () => {
        vi.spyOn(searchConsoleApi, 'getStatus').mockResolvedValue({
            connected: false,
            siteUrl: '',
            hasScScope: false,
            needsReconnect: false,
            authUrl: '',
        });
        vi.spyOn(searchConsoleApi, 'saveSiteUrl').mockRejectedValue({
            response: { data: { message: 'Site kaydedilemedi' } },
        });

        const { result } = renderHook(() => useSCDetailPage(), { wrapper: makeWrapper() });
        await waitFor(() => expect(result.current.loading).toBe(false));
        await act(async () => result.current.saveSiteUrl('sc-domain:example.com'));

        expect(result.current.error).toBe('Site kaydedilemedi');
    });
});
