import api from '../../../api/client';
import type {
    ScOverviewResponse,
    ScSite,
    ScStatusResponse,
} from '../searchConsole.types';

export const searchConsoleApi = {
    getStatus: (companyId: string) =>
        api.get<ScStatusResponse>('/client/analytics/sc/status', {
            params: { companyId },
        }).then(response => response.data),

    listSites: (companyId: string) =>
        api.get<ScSite[]>('/client/analytics/sc/sites', {
            params: { companyId },
        }).then(response => response.data),

    getOverview: (companyId: string, startDate?: string, endDate?: string) =>
        api.get<ScOverviewResponse>('/client/analytics/sc/overview', {
            params: { companyId, startDate, endDate },
        }).then(response => response.data),

    saveSiteUrl: (companyId: string, siteUrl: string) =>
        api.post('/client/analytics/sc/site-url', { siteUrl }, {
            params: { companyId },
        }).then(response => response.data),
};
