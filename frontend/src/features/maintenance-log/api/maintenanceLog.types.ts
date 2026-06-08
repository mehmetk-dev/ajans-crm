export const MAINTENANCE_CATEGORIES = [
    'update',
    'fix',
    'feature',
    'security',
    'content',
    'seo',
    'other',
] as const;

export type MaintenanceCategory = typeof MAINTENANCE_CATEGORIES[number];

export interface MaintenanceLogEntry {
    id: string;
    companyId: string;
    title: string;
    description?: string | null;
    category: MaintenanceCategory;
    performedAt: string;
    performedById?: string | null;
    performedByName?: string | null;
    createdAt: string;
    updatedAt?: string | null;
}

export interface MaintenanceLogInput {
    title: string;
    description?: string;
    category: MaintenanceCategory;
    performedAt: string;
}
