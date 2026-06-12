import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import RouteBoundary, { RouteLoadingFallback } from './RouteBoundary';

function BrokenRoute(): never {
    throw new Error('chunk load failed');
}

describe('RouteBoundary', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('renders a consistent route loading state', () => {
        render(<RouteLoadingFallback />);

        expect(screen.getByText('Sayfa yükleniyor...')).toBeInTheDocument();
    });

    it('renders a reload action when a route throws', () => {
        vi.spyOn(console, 'error').mockImplementation(() => undefined);

        render(
            <MemoryRouter>
                <RouteBoundary>
                    <BrokenRoute />
                </RouteBoundary>
            </MemoryRouter>,
        );

        expect(screen.getByText('Sayfa yüklenemedi')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Yeniden Yükle' }))
            .toBeInTheDocument();
    });
});
