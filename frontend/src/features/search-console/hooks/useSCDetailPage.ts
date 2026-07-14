import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useAuth } from '../../../store/AuthContext';
import { getApiErrorMessage } from '../../../lib/apiError';
import { integrationSnapshotApi } from '../../integration-snapshots/api/integrationSnapshotApi';
import type { IntegrationSnapshotMeta } from '../../integration-snapshots/integrationSnapshot.types';
import { searchConsoleApi } from '../api/searchConsoleApi';
import { DATE_PRESETS, buildCountryBarData, buildDevicePieData, computeClickThroughRate } from '../model/searchConsole.utils';
import type { ScOverviewResponse, ScSite, ScStatusResponse } from '../searchConsole.types';

interface SCDetailState {
    status: ScStatusResponse | null;
    data: ScOverviewResponse | null;
    snapshotMeta: IntegrationSnapshotMeta | null;
    loading: boolean;
    error: string | null;
    refreshing: boolean;
    activePreset: number;
    showDateMenu: boolean;
    customStart: string;
    customEnd: string;
    appliedCustomStart: string;
    appliedCustomEnd: string;
    isCustomRange: boolean;
    sites: ScSite[];
    selectedSite: string;
    loadingSites: boolean;
    savingSiteUrl: boolean;
}

export function useSCDetailPage() {
    const { user, isLoading: authLoading } = useAuth();
    const companyId = user?.companyId;
    const initialOAuthError = useRef(
        new URLSearchParams(window.location.search).get('oauthError'),
    );
    const requestVersion = useRef(0);

    const [state, setState] = useState<SCDetailState>({
        status: null,
        data: null,
        snapshotMeta: null,
        loading: true,
        error: initialOAuthError.current,
        refreshing: false,
        activePreset: 2,
        showDateMenu: false,
        customStart: '',
        customEnd: '',
        appliedCustomStart: '',
        appliedCustomEnd: '',
        isCustomRange: false,
        sites: [],
        selectedSite: '',
        loadingSites: false,
        savingSiteUrl: false,
    });

    const currentRange = state.isCustomRange
        ? {
            start: state.appliedCustomStart,
            end: state.appliedCustomEnd,
            desc: `${state.appliedCustomStart} — ${state.appliedCustomEnd}`,
        }
        : DATE_PRESETS[state.activePreset];

    const loadSites = useCallback(() => {
        if (!companyId) return;
        setState(s => ({ ...s, loadingSites: true }));
        searchConsoleApi.listSites(companyId)
            .then(s => {
                setState(prev => ({ ...prev, sites: s, selectedSite: s.length > 0 ? s[0].siteUrl : '' }));
            })
            .catch((err: unknown) => setState(prev => ({
                ...prev,
                sites: [],
                error: getApiErrorMessage(err, 'Search Console site listesi alınamadı'),
            })))
            .finally(() => setState(prev => ({ ...prev, loadingSites: false })));
    }, [companyId]);

    const load = useCallback((showRefresh = false) => {
        if (!companyId) {
            setState(s => ({ ...s, loading: false, refreshing: false }));
            return;
        }
        const version = ++requestVersion.current;
        if (showRefresh) setState(s => ({ ...s, refreshing: true, error: null }));
        else setState(s => ({ ...s, loading: true, error: null }));

        const startDate = state.isCustomRange
            ? state.appliedCustomStart
            : DATE_PRESETS[state.activePreset].start;
        const endDate = state.isCustomRange
            ? state.appliedCustomEnd
            : DATE_PRESETS[state.activePreset].end;
        const useDefaultSnapshot = !state.isCustomRange && state.activePreset === 2;

        searchConsoleApi
            .getStatus(companyId)
            .then(s => {
                if (version !== requestVersion.current) return;
                setState(prev => ({
                    ...prev,
                    status: s,
                    data: null,
                    snapshotMeta: useDefaultSnapshot ? prev.snapshotMeta : null,
                }));
                if (s.connected && s.siteUrl) {
                    const overviewRequest = useDefaultSnapshot
                        ? integrationSnapshotApi.getOverview(companyId).then(snapshot => {
                            if (version === requestVersion.current) {
                                setState(prev => ({ ...prev, snapshotMeta: snapshot.scSnapshot }));
                            }
                            return snapshot.sc;
                        })
                        : searchConsoleApi.getOverview(companyId, startDate, endDate);
                    return overviewRequest.then(d => {
                        if (version === requestVersion.current) {
                            setState(prev => ({ ...prev, data: d }));
                        }
                    });
                }
                if (s.connected && s.hasScScope && !s.siteUrl) {
                    loadSites();
                }
            })
            .catch((err: unknown) => {
                if (version === requestVersion.current) {
                    setState(prev => ({
                        ...prev,
                        error: getApiErrorMessage(err, 'Search Console verileri yüklenirken hata oluştu'),
                    }));
                }
            })
            .finally(() => {
                if (version === requestVersion.current) {
                    setState(prev => ({ ...prev, loading: false, refreshing: false }));
                }
            });
    }, [
        companyId,
        state.activePreset,
        state.appliedCustomEnd,
        state.appliedCustomStart,
        state.isCustomRange,
        loadSites,
    ]);

    useEffect(() => {
        if (authLoading) return;
        if (initialOAuthError.current) {
            if (!companyId) {
                setState(s => ({ ...s, loading: false }));
                return;
            }
            searchConsoleApi.getStatus(companyId)
                .then(status => setState(s => ({ ...s, status })))
                .catch(() => undefined)
                .finally(() => setState(s => ({ ...s, loading: false })));
            return;
        }
        load();
    }, [load, authLoading, companyId]);

    /* OAuth callback sonrası ?connected=true parametresini yakala ve temizle */
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.has('connected') || params.has('oauthError')) {
            window.history.replaceState({}, '', window.location.pathname);
        }
    }, []);

    const saveSiteUrl = useCallback(async (siteUrl?: string) => {
        const url = siteUrl || state.selectedSite;
        if (!companyId || !url?.trim()) return;
        setState(s => ({ ...s, savingSiteUrl: true }));
        try {
            await searchConsoleApi.saveSiteUrl(companyId, url.trim());
            await integrationSnapshotApi.refreshSearchConsole(companyId);
            load();
        } catch (err: unknown) {
            setState(s => ({
                ...s,
                error: getApiErrorMessage(err, 'Search Console sitesi kaydedilemedi'),
            }));
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
            await integrationSnapshotApi.refreshSearchConsole(companyId);
            setState(s => ({ ...s, status: null, data: null, snapshotMeta: null }));
            load();
        } catch (err: unknown) {
            setState(s => ({
                ...s,
                error: getApiErrorMessage(err, 'Search Console bağlantısı kesilemedi'),
            }));
        } finally {
            setDisconnecting(false);
        }
    }, [companyId, load]);

    const devicePieData = useMemo(() => buildDevicePieData(state.data?.devices ?? []), [state.data?.devices]);
    const countryBarData = useMemo(() => buildCountryBarData(state.data?.countries ?? []), [state.data?.countries]);
    const clickThroughRate = state.data ? computeClickThroughRate(state.data.totalClicks, state.data.totalImpressions) : '0';

    const refresh = useCallback(async () => {
        if (!companyId) return;
        const useDefaultSnapshot = !state.isCustomRange && state.activePreset === 2;
        if (!useDefaultSnapshot) {
            load(true);
            return;
        }
        setState(s => ({ ...s, refreshing: true, error: null }));
        try {
            await integrationSnapshotApi.refreshSearchConsole(companyId);
            load(true);
        } catch (err: unknown) {
            setState(s => ({
                ...s,
                refreshing: false,
                error: getApiErrorMessage(err, 'Search Console snapshot yenilenemedi'),
            }));
        }
    }, [companyId, load, state.activePreset, state.isCustomRange]);

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
        setIsCustomRange: (v: boolean) => setState(s => ({
            ...s,
            isCustomRange: v,
            appliedCustomStart: v ? s.customStart : s.appliedCustomStart,
            appliedCustomEnd: v ? s.customEnd : s.appliedCustomEnd,
        })),
        setSelectedSite: (v: string) => setState(s => ({ ...s, selectedSite: v })),
        loadSites,
        saveSiteUrl,
        disconnect,
        refresh,
    };
}
