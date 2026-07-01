import type { ElementType } from 'react';
import { BarChart3, ChevronRight, Image as ImageIcon, Instagram, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { igApi, instagramKeys } from '../../instagram';
import { InstagramDisconnectedState } from '../../instagram/ui/InstagramDisconnectedState';
import { getInstagramDisconnectedCopy } from '../../instagram/ui/instagramDisconnectedCopy';
import {
    InstagramPanelSkeleton,
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
            <ChevronRight className="h-3 w-3" />
        </Link>
    );
}

function MediaDetailPrompt({
    icon: Icon,
    title,
    description,
    to,
}: {
    icon: ElementType;
    title: string;
    description: string;
    to: string;
}) {
    return (
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-500/10">
                        <Icon className="h-5 w-5 text-pink-400" />
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold text-white">{title}</h4>
                        <p className="mt-1 text-xs text-zinc-500">{description}</p>
                    </div>
                </div>
                <Link
                    to={to}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] px-4 py-2 text-xs font-semibold text-zinc-300 transition-colors hover:border-pink-500/30 hover:text-white"
                >
                    Detaylı Gör
                    <ChevronRight className="h-3.5 w-3.5" />
                </Link>
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

    if (!status?.configured) {
        return (
            <div className="rounded-2xl border border-white/[0.06] bg-[#0C0C0E] p-8 text-center">
                <Instagram className="h-8 w-8 text-zinc-500 mx-auto mb-3" />
                <h4 className="text-sm font-semibold text-white">Instagram Entegrasyonu</h4>
                <p className="mt-1 text-xs text-zinc-500">
                    Henüz yapılandırılmamış. Yöneticinizle iletişime geçin.
                </p>
            </div>
        );
    }

    const connected = status?.connected ?? false;

    return (
        <div className="space-y-6">
            <div className="rounded-2xl border border-white/[0.06] bg-[#0C0C0E] p-5">
                <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4 text-pink-400" />
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                            İstatistikler
                        </h3>
                    </div>
                    <PanelLink to="/client/instagram">Detaylı Gör</PanelLink>
                </div>
                {connected ? (
                    <StatsColumn companyId={companyId} />
                ) : (
                    <InstagramDisconnectedState
                        {...getInstagramDisconnectedCopy('/client/instagram')}
                        to="/client/instagram"
                    />
                )}
            </div>

            <div className="rounded-2xl border border-white/[0.06] bg-[#0C0C0E] p-5">
                <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Play className="h-4 w-4 text-pink-400" />
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                            Reels
                        </h3>
                    </div>
                    <PanelLink to="/client/instagram/reels">Tümünü Gör</PanelLink>
                </div>
                {connected ? (
                    <MediaDetailPrompt
                        icon={Play}
                        title="Reels performansı"
                        description="İzlenme, beğeni, yorum ve paylaşım detaylarını açın."
                        to="/client/instagram/reels"
                    />
                ) : (
                    <InstagramDisconnectedState
                        {...getInstagramDisconnectedCopy('/client/instagram/reels')}
                        to="/client/instagram/reels"
                    />
                )}
            </div>

            <div className="rounded-2xl border border-white/[0.06] bg-[#0C0C0E] p-5">
                <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <ImageIcon className="h-4 w-4 text-pink-400" />
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                            Gönderiler
                        </h3>
                    </div>
                    <PanelLink to="/client/instagram/posts">Tümünü Gör</PanelLink>
                </div>
                {connected ? (
                    <MediaDetailPrompt
                        icon={ImageIcon}
                        title="Gönderi performansı"
                        description="Gönderi erişimi, etkileşim ve içerik detaylarını açın."
                        to="/client/instagram/posts"
                    />
                ) : (
                    <InstagramDisconnectedState
                        {...getInstagramDisconnectedCopy('/client/instagram/posts')}
                        to="/client/instagram/posts"
                    />
                )}
            </div>
        </div>
    );
}
