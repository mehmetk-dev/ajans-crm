import api from '../../../api/client';
import type { MaintenanceLogEntry, MaintenanceLogInput } from './maintenanceLog.types';

export const maintenanceLogApi = {
    listCompany: (companyId: string) =>
        api.get<MaintenanceLogEntry[]>(`/staff/companies/${companyId}/maintenance-log`)
            .then(response => response.data),

    listMine: () =>
        api.get<MaintenanceLogEntry[]>('/client/maintenance-log')
            .then(response => response.data),

    create: (companyId: string, input: MaintenanceLogInput) =>
        api.post<MaintenanceLogEntry>(`/staff/companies/${companyId}/maintenance-log`, input)
            .then(response => response.data),

    update: (companyId: string, entryId: string, input: MaintenanceLogInput) =>
        api.put<MaintenanceLogEntry>(
            `/staff/companies/${companyId}/maintenance-log/${entryId}`,
            input
        ).then(response => response.data),

    delete: (companyId: string, entryId: string) =>
        api.delete<void>(`/staff/companies/${companyId}/maintenance-log/${entryId}`)
            .then(response => response.data),
};
