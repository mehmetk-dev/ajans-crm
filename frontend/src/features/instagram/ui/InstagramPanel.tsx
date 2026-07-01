import { useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    Instagram, Users, Eye, Heart, MessageCircle,
    Loader2, CheckCircle2, ChevronRight, ChevronLeft,
    Image as ImageIcon, Play, Activity, UserPlus, Calendar, Share2
} from 'lucide-react';
import { igApi } from '../api/instagramApi';
import { instagramKeys } from '../instagramKeys';
import { formatInstagramMetric } from '../model/instagram.utils';
import { InstagramDisconnectedState } from './InstagramDisconnectedState';
import { getInstagramDisconnectedCopy } from './instagramDisconnectedCopy';
import type {
    IgOverviewResponse,
    IgPostRow,
    IgReelRow,
    IgStatusResponse,
} from '../instagram.types';

interface Props {
    companyId: string;
}

const fmtNum = formatInstagramMetric;

export function StatsColumn({ companyId }: { companyId: string }) {
    const { data: overview } = useQuery<IgOverviewResponse>({
        queryKey: instagramKeys.overview(companyId),
        queryFn: () => igApi.getOverview(companyId, '30daysAgo', 'today'),
        staleTime: 5 * 60 * 1000,
    });

    const data = overview;
    const growthRate = data && data.followersCount > 0
        ? ((data.followersGained - data.followersLost) / data.followersCount * 100).toFixed(1) : '0';
    const engagementRate = data && data.followersCount > 0
        ? ((data.totalLikes + data.totalComments) / data.followersCount * 100).toFixed(1) : '0';

    if (!data) {
        return (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-[#0C0C0E] border border-white/[0.06] rounded-2xl p-5 animate-pulse h-28" />
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

            {/* Toplam Takipçi */}
            <div className="bg-[#0C0C0E] border border-white/[0.06] rounded-2xl p-5
                hover:border-[#C8697A]/30 transition-colors flex flex-col gap-3">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#C8697A]/10 flex items-center justify-center">
                        <Users className="w-4 h-4 text-[#C8697A]" />
                    </div>
                    <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Toplam Takipçi</span>
                </div>
                <div className="text-2xl font-bold text-white">{fmtNum(data.followersCount)}</div>
                <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-zinc-500">Son 30 Gün</span>
                </div>
            </div>

            {/* 1 Aylık Etkileşim */}
            <div className="bg-[#0C0C0E] border border-white/[0.06] rounded-2xl p-5
                hover:border-[#C8697A]/30 transition-colors flex flex-col gap-3">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                        <Activity className="w-4 h-4 text-emerald-400" />
                    </div>
                    <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">1 Aylık Etkileşim</span>
                </div>
                <div className="text-2xl font-bold text-white">{fmtNum(data.totalLikes + data.totalComments)}</div>
                <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-[10px] text-rose-400">
                        <Heart className="w-3 h-3" />{fmtNum(data.totalLikes)}
                    </span>
                    <span className="text-zinc-700">·</span>
                    <span className="flex items-center gap-1 text-[10px] text-violet-400">
                        <MessageCircle className="w-3 h-3" />{fmtNum(data.totalComments)}
                    </span>
                </div>
            </div>

            {/* Gelen / Giden Takipçi */}
            <div className="bg-[#0C0C0E] border border-white/[0.06] rounded-2xl p-5
                hover:border-[#C8697A]/30 transition-colors flex flex-col gap-3">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-sky-500/10 flex items-center justify-center">
                        <UserPlus className="w-4 h-4 text-sky-400" />
                    </div>
                    <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Gelen / Giden</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-emerald-400">+{fmtNum(data.followersGained)}</span>
                    <span className="text-zinc-600">/</span>
                    <span className="text-2xl font-bold text-rose-400">-{fmtNum(data.followersLost)}</span>
                </div>
                <span className="text-[10px] text-zinc-500">Bu ayın takipçi hareketi</span>
            </div>

            {/* Büyüme Oranı */}
            <div className="relative overflow-hidden rounded-2xl p-5 flex flex-col gap-3
                bg-gradient-to-br from-violet-600/80 to-pink-600/80
                shadow-[0_4px_24px_rgba(139,92,246,0.3)]">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 to-pink-500/20" />
                <div className="relative flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center">
                        <Eye className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-[11px] font-semibold text-white/70 uppercase tracking-wider">Büyüme Oranı</span>
                </div>
                <div className="relative text-3xl font-bold text-white">%{growthRate}</div>
                <div className="relative flex items-center gap-1.5">
                    <span className="text-[10px] text-white/60">Etkileşim: %{engagementRate}</span>
                </div>
            </div>

        </div>
    );
}

/* ══════════════════════════════════════════════════════
   REELS COLUMN
══════════════════════════════════════════════════════ */
export function ReelsColumn({ companyId }: { companyId: string }) {
    const { data: reels = [], isLoading } = useQuery<IgReelRow[]>({
        queryKey: instagramKeys.reels(companyId),
        queryFn: () => igApi.getReels(companyId, 12),
        staleTime: 5 * 60 * 1000,
    });
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (dir: 'left' | 'right') => {
        scrollRef.current?.scrollBy({ left: dir === 'left' ? -240 : 240, behavior: 'smooth' });
    };

    if (isLoading) {
        return (
            <div className="flex gap-4 px-2">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="shrink-0 w-[220px] flex flex-col gap-2">
                        <div className="rounded-2xl bg-[#111115] animate-pulse" style={{ aspectRatio: '9/16' }} />
                        <div className="h-2 rounded-full bg-[#111115] animate-pulse w-3/4 mx-auto" />
                    </div>
                ))}
            </div>
        );
    }

    if (reels.length === 0) {
        return (
            <div className="bg-[#0C0C0E] border border-white/[0.06] rounded-2xl p-10 text-center">
                <Play className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
                <p className="text-sm text-zinc-500">Bu ay henüz reels paylaşılmadı</p>
            </div>
        );
    }

    return (
        <div className="relative group/scroller">
            {/* Kenar fade'leri */}
            <div className="pointer-events-none absolute left-0 top-0 bottom-6 w-12 bg-gradient-to-r from-[#0A0A0C] to-transparent z-10" />
            <div className="pointer-events-none absolute right-0 top-0 bottom-6 w-12 bg-gradient-to-l from-[#0A0A0C] to-transparent z-10" />

            {/* Sol ok */}
            <button
                onClick={() => scroll('left')}
                className="absolute left-1 top-[38%] -translate-y-1/2 z-20 w-9 h-9
                    flex items-center justify-center rounded-full
                    bg-[#1A1A1E] hover:bg-[#C8697A] text-white
                    border border-white/10 shadow-xl
                    opacity-0 group-hover/scroller:opacity-100 transition-all"
            >
                <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Kart listesi */}
            <div
                ref={scrollRef}
                className="flex gap-4 overflow-x-auto snap-x snap-mandatory px-4 pb-1
                    [&::-webkit-scrollbar]:hidden"
            >
                {reels.map((r) => <ReelCard key={r.id} reel={r} />)}
            </div>

            {/* Sağ ok */}
            <button
                onClick={() => scroll('right')}
                className="absolute right-1 top-[38%] -translate-y-1/2 z-20 w-9 h-9
                    flex items-center justify-center rounded-full
                    bg-[#1A1A1E] hover:bg-[#C8697A] text-white
                    border border-white/10 shadow-xl
                    opacity-0 group-hover/scroller:opacity-100 transition-all"
            >
                <ChevronRight className="w-4 h-4" />
            </button>
        </div>
    );
}

/* ── Tek Reel Kartı ── */
function ReelCard({ reel: r }: { reel: IgReelRow }) {
    const date    = r.timestamp ? new Date(r.timestamp) : null;
    const dateStr = date ? date.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' }) : '';
    const caption = r.caption ? (r.caption.length > 55 ? r.caption.slice(0, 55) + '…' : r.caption) : '';

    return (
        <div className="snap-center shrink-0 w-[220px] group/card flex flex-col">

            {/* ─── Ana kart ─── */}
            <div className="rounded-2xl overflow-hidden ring-1 ring-white/[0.08]
                hover:ring-[#C8697A]/50 transition-all duration-300
                shadow-lg hover:shadow-[0_8px_32px_rgba(200,105,122,0.25)]">

                {/* ── Resim bölümü ── */}
                <a
                    href={r.permalink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block relative overflow-hidden"
                    style={{ aspectRatio: '9/16' }}
                >
                    {/* Thumbnail */}
                    {r.thumbnailUrl ? (
                        <img
                            src={r.thumbnailUrl}
                            className="w-full h-full object-cover
                                group-hover/card:scale-105 transition-transform duration-500"
                            alt=""
                        />
                    ) : (
                        <div className="w-full h-full bg-[#1A1A1E] flex items-center justify-center">
                            <Play className="w-10 h-10 text-white/15" />
                        </div>
                    )}

                    {/* Alt gradient + açıklama */}
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent pt-8 pb-3 px-3">
                        {caption && (
                            <p className="text-[10px] font-medium leading-snug line-clamp-2 text-white/90
                                drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
                                {caption}
                            </p>
                        )}
                    </div>

                    {/* Play rozeti — sağ üst */}
                    <div className="absolute top-3 right-3 w-7 h-7 rounded-full
                        bg-black/55 backdrop-blur-sm border border-white/20
                        flex items-center justify-center
                        group-hover/card:bg-[#C8697A] group-hover/card:border-transparent
                        transition-all duration-300">
                        <Play className="w-3 h-3 text-white fill-white ml-px" />
                    </div>

                    {/* Hover overlay */}
                    <div className="absolute inset-0
                        bg-black/55 backdrop-blur-[2px]
                        opacity-0 group-hover/card:opacity-100
                        transition-opacity duration-300
                        flex flex-col items-center justify-center gap-2.5">
                        <div className="w-13 h-13 rounded-full bg-[#C8697A]
                            flex items-center justify-center
                            shadow-[0_0_30px_rgba(200,105,122,0.75)]
                            scale-90 group-hover/card:scale-100 transition-transform duration-300 p-3">
                            <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                        </div>
                        <span className="text-[11px] font-semibold text-white/90 tracking-wide">Videoyu Göster</span>
                    </div>
                </a>

                {/* ── İnce siyah şerit: stats ── */}
                <div className="bg-black/95 px-3 py-2.5 flex items-center justify-center gap-5
                    border-t border-white/[0.06]">
                    <span className="flex items-center gap-1.5">
                        <Heart className="w-3.5 h-3.5 text-[#C8697A]" />
                        <span className="text-[11px] font-bold text-white">{fmtNum(r.likeCount)}</span>
                    </span>
                    <span className="w-px h-3 bg-white/10" />
                    <span className="flex items-center gap-1.5">
                        <MessageCircle className="w-3.5 h-3.5 text-zinc-400" />
                        <span className="text-[11px] font-bold text-white">{fmtNum(r.commentsCount)}</span>
                    </span>
                    <span className="w-px h-3 bg-white/10" />
                    <span className="flex items-center gap-1.5">
                        <Share2 className="w-3.5 h-3.5 text-zinc-400" />
                        <span className="text-[11px] font-bold text-white">{fmtNum(r.shares ?? 0)}</span>
                    </span>
                </div>
            </div>

            {/* ── Tarih — kartın dışında, altında ── */}
            {dateStr && (
                <div className="flex items-center justify-center gap-1.5 pt-2">
                    <Calendar className="w-3 h-3 text-zinc-600" />
                    <span className="text-[10px] text-zinc-600 font-medium">{dateStr}</span>
                </div>
            )}
        </div>
    );
}

/* ══════════════════════════════════════════════════════
   POSTS COLUMN
══════════════════════════════════════════════════════ */
export function PostsColumn({ companyId }: { companyId: string }) {
    const { data: posts = [], isLoading } = useQuery<IgPostRow[]>({
        queryKey: instagramKeys.posts(companyId),
        queryFn: () => igApi.getPosts(companyId, 12),
        staleTime: 5 * 60 * 1000,
    });
    const scrollContainer = useRef<HTMLDivElement>(null);

    const scroll = (dir: 'left' | 'right') => {
        if (scrollContainer.current) {
            const amount = dir === 'left' ? -350 : 350;
            scrollContainer.current.scrollBy({ left: amount, behavior: 'smooth' });
        }
    };

    if (isLoading) {
        return <div className="bg-[#0C0C0E] border border-white/[0.06] rounded-2xl p-8 flex justify-center"><Loader2 className="w-6 h-6 text-pink-400 animate-spin" /></div>;
    }

    if (posts.length === 0) {
        return <div className="bg-[#0C0C0E] border border-white/[0.06] rounded-2xl p-8 text-center text-sm text-zinc-500">Bu ay henüz gönderi paylaşılmadı</div>;
    }

    return (
        <div className="relative group/scroller">
            <button onClick={() => scroll('left')} className="absolute -left-4 top-[50%] -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center bg-[#1A1A1E] hover:bg-[#C8697A] text-white rounded-full opacity-0 group-hover/scroller:opacity-100 transition-all border border-white/10 shadow-xl">
                <ChevronLeft className="w-5 h-5" />
            </button>

            <div ref={scrollContainer} className="flex gap-5 overflow-x-auto snap-x snap-mandatory pb-5 pt-2 px-2 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-white/[0.02] [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-[#C8697A]/50">
                {posts.map(p => (
                    <div key={p.id} className="snap-center shrink-0 w-[340px]">
                        <a href={p.permalink} target="_blank" rel="noopener noreferrer" className="relative aspect-square rounded-2xl overflow-hidden bg-[#1A1A1E] block group/post ring-1 ring-white/5 hover:ring-[#C8697A]/50 transition-all shadow-lg">
                            {p.mediaUrl ? (
                                <img
                                    src={p.mediaUrl}
                                    className="w-full h-full object-cover group-hover/post:scale-110 transition-transform duration-700"
                                    alt=""
                                    referrerPolicy="no-referrer"
                                    crossOrigin="anonymous"
                                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-10 h-10 text-white/20" /></div>
                            )}
                            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 via-black/40 to-transparent transition-opacity duration-300 group-hover/post:opacity-0" />
                            <div className="absolute bottom-0 left-0 right-0 p-4 flex items-center justify-between w-full transition-all duration-300 group-hover/post:opacity-0 group-hover/post:translate-y-4 text-white/90">
                                <div className="flex items-center gap-1.5 flex-1 justify-start">
                                    <Heart className="w-4 h-4 text-[#C8697A]" />
                                    <span className="text-[13px] font-bold text-white drop-shadow-md">{fmtNum(p.likeCount)}</span>
                                </div>
                                <div className="flex items-center gap-1.5 flex-1 justify-center">
                                    <MessageCircle className="w-4 h-4 text-[#C8697A]" />
                                    <span className="text-[13px] font-bold text-white drop-shadow-md">{fmtNum(p.commentsCount)}</span>
                                </div>
                                <div className="flex items-center gap-1.5 flex-1 justify-end">
                                    <Eye className="w-4 h-4 text-[#C8697A]" />
                                    <span className="text-[13px] font-bold text-white drop-shadow-md">{fmtNum(p.impressions)}</span>
                                </div>
                            </div>
                            <div className="absolute inset-0 bg-[#0A0A0C]/70 backdrop-blur-[2px] opacity-0 group-hover/post:opacity-100 transition-all duration-300 flex items-center justify-center">
                                <div className="flex flex-col items-center transform translate-y-6 group-hover/post:translate-y-0 transition-transform duration-300">
                                    <div className="px-6 py-3 bg-[#C8697A] rounded-full text-sm font-semibold text-white shadow-[0_0_25px_rgba(200,105,122,0.5)] tracking-wide">
                                        Gönderiyi Gör
                                    </div>
                                </div>
                            </div>
                        </a>
                    </div>
                ))}
            </div>

            <button onClick={() => scroll('right')} className="absolute -right-4 top-[50%] -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center bg-[#1A1A1E] hover:bg-[#C8697A] text-white rounded-full opacity-0 group-hover/scroller:opacity-100 transition-all border border-white/10 shadow-xl">
                <ChevronRight className="w-5 h-5" />
            </button>
        </div>
    );
}

/* ══════════════════════════════════════════════════════
   INSTAGRAM PANEL (status)
══════════════════════════════════════════════════════ */
export function InstagramPanelSkeleton() {
    return (
        <div className="bg-[#0C0C0E] border border-white/[0.06] rounded-2xl p-8 flex items-center justify-center gap-3">
            <Loader2 className="w-5 h-5 text-pink-400 animate-spin" />
            <span className="text-zinc-400 text-sm">Instagram yükleniyor...</span>
        </div>
    );
}

interface InstagramPanelProps extends Props {
    initialStatus?: IgStatusResponse;
    returnPath?: string;
}

export default function InstagramPanel({
    companyId,
    initialStatus,
    returnPath = '/client/instagram',
}: InstagramPanelProps) {
    const { data: status, isLoading } = useQuery<IgStatusResponse>({
        queryKey: instagramKeys.status(companyId, returnPath),
        queryFn: () => igApi.getStatus(companyId, returnPath),
        initialData: initialStatus,
        staleTime: 5 * 60 * 1000,
    });

    if (isLoading) {
        return <InstagramPanelSkeleton />;
    }

    if (!status?.configured) {
        return (
            <div className="bg-[#0C0C0E] border border-white/[0.06] rounded-2xl p-8 text-center">
                <Instagram className="w-8 h-8 text-zinc-500 mx-auto mb-3" />
                <h3 className="text-white font-semibold">Instagram Entegrasyonu</h3>
                <p className="text-zinc-500 text-sm mt-1">Henüz yapılandırılmamış. Yöneticinizle iletişime geçin.</p>
            </div>
        );
    }

    if (!status?.connected) {
        return (
            <InstagramDisconnectedState
                {...getInstagramDisconnectedCopy(returnPath)}
                href={status.authUrl}
            />
        );
    }

    return (
        <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-pink-400" />
            <span className="text-[11px] text-zinc-500">@{status.username} — Bağlı</span>
        </div>
    );
}
