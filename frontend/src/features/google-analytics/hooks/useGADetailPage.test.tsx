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
import { useGADetailPage } from './useGADetailPage';

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
        vi.restoreAllMocks();
    });

    it('loads status and overview when connected', async () => {
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
        vi.spyOn(googleAnalyticsApi, 'getOverview').mockResolvedValue(overview);

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
