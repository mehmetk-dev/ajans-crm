import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DeferredPanel } from './DeferredPanel';

let intersectionCallback: IntersectionObserverCallback;
const disconnect = vi.fn();
const observe = vi.fn();

class IntersectionObserverMock {
    constructor(callback: IntersectionObserverCallback) {
        intersectionCallback = callback;
    }

    observe = observe;
    disconnect = disconnect;
    unobserve = vi.fn();
    takeRecords = vi.fn(() => []);
    root = null;
    rootMargin = '';
    thresholds = [];
}

describe('DeferredPanel', () => {
    beforeEach(() => {
        vi.stubGlobal('IntersectionObserver', IntersectionObserverMock);
        observe.mockClear();
        disconnect.mockClear();
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('renders panel content only after it approaches the viewport', () => {
        render(
            <DeferredPanel>
                <div>Heavy analytics panel</div>
            </DeferredPanel>,
        );

        expect(screen.queryByText('Heavy analytics panel')).not.toBeInTheDocument();
        expect(observe).toHaveBeenCalledOnce();

        act(() => {
            intersectionCallback(
                [{ isIntersecting: true } as IntersectionObserverEntry],
                {} as IntersectionObserver,
            );
        });

        expect(screen.getByText('Heavy analytics panel')).toBeInTheDocument();
        expect(disconnect).toHaveBeenCalled();
    });

    it('renders eager content immediately', () => {
        render(
            <DeferredPanel eager>
                <div>Priority panel</div>
            </DeferredPanel>,
        );

        expect(screen.getByText('Priority panel')).toBeInTheDocument();
        expect(observe).not.toHaveBeenCalled();
    });
});
