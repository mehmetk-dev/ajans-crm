export const maintenanceLogKeys = {
    all: ['maintenance-log'] as const,
    company: (companyId: string) => [...maintenanceLogKeys.all, 'company', companyId] as const,
    mine: () => [...maintenanceLogKeys.all, 'mine'] as const,
};
