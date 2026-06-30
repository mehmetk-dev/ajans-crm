import { ArrowRight, Eye, Heart, Image as ImageIcon, Instagram, Lock, MessageCircle, Play, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { igApi, instagramKeys } from '../../instagram';
import {
    InstagramPanelSkeleton,
    PostsColumn,
    ReelsColumn,
    StatsColumn,
} from '../../instagram/ui/InstagramPanel';

interface InstagramAnalyticsPanelProps {
    companyId: string;
}

function PanelLink({ to, children }: { to: string; children: string }) {
    return (
        <Link
            to={to}
            className="flex items-center gap-1 text-[11px] text-zinc-500 transition-colors hover:text-zinc-300"
        >
            {children}
        </Link>
    );
}

function LockedInstagramPreview() {
    const metrics = [
        { label: 'Takipçi', value: '12.4K', icon: Users },
        { label: 'Erişim', value: '84K', icon: Eye },
        { label: 'Beğeni', value: '3.8K', icon: Heart },
        { label: 'Yorum', value: '412', icon: MessageCircle },
    ];

    return (
        <div className="relative min-h-[360px] overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0C0C0E]">
            <div className="pointer-events-none absolute inset-0 select-none blur-[5px]" aria-hidden>
                <div className="grid grid-cols-2 gap-3 p-5 lg:grid-cols-4">
                    {metrics.map(({ label, value, icon: Icon }) => (
                        <div key={label} className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4">
                            <div className="mb-4 flex h-8 w-8 items-center justify-center rounded-xl bg-pink-500/10">
                                <Icon className="h-4 w-4 text-pink-300" />
                            </div>
                            <div className="text-2xl font-bold text-white">{value}</div>
                            <div className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                                {label}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="grid gap-4 px-5 pb-5 lg:grid-cols-2">
                    <div className="h-44 rounded-2xl border border-white/[0.06] bg-gradient-to-br from-pink-500/10 to-purple-500/10" />
                    <div className="h-44 rounded-2xl border border-white/[0.06] bg-gradient-to-br from-zinc-700/20 to-zinc-900/20" />
                </div>
            </div>
            <div className="absolute inset-0 bg-[#09090b]/70 backdrop-blur-[2px]" />

            <div className="relative z-10 flex min-h-[360px] items-center justify-center p-6">
                <div className="max-w-sm rounded-2xl border border-pink-500/20 bg-[#101014]/90 p-6 text-center shadow-[0_20px_70px_rgba(200,105,122,0.18)]">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-pink-500/20 bg-pink-500/10">
                        <Instagram className="h-6 w-6 text-pink-300" />
                    </div>
                    <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.05] px-2.5 py-1">
                        <Lock className="h-3 w-3 text-zinc-400" />
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                            Bağlantı Gerekli
                        </span>
                    </div>
                    <h3 className="text-base font-semibold text-white">Instagram analizleri kilitli</h3>
                    <p className="mt-2 text-sm leading-relaxed text-zinc-500">
                        Gerçek takipçi, erişim, Reels ve gönderi verilerini görmek için Instagram bağlantı ekranını açın.
                    </p>
                    <Link
                        to="/client/instagram"
                        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                        Instagram'ı Bağla
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function InstagramAnalyticsPanel({
    companyId,
}: InstagramAnalyticsPanelProps) {
    const { data: status, isLoading } = useQuery({
        queryKey: instagramKeys.status(companyId, '/client/instagram'),
        queryFn: () => igApi.getStatus(companyId, '/client/instagram'),
        staleTime: 5 * 60 * 1000,
    });

    if (isLoading) {
        return <InstagramPanelSkeleton />;
    }

    if (!status?.connected) {
        return <LockedInstagramPreview />;
    }

    return (
        <>
            <StatsColumn companyId={companyId} />
            <div className="mt-6 space-y-6">
                <div>
                    <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Play className="h-4 w-4 text-pink-400" />
                            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                                Reels
                            </h3>
                        </div>
                        <PanelLink to="/client/instagram/reels">Tümünü Gör</PanelLink>
                    </div>
                    <ReelsColumn companyId={companyId} />
                </div>
                <div>
                    <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <ImageIcon className="h-4 w-4 text-pink-400" />
                            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                                Gönderiler
                            </h3>
                        </div>
                        <PanelLink to="/client/instagram/posts">Tümünü Gör</PanelLink>
                    </div>
                    <PostsColumn companyId={companyId} />
                </div>
            </div>
        </>
    );
}
