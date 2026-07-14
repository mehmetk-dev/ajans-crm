import { AlertTriangle, BarChart3, ChevronRight, Eye, Heart, Image as ImageIcon, Instagram, Loader2, MessageCircle, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { igApi, instagramKeys, type IgPostRow, type IgReelRow } from '../../instagram';
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

type PreviewItem = {
    id: string;
    caption: string;
    imageUrl: string;
    likeCount: number;
    commentsCount: number;
    views: number;
    isReel: boolean;
};

function reelPreviewItem(reel: IgReelRow): PreviewItem {
    return {
        id: reel.id,
        caption: reel.caption,
        imageUrl: reel.thumbnailUrl,
        likeCount: reel.likeCount,
        commentsCount: reel.commentsCount,
        views: reel.plays,
        isReel: true,
    };
}

function postPreviewItem(post: IgPostRow): PreviewItem {
    return {
        id: post.id,
        caption: post.caption,
        imageUrl: post.mediaUrl,
        likeCount: post.likeCount,
        commentsCount: post.commentsCount,
        views: post.impressions,
        isReel: false,
    };
}

function MediaPreviewSection({
    title,
    emptyText,
    to,
    items,
}: {
    title: string;
    emptyText: string;
    to: string;
    items: PreviewItem[];
}) {
    if (items.length === 0) {
        return (
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 text-center">
                <ImageIcon className="mx-auto mb-2 h-6 w-6 text-zinc-700" />
                <p className="text-xs text-zinc-500">{emptyText}</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {items.map(item => (
                <Link
                    key={item.id}
                    to={to}
                    className="group overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.02] transition-colors hover:border-pink-500/30"
                >
                    <div className="relative aspect-[4/5] overflow-hidden bg-[#111115]">
                        {item.imageUrl ? (
                            <img
                                src={item.imageUrl}
                                alt=""
                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                referrerPolicy="no-referrer"
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center">
                                <ImageIcon className="h-8 w-8 text-white/15" />
                            </div>
                        )}
                        <div className="absolute left-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white">
                            {item.isReel ? <Play className="h-3.5 w-3.5 fill-white" /> : <ImageIcon className="h-3.5 w-3.5" />}
                        </div>
                    </div>
                    <div className="space-y-2 p-3">
                        <p className="line-clamp-2 min-h-8 text-xs font-medium leading-4 text-zinc-300">
                            {item.caption || title}
                        </p>
                        <div className="flex items-center gap-3 text-[11px] font-semibold text-zinc-500">
                            <span className="flex items-center gap-1">
                                <Eye className="h-3 w-3 text-cyan-300" />
                                {item.views}
                            </span>
                            <span className="flex items-center gap-1">
                                <Heart className="h-3 w-3 text-pink-400" />
                                {item.likeCount}
                            </span>
                            <span className="flex items-center gap-1">
                                <MessageCircle className="h-3 w-3 text-zinc-400" />
                                {item.commentsCount}
                            </span>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    );
}

function MediaPreviewLoading({ label }: { label: string }) {
    return (
        <div className="flex items-center justify-center gap-2 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 text-xs text-zinc-500">
            <Loader2 className="h-4 w-4 animate-spin text-pink-400" />
            {label} verileri hazırlanıyor
        </div>
    );
}

function MediaPreviewError({ label }: { label: string }) {
    return (
        <div className="flex items-center justify-center gap-2 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-6 text-xs text-amber-100">
            <AlertTriangle className="h-4 w-4 text-amber-300" />
            {label} verileri şu anda alınamıyor. Son snapshot korunuyor.
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
    const reelsQuery = useQuery<IgReelRow[]>({
        queryKey: [...instagramKeys.reels(companyId), 'preview', 3],
        queryFn: () => igApi.getReels(companyId, 3),
        enabled: status?.connected === true,
        staleTime: 5 * 60 * 1000,
    });
    const postsQuery = useQuery<IgPostRow[]>({
        queryKey: [...instagramKeys.posts(companyId), 'preview', 3],
        queryFn: () => igApi.getPosts(companyId, 3),
        enabled: status?.connected === true,
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
    if (!connected) {
        return (
            <div className="rounded-2xl border border-white/[0.06] bg-[#0C0C0E] p-5">
                <InstagramDisconnectedState
                    {...getInstagramDisconnectedCopy('/client/instagram')}
                    to="/client/instagram"
                />
            </div>
        );
    }
    const reelPreview = (reelsQuery.data ?? []).slice(0, 3).map(reelPreviewItem);
    const postPreview = (postsQuery.data ?? []).slice(0, 3).map(postPreviewItem);

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
                {connected && reelsQuery.data === undefined && !reelsQuery.isError ? (
                    <MediaPreviewLoading label="Reels" />
                ) : connected && reelsQuery.isError ? (
                    <MediaPreviewError label="Reels" />
                ) : connected ? (
                    <MediaPreviewSection
                        title="Reels"
                        emptyText="Bu ay henüz reels paylaşılmadı"
                        to="/client/instagram/reels"
                        items={reelPreview}
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
                {connected && postsQuery.data === undefined && !postsQuery.isError ? (
                    <MediaPreviewLoading label="Gönderi" />
                ) : connected && postsQuery.isError ? (
                    <MediaPreviewError label="Gönderi" />
                ) : connected ? (
                    <MediaPreviewSection
                        title="Gönderi"
                        emptyText="Bu ay henüz gönderi paylaşılmadı"
                        to="/client/instagram/posts"
                        items={postPreview}
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
