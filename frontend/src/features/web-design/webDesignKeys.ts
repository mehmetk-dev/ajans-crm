export const webDesignKeys = {
    all: ['webDesign'] as const,
    report: (companyId?: string) => [...webDesignKeys.all, 'report', companyId ?? 'me'] as const,
};
