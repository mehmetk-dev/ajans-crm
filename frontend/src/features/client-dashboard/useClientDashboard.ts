import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../store/AuthContext';
import { googleAnalyticsApi } from '../google-analytics/api/googleAnalyticsApi';
import { analyticsKeys } from '../google-analytics/googleAnalyticsKeys';
import type { GaOverviewResponse } from '../google-analytics/googleAnalytics.types';
import { igApi, instagramKeys } from '../instagram';
import type { IgOverviewResponse } from '../instagram/instagram.types';
import { searchConsoleApi, searchConsoleKeys } from '../search-console';
import type { ScOverviewResponse } from '../search-console/searchConsole.types';
import { taskApi, taskKeys } from '../tasks';
import type { TaskResponse } from '../tasks/api/task.types';
import { shootApi, shootKeys } from '../shoots';
import type { ShootResponse } from '../shoots/api/shoot.types';
import { useActiveServices } from '../../hooks/useActiveServices';
import type { TabKey } from './dashboard.types';
import { dashboardRefreshKeys } from './dashboardKeys';

const STALE = Infinity;
const CACHE = 30 * 60_000;

export function useClientDashboard() {
    const { user } = useAuth();
    const companyId = user?.companyId || '';
    const enabled = !!companyId;
    const {
        hasDigitalMarketing,
        hasSocialMedia,
        hasProduction,
        isLoading: servicesLoading,
        ...activeServices
    } = useActiveServices();

    const gaEnabled = enabled && !servicesLoading && hasDigitalMarketing;
    const scEnabled = enabled && !servicesLoading && hasDigitalMarketing;
    const igEnabled = enabled && !servicesLoading && hasSocialMedia;
    const shootsEnabled = enabled && !servicesLoading && hasProduction;
    const tasksEnabled = enabled;

    const ga = useQuery<GaOverviewResponse>({
        queryKey: analyticsKeys.overview(companyId),
        queryFn: () => googleAnalyticsApi.getOverview(companyId),
        enabled: gaEnabled, staleTime: STALE, gcTime: CACHE,
    });
    const sc = useQuery<ScOverviewResponse>({
        queryKey: searchConsoleKeys.overview(companyId),
        queryFn: () => searchConsoleApi.getOverview(companyId),
        enabled: scEnabled, staleTime: STALE, gcTime: CACHE,
    });
    const ig = useQuery<IgOverviewResponse>({
        queryKey: instagramKeys.overview(companyId),
        queryFn: () => igApi.getOverview(companyId),
        enabled: igEnabled, staleTime: STALE, gcTime: CACHE,
    });
    const shoots = useQuery<{ content: ShootResponse[] }>({
        queryKey: shootKeys.list('client', 0, 20),
        queryFn: () => shootApi.listClient(0, 20),
        enabled: shootsEnabled, staleTime: STALE, gcTime: CACHE,
    });
    const tasks = useQuery<{ content: TaskResponse[] }>({
        queryKey: taskKeys.clientList(),
        queryFn: () => taskApi.listClient(0, 20),
        enabled: tasksEnabled, staleTime: STALE, gcTime: CACHE,
    });

    const isLoading = servicesLoading
        || ga.isLoading || sc.isLoading || ig.isLoading
        || shoots.isLoading || tasks.isLoading;

    const isAllSettled = !servicesLoading
        && !ga.isFetching && !sc.isFetching && !ig.isFetching
        && !shoots.isFetching && !tasks.isFetching;

    return {
        companyId,
        isLoading,
        isAllSettled,
        ga: ga.data,
        sc: sc.data,
        ig: ig.data,
        shoots: shoots.data?.content ?? [],
        tasks: tasks.data?.content ?? [],
        gaConnected: !!(ga.data?.connected && ga.data?.propertyId),
        scConnected: !!(sc.data?.connected && sc.data?.siteUrl),
        igConnected: !!(ig.data?.connected && ig.data?.username),
        hasDigitalMarketing,
        hasSocialMedia,
        hasProduction,
        hasContentMarketing: activeServices.hasContentMarketing,
        hasService: activeServices.hasService,
    };
}

export function useRefreshDashboard() {
    const qc = useQueryClient();
    const { user } = useAuth();
    const companyId = user?.companyId || '';

    const refreshTab = async (tab: TabKey) => {
        const keys = dashboardRefreshKeys[tab](companyId);
        await Promise.all(keys.map(k => qc.invalidateQueries({ queryKey: k })));
    };

    const refreshAll = async () => {
        const allKeys = [
            ...dashboardRefreshKeys.overview(companyId),
            ...dashboardRefreshKeys.web(companyId),
            ...dashboardRefreshKeys.social(companyId),
            ...dashboardRefreshKeys.schedule(companyId),
            instagramKeys.status(companyId),
            instagramKeys.reels(companyId),
            instagramKeys.posts(companyId),
        ];
        const uniqueKeys = new Map<string, readonly unknown[]>();
        for (const k of allKeys) {
            uniqueKeys.set(JSON.stringify(k), k);
        }
        await Promise.all(
            Array.from(uniqueKeys.values()).map(k =>
                qc.invalidateQueries({ queryKey: k as unknown[] })
            )
        );
    };

    return { refreshTab, refreshAll };
}