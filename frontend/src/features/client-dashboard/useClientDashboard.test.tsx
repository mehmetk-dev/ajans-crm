import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { integrationSnapshotApi } from '../integration-snapshots';
import { useRefreshDashboard } from './useClientDashboard';

vi.mock('../../store/AuthContext', () => ({
    useAuth: () => ({ user: { companyId: 'company-1' } }),
}));

function wrapper({ children }: { children: ReactNode }) {
    return (
        <QueryClientProvider client={new QueryClient()}>
            {children}
        </QueryClientProvider>
    );
}

describe('useRefreshDashboard', () => {
    beforeEach(() => {
        vi.spyOn(integrationSnapshotApi, 'refreshOverview').mockResolvedValue(undefined);
        vi.spyOn(integrationSnapshotApi, 'refreshGoogleAnalytics').mockResolvedValue(undefined);
        vi.spyOn(integrationSnapshotApi, 'refreshSearchConsole').mockResolvedValue(undefined);
        vi.spyOn(integrationSnapshotApi, 'refreshGoogleAds').mockResolvedValue(undefined);
        vi.spyOn(integrationSnapshotApi, 'refreshMetaAds').mockResolvedValue(undefined);
        vi.spyOn(integrationSnapshotApi, 'refreshInstagram').mockResolvedValue(undefined);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('refreshes only Instagram for the social tab', async () => {
        const { result } = renderHook(() => useRefreshDashboard(), { wrapper });

        await act(() => result.current.refreshTab('social'));

        expect(integrationSnapshotApi.refreshInstagram).toHaveBeenCalledWith('company-1');
        expect(integrationSnapshotApi.refreshOverview).not.toHaveBeenCalled();
        expect(integrationSnapshotApi.refreshGoogleAnalytics).not.toHaveBeenCalled();
        expect(integrationSnapshotApi.refreshGoogleAds).not.toHaveBeenCalled();
    });

    it('refreshes the two web integrations for the web tab', async () => {
        const { result } = renderHook(() => useRefreshDashboard(), { wrapper });

        await act(() => result.current.refreshTab('web'));

        expect(integrationSnapshotApi.refreshGoogleAnalytics).toHaveBeenCalledWith('company-1');
        expect(integrationSnapshotApi.refreshSearchConsole).toHaveBeenCalledWith('company-1');
        expect(integrationSnapshotApi.refreshOverview).not.toHaveBeenCalled();
    });

    it('refreshes Google Ads and Meta Ads for the ads tab', async () => {
        const { result } = renderHook(() => useRefreshDashboard(), { wrapper });

        await act(() => result.current.refreshTab('ads'));

        expect(integrationSnapshotApi.refreshGoogleAds).toHaveBeenCalledWith('company-1');
        expect(integrationSnapshotApi.refreshMetaAds).toHaveBeenCalledWith('company-1');
        expect(integrationSnapshotApi.refreshOverview).not.toHaveBeenCalled();
    });
});
