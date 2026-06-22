import { Suspense, useEffect, useRef, useState, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

interface DeferredPanelProps {
    children: ReactNode;
    minHeight?: number;
    eager?: boolean;
}

interface PanelPlaceholderProps {
    minHeight?: number;
}

export function PanelPlaceholder({ minHeight = 240 }: PanelPlaceholderProps) {
    return (
        <div
            className="flex items-center justify-center rounded-2xl border border-white/[0.06] bg-[#0C0C0E]"
            style={{ minHeight }}
            aria-label="Panel yükleniyor"
        >
            <Loader2 className="h-5 w-5 animate-spin text-zinc-600" />
        </div>
    );
}

export function DeferredPanel({
    children,
    minHeight = 240,
    eager = false,
}: DeferredPanelProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [shouldRender, setShouldRender] = useState(
        () => eager || typeof IntersectionObserver === 'undefined',
    );

    useEffect(() => {
        if (shouldRender) return;

        const element = containerRef.current;
        if (!element || typeof IntersectionObserver === 'undefined') return;

        const observer = new IntersectionObserver(
            entries => {
                if (entries.some(entry => entry.isIntersecting)) {
                    setShouldRender(true);
                    observer.disconnect();
                }
            },
            { rootMargin: '600px 0px' },
        );

        observer.observe(element);
        return () => observer.disconnect();
    }, [shouldRender]);

    return (
        <div
            ref={containerRef}
            style={{ minHeight: shouldRender ? undefined : minHeight }}
            className="[content-visibility:auto]"
        >
            {shouldRender ? (
                <Suspense fallback={<PanelPlaceholder minHeight={minHeight} />}>
                    {children}
                </Suspense>
            ) : (
                <PanelPlaceholder minHeight={minHeight} />
            )}
        </div>
    );
}
