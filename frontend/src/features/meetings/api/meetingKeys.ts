export const meetingKeys = {
    all: ['meetings'] as const,
    staffLists: () => [...meetingKeys.all, 'staff', 'list'] as const,
    staffList: (companyId?: string, size = 100) =>
        [...meetingKeys.staffLists(), companyId ?? 'ALL', size] as const,
    detail: (id: string) => [...meetingKeys.all, 'detail', id] as const,
};
