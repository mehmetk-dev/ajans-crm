import api from '../../../api/client';
import type { PageSpeedReport } from '../webDesign.types';

export const webDesignApi = {
    // Client (own company)
    getMyPageSpeed: (refresh = false) =>
        api.get<PageSpeedReport>('/client/pagespeed', { params: { refresh } }).then(r => r.data),
    updateMyWebsite: (websiteUrl: string) =>
        api.put<PageSpeedReport>('/client/pagespeed/website', { websiteUrl }).then(r => r.data),

    // Staff/admin (any company)
    getCompanyPageSpeed: (companyId: string, refresh = false) =>
        api.get<PageSpeedReport>(`/staff/companies/${companyId}/pagespeed`, { params: { refresh } }).then(r => r.data),
};
