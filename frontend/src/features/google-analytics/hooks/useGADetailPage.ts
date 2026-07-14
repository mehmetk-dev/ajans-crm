import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../../../store/AuthContext';
import { getApiErrorMessage } from '../../../lib/apiError';
import { integrationSnapshotApi } from '../../integration-snapshots/api/integrationSnapshotApi';
import type { IntegrationSnapshotMeta } from '../../integration-snapshots/integrationSnapshot.types';
import { googleAnalyticsApi } from '../api/googleAnalyticsApi';
import { DATE_PRESETS, buildSourcePieData, buildCountryBarData, computeEngagementRate, computeSessionsPerUser } from '../model/googleAnalytics.utils';
import type { GaOverviewResponse, GaStatusResponse } from '../googleAnalytics.types';

interface GADetailState {
    status: GaStatusResponse | null;
    data: GaOverviewResponse | null;
    snapshotMeta: IntegrationSnapshotMeta | null;
    loading: boolean;
    error: string | null;
    refreshing: boolean;
    activePreset: number;
    showDateMenu: boolean;
    customStart: string;
    customEnd: string;
    isCustomRange: boolean;
}

export function useGADetailPage() {
    const { user, isLoading: authLoading } = useAuth();
    const companyId = user?.companyId;

    const [state, setState] = useState<GADetailState>({
        status: null,
        data: null,
        snapshotMeta: null,
        loading: true,
        error: null,
        refreshing: false,
        activePreset: 2,
        showDateMenu: false,
        customStart: '',
        customEnd: '',
        isCustomRange: false,
    });

    const currentRange = state.isCustomRange
        ? { start: state.customStart, end: state.customEnd, desc: `${state.customStart} — ${state.customEnd}` }
        : DATE_PRESETS[state.activePreset];

    const load = useCallback((showRefresh = false) => {
        if (!companyId) {
            setState(s => ({ ...s, loading: false, refreshing: false }));
            return;
        }
        if (showRefresh) setState(s => ({ ...s, refreshing: true, error: null }));
        else setState(s => ({ ...s, loading: true, error: null }));

        const startDate = state.isCustomRange ? state.customStart : DATE_PRESETS[state.activePreset].start;
        const endDate = state.isCustomRange ? state.customEnd : DATE_PRESETS[state.activePreset].end;
        const useDefaultSnapshot = !state.isCustomRange && state.activePreset === 2;

        googleAnalyticsApi
            .getStatus(companyId)
            .then(s => {
                setState(prev => ({
                    ...prev,
                    status: s,
                    data: null,
                    snapshotMeta: useDefaultSnapshot ? prev.snapshotMeta : null,
                }));
                if (s.connected && s.propertyId) {
                    const overviewRequest = useDefaultSnapshot
                        ? integrationSnapshotApi.getOverview(companyId).then(snapshot => {
                            setState(prev => ({ ...prev, snapshotMeta: snapshot.gaSnapshot }));
                            return snapshot.ga;
                        })
                        : googleAnalyticsApi.getOverview(companyId, startDate, endDate);
                    return overviewRequest.then(d => setState(prev => ({ ...prev, data: d })));
                }
            })
            .catch((err: unknown) => setState(prev => ({
                ...prev,
                error: getApiErrorMessage(err, 'Google Analytics verileri yüklenirken hata oluştu'),
            })))
            .finally(() => setState(prev => ({ ...prev, loading: false, refreshing: false })));
    }, [companyId, state.activePreset, state.customEnd, state.customStart, state.isCustomRange]);

    useEffect(() => {
        if (authLoading) return;
        load();
    }, [load, authLoading]);

    /* OAuth callback sonrası ?connected=true parametresini yakala ve temizle */
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('connected') === 'true') {
            window.history.replaceState({}, '', window.location.pathname);
        }
    }, []);

    const sourcePieData = useMemo(() => buildSourcePieData(state.data?.trafficSources ?? []), [state.data?.trafficSources]);
    const countryBarData = useMemo(() => buildCountryBarData(state.data?.topCountries ?? []), [state.data?.topCountries]);
    const totalSources = sourcePieData.reduce((a, b) => a + b.value, 0);
    const totalPages = (state.data?.topPages ?? []).reduce((a, b) => a + b.value, 0);
    const maxPageViews = Math.max(...(state.data?.topPages ?? []).map(p => p.value), 1);
    const engagementRate = state.data ? computeEngagementRate(state.data.bounceRate) : '0';
    const sessionsPerUser = state.data ? computeSessionsPerUser(state.data.sessions, state.data.totalUsers) : '0';

    const refresh = useCallback(async () => {
        if (!companyId) return;
        const useDefaultSnapshot = !state.isCustomRange && state.activePreset === 2;
        if (!useDefaultSnapshot) {
            load(true);
            return;
        }
        setState(s => ({ ...s, refreshing: true, error: null }));
        try {
            await integrationSnapshotApi.refreshGoogleAnalytics(companyId);
            load(true);
        } catch (err: unknown) {
            setState(s => ({
                ...s,
                refreshing: false,
                error: getApiErrorMessage(err, 'Google Analytics snapshot yenilenemedi'),
            }));
        }
    }, [companyId, load, state.activePreset, state.isCustomRange]);

    return {
        ...state,
        authLoading,
        currentRange,
        sourcePieData,
        countryBarData,
        totalSources,
        totalPages,
        maxPageViews,
        engagementRate,
        sessionsPerUser,
        setActivePreset: (p: number) => setState(s => ({ ...s, activePreset: p, showDateMenu: false })),
        setShowDateMenu: (v: boolean) => setState(s => ({ ...s, showDateMenu: v })),
        setCustomStart: (v: string) => setState(s => ({ ...s, customStart: v })),
        setCustomEnd: (v: string) => setState(s => ({ ...s, customEnd: v })),
        setIsCustomRange: (v: boolean) => setState(s => ({ ...s, isCustomRange: v })),
        refresh,
    };
}
