import type { GaOverviewResponse } from '../google-analytics/googleAnalytics.types';
import type { ScOverviewResponse } from '../search-console/searchConsole.types';
import type { IgOverviewResponse } from '../instagram/instagram.types';
import type { ShootResponse } from '../shoots/api/shoot.types';
import type { TaskResponse } from '../tasks/api/task.types';

export type { GaOverviewResponse, ScOverviewResponse, IgOverviewResponse, ShootResponse, TaskResponse };

export type TabKey = 'overview' | 'web' | 'social' | 'schedule';

export interface DashboardViewModel {
    ga: GaOverviewResponse | undefined;
    sc: ScOverviewResponse | undefined;
    ig: IgOverviewResponse | undefined;
    shoots: (ShootResponse & { shootDate: string })[];
    tasks: TaskResponse[];
    gaConnected: boolean;
    scConnected: boolean;
    igConnected: boolean;
    isLoading: boolean;
}

export type DashboardRefreshKeys = typeof import('./dashboardKeys').dashboardRefreshKeys;