import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../../../store/AuthContext';
import { getApiErrorMessage } from '../../../lib/apiError';
import { searchConsoleApi } from '../api/searchConsoleApi';
import { DATE_PRESETS, buildCountryBarData, buildDevicePieData, computeClickThroughRate } from '../model/searchConsole.utils';
import type { ScOverviewResponse, ScSite, ScStatusResponse } from '../searchConsole.types';

interface SCDetailState {
    status: ScStatusResponse | null;
    data: ScOverviewResponse | null;
    loading: boolean;
    error: string | null;
    refreshing: boolean;
    activePreset: number;
    showDateMenu: boolean;
    customStart: string;
    customEnd: string;
    isCustomRange: boolean;
    sites: ScSite[];
    selectedSite: string;
    loadingSites: boolean;
    savingSiteUrl: boolean;
}

export function useSCDetailPage() {
    const { user, isLoading: authLoading } = useAuth();
    const companyId = user?.companyId;

    const [state, setState] = useState<SCDetailState>({
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
        sites: [],
        selectedSite: '',
        loadingSites: false,
        savingSiteUrl: false,
    });

    const currentRange = state.isCustomRange
        ? { start: state.customStart, end: state.customEnd, desc: `${state.customStart} — ${state.customEnd}` }
        : DATE_PRESETS[state.activePreset];

    const loadSites = useCallback(() => {
        if (!companyId) return;
        setState(s => ({ ...s, loadingSites: true }));
        searchConsoleApi.listSites(companyId)
            .then(s => {
                setState(prev => ({ ...prev, sites: s, selectedSite: s.length > 0 ? s[0].siteUrl : '' }));
            })
            .catch(() => setState(prev => ({ ...prev, sites: [] })))
            .finally(() => setState(prev => ({ ...prev, loadingSites: false })));
    }, [companyId]);

    const load = useCallback((showRefresh = false) => {
        if (!companyId) {
            setState(s => ({ ...s, loading: false, refreshing: false }));
            return;
        }
        if (showRefresh) setState(s => ({ ...s, refreshing: true, error: null }));
        else setState(s => ({ ...s, loading: true, error: null }));

        const startDate = state.isCustomRange ? state.customStart : DATE_PRESETS[state.activePreset].start;
        const endDate = state.isCustomRange ? state.customEnd : DATE_PRESETS[state.activePreset].end;

        searchConsoleApi
            .getStatus(companyId)
            .then(s => {
                setState(prev => ({ ...prev, status: s, data: null }));
                if (s.connected && s.siteUrl) {
                    return searchConsoleApi.getOverview(companyId, startDate, endDate).then(d => setState(prev => ({ ...prev, data: d })));
                }
                if (s.connected && s.hasScScope && !s.siteUrl) {
                    loadSites();
                }
            })
            .catch((err: unknown) => setState(prev => ({
                ...prev,
                error: getApiErrorMessage(err, 'Search Console verileri yüklenirken hata oluştu'),
            })))
            .finally(() => setState(prev => ({ ...prev, loading: false, refreshing: false })));
    }, [companyId, state.activePreset, state.customEnd, state.customStart, state.isCustomRange, loadSites]);

    useEffect(() => {
        if (authLoading) return;
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

    const saveSiteUrl = useCallback(async (siteUrl?: string) => {
        const url = siteUrl || state.selectedSite;
        if (!companyId || !url?.trim()) return;
        setState(s => ({ ...s, savingSiteUrl: true }));
        try {
            await searchConsoleApi.saveSiteUrl(companyId, url.trim());
            load();
        } finally {
            setState(s => ({ ...s, savingSiteUrl: false }));
        }
    }, [companyId, state.selectedSite, load]);

    const [disconnecting, setDisconnecting] = useState(false);

    const disconnect = useCallback(async () => {
        if (!companyId) return;
        setDisconnecting(true);
        try {
            await searchConsoleApi.disconnect(companyId);
            setState(s => ({ ...s, status: null, data: null }));
            load();
        } finally {
            setDisconnecting(false);
        }
    }, [companyId, load]);

    const devicePieData = useMemo(() => buildDevicePieData(state.data?.devices ?? []), [state.data?.devices]);
    const countryBarData = useMemo(() => buildCountryBarData(state.data?.countries ?? []), [state.data?.countries]);
    const clickThroughRate = state.data ? computeClickThroughRate(state.data.totalClicks, state.data.totalImpressions) : '0';

    return {
        ...state,
        authLoading,
        currentRange,
        devicePieData,
        countryBarData,
        clickThroughRate,
        disconnecting,
        setActivePreset: (p: number) => setState(s => ({ ...s, activePreset: p, showDateMenu: false })),
        setShowDateMenu: (v: boolean) => setState(s => ({ ...s, showDateMenu: v })),
        setCustomStart: (v: string) => setState(s => ({ ...s, customStart: v })),
        setCustomEnd: (v: string) => setState(s => ({ ...s, customEnd: v })),
        setIsCustomRange: (v: boolean) => setState(s => ({ ...s, isCustomRange: v })),
        setSelectedSite: (v: string) => setState(s => ({ ...s, selectedSite: v })),
        loadSites,
        saveSiteUrl,
        disconnect,
        refresh: () => load(true),
    };
}
