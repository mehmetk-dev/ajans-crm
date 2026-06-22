import type { LucideIcon } from 'lucide-react';
import { ChevronRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface AnalyticsSectionProps {
    title: string;
    icon: LucideIcon;
    iconClassName: string;
    children: ReactNode;
    actionLabel?: string;
    actionTo?: string;
}

export function AnalyticsSection({
    title,
    icon: Icon,
    iconClassName,
    children,
    actionLabel,
    actionTo,
}: AnalyticsSectionProps) {
    return (
        <section className="[content-visibility:auto] [contain-intrinsic-size:auto_320px]">
            <div className="mb-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <Icon className={`h-4 w-4 ${iconClassName}`} />
                    <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-300">
                        {title}
                    </h2>
                </div>
                {actionLabel && actionTo && (
                    <Link
                        to={actionTo}
                        className="flex items-center gap-1 text-[11px] text-zinc-500 transition-colors hover:text-zinc-300"
                    >
                        {actionLabel}
                        <ChevronRight className="h-3 w-3" />
                    </Link>
                )}
            </div>
            {children}
        </section>
    );
}
