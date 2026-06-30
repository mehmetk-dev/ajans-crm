import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../../../store/AuthContext';
import { getApiErrorMessage } from '../../../lib/apiError';
import { googleAnalyticsApi } from '../api/googleAnalyticsApi';
import { DATE_PRESETS, buildSourcePieData, buildCountryBarData, computeEngagementRate, computeSessionsPerUser } from '../model/googleAnalytics.utils';
import type { GaOverviewResponse, GaStatusResponse } from '../googleAnalytics.types';

interface GADetailState {
    status: GaStatusResponse | null;
    data: GaOverviewResponse | null;
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

        googleAnalyticsApi
            .getStatus(companyId)
            .then(s => {
                setState(prev => ({ ...prev, status: s, data: null }));
                if (s.connected && s.propertyId) {
                    return googleAnalyticsApi.getOverview(companyId, startDate, endDate).then(d => setState(prev => ({ ...prev, data: d })));
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
        // eslint-disable-next-line react-hooks/set-state-in-effect
        load();
    }, [load, authLoading]);

    /* OAuth callback sonrası ?connected=true parametresini yakala ve temizle */
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('connected') === 'true') {
            window.history.replaceState({}, '', window.location.pathname);
            load();
        }
    }, [load]);

    const sourcePieData = useMemo(() => buildSourcePieData(state.data?.trafficSources ?? []), [state.data?.trafficSources]);
    const countryBarData = useMemo(() => buildCountryBarData(state.data?.topCountries ?? []), [state.data?.topCountries]);
    const totalSources = sourcePieData.reduce((a, b) => a + b.value, 0);
    const totalPages = (state.data?.topPages ?? []).reduce((a, b) => a + b.value, 0);
    const maxPageViews = Math.max(...(state.data?.topPages ?? []).map(p => p.value), 1);
    const engagementRate = state.data ? computeEngagementRate(state.data.bounceRate) : '0';
    const sessionsPerUser = state.data ? computeSessionsPerUser(state.data.sessions, state.data.totalUsers) : '0';

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
        refresh: () => load(true),
    };
}
