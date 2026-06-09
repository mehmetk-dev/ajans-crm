export const companyKeys = {
    all: ['companies'] as const,
    adminList: () => [...companyKeys.all, 'admin'] as const,
    staffList: () => [...companyKeys.all, 'staff'] as const,
    detail: (scope: 'admin' | 'staff', companyId: string) =>
        [...companyKeys.all, scope, companyId] as const,
    permissions: (companyId: string, userId: string) =>
        [...companyKeys.all, companyId, 'permissions', userId] as const,
    team: () => [...companyKeys.all, 'my-team'] as const,
    staffMembers: () => [...companyKeys.all, 'agency-staff'] as const,
};
