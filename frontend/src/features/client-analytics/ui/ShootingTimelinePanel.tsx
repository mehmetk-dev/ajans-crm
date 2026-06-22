import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    AlertTriangle,
    Camera,
    CheckCircle2,
    ChevronRight,
    Clock,
    Loader2,
    MapPin,
    XCircle,
    type LucideIcon,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
    shootApi,
    shootKeys,
    type ShootResponse,
} from '../../shoots';

type DatedShoot = ShootResponse & { shootDate: string };

interface ShootSummary {
    tab: string;
    count: number;
    label: string;
    icon: LucideIcon;
    className: string;
}

function isOverdue(shoot: ShootResponse, now: number): shoot is DatedShoot {
    if (shoot.status !== 'PLANNED' || !shoot.shootDate) return false;
    const shootDay = new Date(shoot.shootDate);
    shootDay.setHours(23, 59, 59, 999);
    return shootDay.getTime() < now;
}

function isUpcoming(shoot: ShootResponse, now: number): shoot is DatedShoot {
    if (shoot.status !== 'PLANNED' || !shoot.shootDate) return false;
    const shootDay = new Date(shoot.shootDate);
    shootDay.setHours(23, 59, 59, 999);
    return shootDay.getTime() >= now;
}

export default function ShootingTimelinePanel() {
    const navigate = useNavigate();
    const { data, dataUpdatedAt, isLoading } = useQuery({
        queryKey: shootKeys.list('client', 0, 50),
        queryFn: () => shootApi.listClient(0, 50),
        staleTime: 5 * 60_000,
    });

    const { upcoming, summaries } = useMemo(() => {
        const shoots = data?.content ?? [];
        const overdue = shoots.filter(shoot => isOverdue(shoot, dataUpdatedAt));
        const nextShoots = shoots
            .filter(shoot => isUpcoming(shoot, dataUpdatedAt))
            .sort(
                (left, right) =>
                    new Date(left.shootDate).getTime() -
                    new Date(right.shootDate).getTime(),
            );

        const completed = shoots.filter(shoot => shoot.status === 'COMPLETED');
        const cancelled = shoots.filter(shoot => shoot.status === 'CANCELLED');
        const items: Array<ShootSummary | false> = [
            overdue.length > 0 && {
                tab: 'OVERDUE',
                count: overdue.length,
                label: 'gecikmiş',
                icon: AlertTriangle,
                className:
                    'border-amber-500/20 bg-amber-500/10 text-amber-400 hover:bg-amber-500/15',
            },
            completed.length > 0 && {
                tab: 'COMPLETED',
                count: completed.length,
                label: 'tamamlanan',
                icon: CheckCircle2,
                className:
                    'border-emerald-500/20 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/15',
            },
            cancelled.length > 0 && {
                tab: 'CANCELLED',
                count: cancelled.length,
                label: 'İptal',
                icon: XCircle,
                className:
                    'border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/15',
            },
        ];

        return {
            upcoming: nextShoots,
            summaries: items.filter((item): item is ShootSummary => Boolean(item)),
        };
    }, [data?.content, dataUpdatedAt]);

    if (isLoading) {
        return (
            <div className="flex min-h-40 items-center justify-center rounded-2xl border border-white/[0.06] bg-[#0C0C0E]">
                <Loader2 className="h-5 w-5 animate-spin text-pink-400" />
            </div>
        );
    }

    return (
        <div className="rounded-2xl border border-white/[0.06] bg-[#0C0C0E] p-6">
            {upcoming.length === 0 ? (
                <div className="py-6 text-center">
                    <Camera className="mx-auto mb-2 h-10 w-10 text-zinc-700" />
                    <p className="text-sm text-zinc-500">Yaklaşan çekim bulunmuyor</p>
                </div>
            ) : (
                <div className="divide-y divide-white/[0.04]">
                    {upcoming.map(shoot => {
                        const date = new Date(shoot.shootDate);
                        const month = date
                            .toLocaleDateString('tr-TR', { month: 'short' })
                            .replace('.', '');

                        return (
                            <div key={shoot.id} className="flex items-center gap-3 py-2.5">
                                <div className="flex min-w-[60px] shrink-0 items-center gap-1.5">
                                    <span className="text-lg font-bold leading-none text-white">
                                        {date.getDate()}
                                    </span>
                                    <span className="text-[10px] font-semibold uppercase text-[#C8697A]">
                                        {month}
                                    </span>
                                </div>
                                <p className="flex-1 truncate text-[12px] font-medium text-white">
                                    {shoot.title}
                                </p>
                                <div className="flex shrink-0 items-center gap-3">
                                    {shoot.shootTime && (
                                        <span className="flex items-center gap-1 text-[11px] text-zinc-500">
                                            <Clock className="h-3 w-3" />
                                            {shoot.shootTime.slice(0, 5)}
                                        </span>
                                    )}
                                    {shoot.location && (
                                        <span className="hidden items-center gap-1 text-[11px] text-zinc-500 sm:flex">
                                            <MapPin className="h-3 w-3" />
                                            <span className="max-w-[100px] truncate">
                                                {shoot.location}
                                            </span>
                                        </span>
                                    )}
                                    <span className="rounded-full border border-violet-500/20 bg-violet-500/10 px-2 py-0.5 text-[9px] font-semibold text-violet-400">
                                        Planlandı
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {summaries.length > 0 && (
                <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-white/[0.04] pt-4">
                    <span className="mr-1 text-[10px] uppercase tracking-wider text-zinc-600">
                        Geçmiş:
                    </span>
                    {summaries.map(
                        ({ tab, count, label, icon: Icon, className }) => (
                            <button
                                key={tab}
                                onClick={() => navigate(`/client/shoots?tab=${tab}`)}
                                className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-[11px] font-semibold transition-colors ${className}`}
                            >
                                <Icon className="h-3 w-3" />
                                {count} {label}
                                <ChevronRight className="h-3 w-3 opacity-60" />
                            </button>
                        ),
                    )}
                </div>
            )}
        </div>
    );
}
