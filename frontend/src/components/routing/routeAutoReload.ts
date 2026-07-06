const ROUTE_AUTO_RELOAD_STORAGE_KEY = 'crm.route-auto-reload-attempts';
const ROUTE_AUTO_RELOAD_TTL_MS = 60_000;

function getErrorText(error: unknown): string {
    if (error instanceof Error) {
        return `${error.name} ${error.message}`.trim();
    }

    return String(error);
}

function getRouteReloadKey(href: string): string {
    try {
        const url = new URL(href);
        return `${url.pathname}${url.search}`;
    } catch {
        return href;
    }
}

export function isRouteChunkLoadError(error: unknown): boolean {
    const text = getErrorText(error).toLowerCase();

    return [
        'failed to fetch dynamically imported module',
        'error loading dynamically imported module',
        'importing a module script failed',
        'loading chunk',
        'chunk load failed',
        'chunkloaderror',
    ].some(fragment => text.includes(fragment));
}

export function consumeRouteAutoReloadAttempt(
    error: unknown,
    href: string,
    storage: Storage | undefined = typeof window === 'undefined' ? undefined : window.sessionStorage,
    now: number = Date.now(),
): boolean {
    if (!isRouteChunkLoadError(error) || !storage) {
        return false;
    }

    const routeKey = getRouteReloadKey(href);

    try {
        const attempts = JSON.parse(storage.getItem(ROUTE_AUTO_RELOAD_STORAGE_KEY) ?? '{}') as Record<string, number>;
        const lastAttemptAt = attempts[routeKey];

        if (typeof lastAttemptAt === 'number' && now - lastAttemptAt < ROUTE_AUTO_RELOAD_TTL_MS) {
            return false;
        }

        storage.setItem(ROUTE_AUTO_RELOAD_STORAGE_KEY, JSON.stringify({
            ...attempts,
            [routeKey]: now,
        }));
        return true;
    } catch {
        return false;
    }
}
