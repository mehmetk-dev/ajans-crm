import api from '../../../api/client';
import type {
    IgOverviewResponse,
    IgPostRow,
    IgReelRow,
    IgStatusResponse,
} from '../instagram.types';

export const igApi = {
    getStatus: (companyId: string, returnPath?: string) =>
        api.get<IgStatusResponse>('/client/analytics/ig/status', {
            params: { companyId, returnPath }
        }).then(r => r.data),

    getOverview: (companyId: string, startDate?: string, endDate?: string) =>
        api.get<IgOverviewResponse>('/client/analytics/ig/overview', {
            params: { companyId, startDate, endDate }
        }).then(r => r.data),

    disconnect: (companyId: string) =>
        api.delete('/client/analytics/ig/disconnect', {
            params: { companyId }
        }).then(r => r.data),

    getReels: (companyId: string, limit = 20) =>
        api.get<IgReelRow[]>('/client/analytics/ig/reels', {
            params: { companyId, limit }
        }).then(r => r.data),

    getPosts: (companyId: string, limit = 20) =>
        api.get<IgPostRow[]>('/client/analytics/ig/posts', {
            params: { companyId, limit }
        }).then(r => r.data),
};
