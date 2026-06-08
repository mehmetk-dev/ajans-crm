import { z } from 'zod';
import { MAINTENANCE_CATEGORIES, type MaintenanceLogInput } from '../api/maintenanceLog.types';

export const maintenanceLogSchema = z.object({
    title: z.string().trim().min(1, 'Başlık zorunludur').max(255, 'Başlık en fazla 255 karakter olabilir'),
    description: z.string().trim().max(10_000, 'Açıklama en fazla 10000 karakter olabilir').optional(),
    category: z.enum(MAINTENANCE_CATEGORIES),
    performedAt: z.string().datetime({ offset: true }),
});

export function parseMaintenanceLogInput(input: MaintenanceLogInput): MaintenanceLogInput {
    const parsed = maintenanceLogSchema.parse(input);
    return {
        ...parsed,
        description: parsed.description || undefined,
    };
}
