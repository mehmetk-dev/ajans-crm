import { describe, expect, it } from 'vitest';
import { parseMaintenanceLogInput } from './maintenanceLog.schema';

describe('parseMaintenanceLogInput', () => {
    it('trims text and removes an empty description', () => {
        expect(parseMaintenanceLogInput({
            title: '  SSL yenilendi  ',
            description: '   ',
            category: 'security',
            performedAt: '2026-06-09T10:00:00.000Z',
        })).toEqual({
            title: 'SSL yenilendi',
            description: undefined,
            category: 'security',
            performedAt: '2026-06-09T10:00:00.000Z',
        });
    });

    it('rejects an empty title', () => {
        expect(() => parseMaintenanceLogInput({
            title: ' ',
            category: 'update',
            performedAt: '2026-06-09T10:00:00.000Z',
        })).toThrow('Başlık zorunludur');
    });
});
