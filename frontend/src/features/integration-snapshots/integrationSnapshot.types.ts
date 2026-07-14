import type { GaOverviewResponse } from '../google-analytics/googleAnalytics.types';
import type { GoogleAdsOverviewResponse } from '../google-ads/googleAds.types';
import type { IgOverviewResponse } from '../instagram/instagram.types';
import type { ScOverviewResponse } from '../search-console/searchConsole.types';

export type IntegrationSnapshotStatus = 'PENDING' | 'SYNCING' | 'READY' | 'FAILED';

export interface IntegrationSnapshotMeta {
    status: IntegrationSnapshotStatus;
    lastSyncedAt: string | null;
    nextSyncAt: string | null;
    stale: boolean;
    errorMessage: string | null;
}

export interface ClientIntegrationSnapshotOverviewResponse {
    ga: GaOverviewResponse;
    gaSnapshot: IntegrationSnapshotMeta;
    sc: ScOverviewResponse;
    scSnapshot: IntegrationSnapshotMeta;
    ads: GoogleAdsOverviewResponse;
    adsSnapshot: IntegrationSnapshotMeta;
    ig: IgOverviewResponse;
    igSnapshot: IntegrationSnapshotMeta;
}
