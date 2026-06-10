import { describe, expect, it } from 'vitest';
import { prProjectFormSchema } from './prProject.schema';

describe('prProjectFormSchema', () => {
    it('trims values and removes blank optional fields', () => {
        const result = prProjectFormSchema.parse({
            name: '  Lansman  ',
            companyId: '',
            responsibleId: '',
            purpose: '  ',
            startDate: '',
            endDate: '',
            notes: '',
            memberIds: [],
            phases: [{
                name: '  Hazırlık  ',
                assignedToId: '',
                startDate: '',
                endDate: '',
                notes: '',
            }],
        });

        expect(result.name).toBe('Lansman');
        expect(result.companyId).toBeUndefined();
        expect(result.phases[0].name).toBe('Hazırlık');
    });

    it('requires at least one named phase', () => {
        const result = prProjectFormSchema.safeParse({
            name: 'Lansman',
            companyId: '',
            responsibleId: '',
            purpose: '',
            startDate: '',
            endDate: '',
            notes: '',
            memberIds: [],
            phases: [],
        });

        expect(result.success).toBe(false);
    });
});
