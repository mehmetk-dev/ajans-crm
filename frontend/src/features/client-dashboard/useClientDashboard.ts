import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../store/AuthContext';
import { instagramKeys } from '../instagram';
import { integrationSnapshotApi, integrationSnapshotKeys } from '../integration-snapshots';
import type { ClientIntegrationSnapshotOverviewResponse } from '../integration-snapshots';
import { taskApi, taskKeys } from '../tasks';
import type { TaskResponse } from '../tasks/api/task.types';
import { shootApi, shootKeys } from '../shoots';
import type { ShootResponse } from '../shoots/api/shoot.types';
import { useActiveServices } from '../../hooks/useActiveServices';
import type { TabKey } from './dashboard.types';
import { dashboardRefreshKeys } from './dashboardKeys';

const STALE = Infinity;
const SNAPSHOT_STALE = 60_000;
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

    const shootsEnabled = enabled && !servicesLoading && hasProduction;
    const tasksEnabled = enabled;

    const snapshots = useQuery<ClientIntegrationSnapshotOverviewResponse>({
        queryKey: integrationSnapshotKeys.overview(companyId),
        queryFn: () => integrationSnapshotApi.getOverview(companyId),
        enabled,
        staleTime: SNAPSHOT_STALE,
        gcTime: CACHE,
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
        || snapshots.isLoading
        || shoots.isLoading || tasks.isLoading;

    const isAllSettled = !servicesLoading
        && !snapshots.isFetching
        && !shoots.isFetching && !tasks.isFetching;

    return {
        companyId,
        isLoading,
        isAllSettled,
        ga: snapshots.data?.ga,
        sc: snapshots.data?.sc,
        ig: snapshots.data?.ig,
        gaSnapshot: snapshots.data?.gaSnapshot,
        scSnapshot: snapshots.data?.scSnapshot,
        igSnapshot: snapshots.data?.igSnapshot,
        shoots: shoots.data?.content ?? [],
        tasks: tasks.data?.content ?? [],
        gaConnected: !!(snapshots.data?.ga?.connected && snapshots.data?.ga?.propertyId),
        scConnected: !!(snapshots.data?.sc?.connected && snapshots.data?.sc?.siteUrl),
        igConnected: !!(snapshots.data?.ig?.connected && snapshots.data?.ig?.username),
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
        if (companyId && tab !== 'schedule') {
            await integrationSnapshotApi.refreshOverview(companyId);
        }
        const keys = dashboardRefreshKeys[tab](companyId);
        await Promise.all(keys.map(k => qc.invalidateQueries({ queryKey: k })));
    };

    const refreshAll = async () => {
        if (companyId) {
            await integrationSnapshotApi.refreshOverview(companyId);
        }
        const allKeys = [
            integrationSnapshotKeys.overview(companyId),
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
