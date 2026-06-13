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
import { useSCDetailPage } from './useSCDetailPage';

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
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('loads status and overview when connected with a site url', async () => {
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
        vi.spyOn(searchConsoleApi, 'getOverview').mockResolvedValue(overview);

        const { result } = renderHook(() => useSCDetailPage(), { wrapper: makeWrapper() });

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.status).toEqual(status);
        expect(result.current.data).toEqual(overview);
        expect(result.current.error).toBeNull();
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
        expect(result.current.activePreset).toBe(0);
        expect(result.current.showDateMenu).toBe(false);

        act(() => result.current.setShowDateMenu(true));
        expect(result.current.showDateMenu).toBe(true);

        act(() => result.current.setIsCustomRange(true));
        expect(result.current.isCustomRange).toBe(true);

        act(() => result.current.setCustomStart('2026-01-01'));
        act(() => result.current.setCustomEnd('2026-01-31'));
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
});
