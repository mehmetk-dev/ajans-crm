import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../store/AuthContext';
import { gaApi } from '../api/googleAnalytics';
import { igApi, instagramKeys } from '../features/instagram';
import { searchConsoleApi, searchConsoleKeys } from '../features/search-console';
import { taskApi, taskKeys } from '../features/tasks';
import { shootApi, shootKeys } from '../features/shoots';
import { useActiveServices } from './useActiveServices';

const STALE = Infinity;       // never auto-refetch
const CACHE = 30 * 60_000;    // keep 30 min in memory

export function useClientDataPrefetch() {
    const { user } = useAuth();
    const cid = user?.companyId || '';
    const enabled = !!cid;
    const {
        hasDigitalMarketing,
        hasSocialMedia,
        hasProduction,
        isLoading: servicesLoading,
    } = useActiveServices();

    const ga = useQuery({
        queryKey: ['client-ga', cid], queryFn: () => gaApi.getOverview(cid),
        enabled: enabled && !servicesLoading && hasDigitalMarketing, staleTime: STALE, gcTime: CACHE,
    });
    const sc = useQuery({
        queryKey: searchConsoleKeys.overview(cid), queryFn: () => searchConsoleApi.getOverview(cid),
        enabled: enabled && !servicesLoading && hasDigitalMarketing, staleTime: STALE, gcTime: CACHE,
    });
    const ig = useQuery({
        queryKey: instagramKeys.overview(cid), queryFn: () => igApi.getOverview(cid),
        enabled: enabled && !servicesLoading && hasSocialMedia, staleTime: STALE, gcTime: CACHE,
    });
    const igStatus = useQuery({
        queryKey: instagramKeys.status(cid), queryFn: () => igApi.getStatus(cid),
        enabled: enabled && !servicesLoading && hasSocialMedia, staleTime: STALE, gcTime: CACHE,
    });
    const igReels = useQuery({
        queryKey: instagramKeys.reels(cid), queryFn: () => igApi.getReels(cid, 100),
        enabled: enabled && !servicesLoading && hasSocialMedia, staleTime: STALE, gcTime: CACHE,
    });
    const igPosts = useQuery({
        queryKey: instagramKeys.posts(cid), queryFn: () => igApi.getPosts(cid, 100),
        enabled: enabled && !servicesLoading && hasSocialMedia, staleTime: STALE, gcTime: CACHE,
    });
    const shoots = useQuery({
        queryKey: shootKeys.list('client', 0, 20), queryFn: () => shootApi.listClient(0, 20),
        enabled: enabled && !servicesLoading && hasProduction, staleTime: STALE, gcTime: CACHE,
    });
    const tasks = useQuery({
        queryKey: taskKeys.clientList(), queryFn: () => taskApi.listClient(0, 20),
        enabled, staleTime: STALE, gcTime: CACHE,
    });

    const isLoading = servicesLoading || ga.isLoading || sc.isLoading || ig.isLoading || shoots.isLoading || tasks.isLoading || igStatus.isLoading || igReels.isLoading || igPosts.isLoading;
    const isAllSettled = !servicesLoading && !ga.isFetching && !sc.isFetching && !ig.isFetching && !shoots.isFetching && !tasks.isFetching && !igStatus.isFetching && !igReels.isFetching && !igPosts.isFetching;

    return { isLoading, isAllSettled, ga, sc, ig, igStatus, igReels, igPosts, shoots, tasks };
}

/** Refresh all client data */
export function useRefreshAllClientData() {
    const qc = useQueryClient();
    const { user } = useAuth();
    const cid = user?.companyId || '';
    return () => {
        [
            'client-ga',
            'client-sc',
            instagramKeys.overviewRoot[0],
            instagramKeys.statusRoot[0],
            instagramKeys.reelsRoot[0],
            instagramKeys.postsRoot[0],
            'client-tasks',
        ].forEach(key => {
            qc.invalidateQueries({ queryKey: [key, cid] });
        });
        qc.invalidateQueries({ queryKey: shootKeys.all });
    };
}

/** Refresh a single panel by its query key prefix */
export function useRefreshPanel() {
    const qc = useQueryClient();
    const { user } = useAuth();
    const cid = user?.companyId || '';
    return (panel: 'ga' | 'sc' | 'ig' | 'ig-status' | 'ig-reels' | 'ig-posts' | 'shoots' | 'tasks') => {
        if (panel === 'shoots') {
            qc.invalidateQueries({ queryKey: shootKeys.all });
            return;
        }
        qc.invalidateQueries({ queryKey: [`client-${panel}`, cid] });
    };
}
