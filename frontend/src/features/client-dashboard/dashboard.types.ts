import type { GaOverviewResponse } from '../google-analytics/googleAnalytics.types';
import type { ScOverviewResponse } from '../search-console/searchConsole.types';
import type { IgOverviewResponse } from '../instagram/instagram.types';
import type { GoogleAdsOverviewResponse } from '../google-ads';
import type { MetaAdsOverviewResponse } from '../meta-ads';
import type { ShootResponse } from '../shoots/api/shoot.types';
import type { TaskResponse } from '../tasks/api/task.types';
import type { IntegrationSnapshotMeta } from '../integration-snapshots';

export type { GaOverviewResponse, ScOverviewResponse, IgOverviewResponse, GoogleAdsOverviewResponse, MetaAdsOverviewResponse, ShootResponse, TaskResponse };

export type TabKey = 'overview' | 'web' | 'social' | 'ads' | 'schedule';

export interface DashboardViewModel {
    ga: GaOverviewResponse | undefined;
    sc: ScOverviewResponse | undefined;
    ig: IgOverviewResponse | undefined;
    ads: GoogleAdsOverviewResponse | undefined;
    metaAds: MetaAdsOverviewResponse | undefined;
    gaSnapshot: IntegrationSnapshotMeta | undefined;
    scSnapshot: IntegrationSnapshotMeta | undefined;
    igSnapshot: IntegrationSnapshotMeta | undefined;
    adsSnapshot: IntegrationSnapshotMeta | undefined;
    metaAdsSnapshot: IntegrationSnapshotMeta | undefined;
    shoots: (ShootResponse & { shootDate: string })[];
    tasks: TaskResponse[];
    gaConnected: boolean;
    scConnected: boolean;
    igConnected: boolean;
    googleAdsConnected: boolean;
    metaAdsConnected: boolean;
    isLoading: boolean;
}

export type DashboardRefreshKeys = typeof import('./dashboardKeys').dashboardRefreshKeys;
