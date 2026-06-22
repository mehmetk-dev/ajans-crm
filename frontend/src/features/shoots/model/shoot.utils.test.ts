import { describe, expect, it } from 'vitest';
import type { ShootResponse } from '../api/shoot.types';
import {
    getShootDisplayStatus,
    groupShoots,
    toCreateShootInput,
} from './shoot.utils';

describe('shoot utils', () => {
    it('maps and trims form values for the API', () => {
        const input = toCreateShootInput({
            companyId: 'company-1',
            title: '  Ürün çekimi  ',
            description: '  Yeni seri  ',
            shootDate: '2026-06-12',
            shootTime: '10:30',
            location: '  Stüdyo  ',
            photographerId: 'user-1',
            notes: '',
            participants: [
                { userId: 'user-2', roleInShoot: '  Model  ' },
                { userId: '', roleInShoot: 'Yok' },
            ],
            equipment: [
                { name: '  Kamera  ', quantity: 2, notes: '  Yedek pil  ' },
                { name: '', quantity: 1, notes: '' },
            ],
        });

        expect(input).toMatchObject({
            companyId: 'company-1',
            title: 'Ürün çekimi',
            description: 'Yeni seri',
            shootTime: '10:30',
            location: 'Stüdyo',
            participants: [{ userId: 'user-2', roleInShoot: 'Model' }],
            equipment: [{ name: 'Kamera', quantity: 2, notes: 'Yedek pil' }],
        });
        expect(input.shootDate).toBe(new Date('2026-06-12T00:00:00').toISOString());
    });

    it('marks only past planned shoots as overdue', () => {
        const now = new Date('2026-06-09T12:00:00Z');

        expect(getShootDisplayStatus(buildShoot({
            shootDate: '2026-06-08T00:00:00Z',
        }), now)).toBe('OVERDUE');
        expect(getShootDisplayStatus(buildShoot({
            shootDate: '2026-06-10T00:00:00Z',
        }), now)).toBe('PLANNED');
        expect(getShootDisplayStatus(buildShoot({
            status: 'COMPLETED',
            shootDate: '2026-06-08T00:00:00Z',
        }), now)).toBe('COMPLETED');
    });

    it('groups shoots by their display status', () => {
        const grouped = groupShoots([
            buildShoot({ id: 'planned', shootDate: '2999-01-01T00:00:00Z' }),
            buildShoot({ id: 'completed', status: 'COMPLETED' }),
            buildShoot({ id: 'cancelled', status: 'CANCELLED' }),
        ]);

        expect(grouped.PLANNED.map(shoot => shoot.id)).toEqual(['planned']);
        expect(grouped.COMPLETED.map(shoot => shoot.id)).toEqual(['completed']);
        expect(grouped.CANCELLED.map(shoot => shoot.id)).toEqual(['cancelled']);
    });
});

function buildShoot(overrides: Partial<ShootResponse> = {}): ShootResponse {
    return {
        id: 'shoot-1',
        companyId: 'company-1',
        companyName: 'Şirket',
        title: 'Çekim',
        description: null,
        shootDate: null,
        shootTime: null,
        location: null,
        status: 'PLANNED',
        photographerId: null,
        photographerName: null,
        photographerAvatarUrl: null,
        notes: null,
        createdById: 'user-1',
        createdByName: 'Kullanıcı',
        participants: [],
        equipment: [],
        linkedContentCount: 0,
        createdAt: '2026-06-09T10:00:00Z',
        ...overrides,
    };
}
