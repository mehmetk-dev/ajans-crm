import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import RouteBoundary, {
    RouteLoadingFallback,
} from './RouteBoundary';
import {
    consumeRouteAutoReloadAttempt,
    isRouteChunkLoadError,
} from './routeAutoReload';

function BrokenRoute(): never {
    throw new Error('unexpected render failure');
}

function StaleChunkRoute(): never {
    throw new TypeError('Failed to fetch dynamically imported module: /assets/SearchConsoleDetailPage-old.js');
}

function createStorage(): Storage {
    const entries = new Map<string, string>();

    return {
        get length() {
            return entries.size;
        },
        clear: vi.fn(() => entries.clear()),
        getItem: vi.fn((key: string) => entries.get(key) ?? null),
        key: vi.fn((index: number) => Array.from(entries.keys())[index] ?? null),
        removeItem: vi.fn((key: string) => entries.delete(key)),
        setItem: vi.fn((key: string, value: string) => {
            entries.set(key, value);
        }),
    };
}

describe('RouteBoundary', () => {
    afterEach(() => {
        window.sessionStorage.clear();
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

    it('auto-recovers from stale route chunks before showing the hard failure card', () => {
        vi.spyOn(console, 'error').mockImplementation(() => undefined);
        vi.spyOn(window, 'setTimeout').mockImplementation(() => 0);

        render(
            <MemoryRouter initialEntries={['/client/search-console?connected=true']}>
                <RouteBoundary>
                    <StaleChunkRoute />
                </RouteBoundary>
            </MemoryRouter>,
        );

        expect(screen.getByText('Sayfa yenileniyor...')).toBeInTheDocument();
        expect(screen.queryByText('Sayfa yüklenemedi')).not.toBeInTheDocument();
    });

    it('identifies stale dynamic import errors as recoverable route chunk failures', () => {
        expect(isRouteChunkLoadError(new TypeError('Failed to fetch dynamically imported module: /assets/SearchConsoleDetailPage-abc.js'))).toBe(true);
        expect(isRouteChunkLoadError(new Error('Loading chunk 42 failed'))).toBe(true);
        expect(isRouteChunkLoadError(new Error('unexpected render failure'))).toBe(false);
    });

    it('uses a one-shot auto reload budget per route when an OAuth return lands on a stale chunk', () => {
        const storage = createStorage();
        const error = new TypeError('Failed to fetch dynamically imported module: /assets/InstagramDetailPage-old.js');
        const href = 'https://crm.fogistanbul.com/client/instagram?connected=true';

        expect(consumeRouteAutoReloadAttempt(error, href, storage, 1_000)).toBe(true);
        expect(consumeRouteAutoReloadAttempt(error, href, storage, 2_000)).toBe(false);
        expect(consumeRouteAutoReloadAttempt(error, href, storage, 62_000)).toBe(true);
    });
});
