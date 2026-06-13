import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../../store/AuthContext';
import { searchConsoleApi } from '../api/searchConsoleApi';
import { DATE_PRESETS, buildCountryBarData, buildDevicePieData, computeClickThroughRate } from '../model/searchConsole.utils';
import type { ScOverviewResponse, ScStatusResponse } from '../searchConsole.types';

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
}

export function useSCDetailPage() {
    const { user } = useAuth();
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
    });

    const currentRange = state.isCustomRange
        ? { start: state.customStart, end: state.customEnd, desc: `${state.customStart} — ${state.customEnd}` }
        : DATE_PRESETS[state.activePreset];

    const load = (showRefresh = false) => {
        if (!companyId) return;
        if (showRefresh) setState(s => ({ ...s, refreshing: true, error: null }));
        else setState(s => ({ ...s, loading: true, error: null }));

        const startDate = state.isCustomRange ? state.customStart : DATE_PRESETS[state.activePreset].start;
        const endDate = state.isCustomRange ? state.customEnd : DATE_PRESETS[state.activePreset].end;

        searchConsoleApi
            .getStatus(companyId!)
            .then(s => {
                setState(prev => ({ ...prev, status: s }));
                if (s.connected && s.siteUrl) {
                    return searchConsoleApi.getOverview(companyId!, startDate, endDate).then(d => setState(prev => ({ ...prev, data: d })));
                }
            })
            .catch(err => setState(prev => ({
                ...prev,
                error: err?.response?.data?.message || 'Search Console verileri yüklenirken hata oluştu',
            })))
            .finally(() => setState(prev => ({ ...prev, loading: false, refreshing: false })));
    };

    useEffect(() => { load(); }, [companyId, state.activePreset, state.isCustomRange, state.customStart, state.customEnd]);

    const devicePieData = useMemo(() => buildDevicePieData(state.data?.devices ?? []), [state.data?.devices]);
    const countryBarData = useMemo(() => buildCountryBarData(state.data?.countries ?? []), [state.data?.countries]);
    const clickThroughRate = state.data ? computeClickThroughRate(state.data.totalClicks, state.data.totalImpressions) : '0';

    return {
        ...state,
        currentRange,
        devicePieData,
        countryBarData,
        clickThroughRate,
        setActivePreset: (p: number) => setState(s => ({ ...s, activePreset: p, showDateMenu: false })),
        setShowDateMenu: (v: boolean) => setState(s => ({ ...s, showDateMenu: v })),
        setCustomStart: (v: string) => setState(s => ({ ...s, customStart: v })),
        setCustomEnd: (v: string) => setState(s => ({ ...s, customEnd: v })),
        setIsCustomRange: (v: boolean) => setState(s => ({ ...s, isCustomRange: v })),
        refresh: () => load(true),
    };
}