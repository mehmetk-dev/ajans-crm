import { analyticsKeys } from '../google-analytics/googleAnalyticsKeys';
import { searchConsoleKeys } from '../search-console/searchConsoleKeys';
import { instagramKeys } from '../instagram/instagramKeys';
import { shootKeys } from '../shoots/api/shootKeys';
import { taskKeys } from '../tasks/api/taskKeys';

export const dashboardRefreshKeys = {
    overview: (companyId: string) => [
        analyticsKeys.overview(companyId),
        searchConsoleKeys.overview(companyId),
        instagramKeys.overview(companyId),
        shootKeys.list('client', 0, 20),
        taskKeys.clientList(),
    ],
    web: (companyId: string) => [
        analyticsKeys.overview(companyId),
        searchConsoleKeys.overview(companyId),
    ],
    social: (companyId: string) => [
        instagramKeys.overview(companyId),
    ],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    schedule: (_companyId: string) => [
        shootKeys.list('client', 0, 20),
        taskKeys.clientList(),
    ],
};