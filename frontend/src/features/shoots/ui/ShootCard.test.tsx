import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { ShootResponse } from '../api/shoot.types';
import { ShootCard } from './ShootCard';

function buildShoot(overrides: Partial<ShootResponse> = {}): ShootResponse {
    return {
        id: 'shoot-1',
        companyId: 'company-1',
        companyName: 'Acme',
        title: 'Ürün Çekimi',
        description: null,
        shootDate: '2026-06-13T10:00:00Z',
        shootTime: '10:00',
        location: 'Stüdyo',
        status: 'PLANNED',
        photographerId: 'user-1',
        photographerName: 'Merve Foto',
        photographerAvatarUrl: '/api/settings/avatar/user-1/avatar.png',
        notes: null,
        createdById: 'user-2',
        createdByName: 'Admin',
        participants: [],
        equipment: [],
        linkedContentCount: 0,
        createdAt: '2026-06-01T00:00:00Z',
        ...overrides,
    };
}

describe('ShootCard', () => {
    it('shows the photographer profile photo when available', () => {
        render(<ShootCard shoot={buildShoot()} onClick={vi.fn()} />);

        const image = screen.getByRole('img', { name: 'Merve Foto' });
        expect(image).toHaveAttribute('src', '/api/settings/avatar/user-1/avatar.png');
    });
});
