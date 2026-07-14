import { integrationSnapshotKeys } from '../integration-snapshots';
import { shootKeys } from '../shoots/api/shootKeys';
import { taskKeys } from '../tasks/api/taskKeys';

export const dashboardRefreshKeys = {
    overview: (companyId: string) => [
        integrationSnapshotKeys.overview(companyId),
        shootKeys.list('client', 0, 20),
        taskKeys.clientList(),
    ],
    web: (companyId: string) => [
        integrationSnapshotKeys.overview(companyId),
    ],
    social: (companyId: string) => [
        integrationSnapshotKeys.overview(companyId),
    ],
    ads: (companyId: string) => [
        integrationSnapshotKeys.overview(companyId),
    ],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    schedule: (_companyId: string) => [
        shootKeys.list('client', 0, 20),
        taskKeys.clientList(),
    ],
};
