import api from '../../../api/client';
import type { ClientIntegrationSnapshotOverviewResponse } from '../integrationSnapshot.types';

export const integrationSnapshotApi = {
    getOverview: (companyId: string) =>
        api.get<ClientIntegrationSnapshotOverviewResponse>('/client/integration-snapshots/overview', {
            params: { companyId },
        }).then(response => response.data),
    refreshOverview: (companyId: string) =>
        api.post<void>('/client/integration-snapshots/overview/refresh', null, {
            params: { companyId },
        }).then(response => response.data),
    refreshSearchConsole: (companyId: string) =>
        api.post<void>('/client/integration-snapshots/search-console/refresh', null, {
            params: { companyId },
        }).then(response => response.data),
};
