import { Calendar, Camera } from 'lucide-react';
import type { ContentPlanResponse } from '../api/contentPlan.types';
import { platformPresentation, statusPresentation } from './contentPlanPresentation';

export function ContentPlanCard({
    plan,
    compact = false,
    onClick,
}: {
    plan: ContentPlanResponse;
    compact?: boolean;
    onClick: () => void;
}) {
    const platform = platformPresentation[plan.platform];
    const status = statusPresentation[plan.status];
    const PlatformIcon = platform.icon;
    const StatusIcon = status.icon;
    return (
        <button onClick={onClick}
            className={`w-full text-left rounded-2xl border border-white/[0.06] bg-[#0C0C0E] transition-colors hover:border-violet-500/25 ${compact ? 'p-3' : 'p-5'}`}>
            <div className="flex items-start gap-3">
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${platform.className}`}>
                    <PlatformIcon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                        <h3 className="line-clamp-2 text-sm font-semibold text-white">{plan.title}</h3>
                        <span className={`flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-[9px] font-semibold ${status.className}`}>
                            <StatusIcon className="h-2.5 w-2.5" />{status.label}
                        </span>
                    </div>
                    {!compact && plan.direction && (
                        <p className="mt-2 line-clamp-2 text-[11px] text-zinc-500">{plan.direction}</p>
                    )}
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] text-zinc-600">
                        <span>{platform.label}</span>
                        <span>{plan.authorName}</span>
                        {plan.plannedDate && (
                            <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(plan.plannedDate).toLocaleDateString('tr-TR')}
                            </span>
                        )}
                        {plan.shootId && (
                            <span className="flex items-center gap-1 text-emerald-500">
                                <Camera className="h-3 w-3" /> Çekim bağlı
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </button>
    );
}
