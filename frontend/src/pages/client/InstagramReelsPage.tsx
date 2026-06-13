import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Instagram, Eye, Heart, MessageCircle, Loader2,
    ArrowLeft, CheckCircle2, Play, ExternalLink,
    Image as ImageIcon, Calendar, ChevronLeft, ChevronRight
} from 'lucide-react';
import {
    formatInstagramMetric,
    igApi,
    type IgReelRow,
} from '../../features/instagram';
import { getApiErrorMessage } from '../../lib/apiError';
import { useAuth } from '../../store/AuthContext';

const fmtNum = formatInstagramMetric;

function SummaryCard({ label, value, icon: Icon, color, bgColor }: {
    label: string; value: string | number; icon: React.ElementType; color: string; bgColor: string;
}) {
    return (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="bg-[#16161a] border border-white/[0.06] rounded-xl p-5 hover:border-white/[0.12] transition-colors">
            <div className={`h-10 w-10 rounded-xl ${bgColor} flex items-center justify-center mb-3`}>
                <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className="text-zinc-500 text-[12px] mt-1">{label}</p>
        </motion.div>
    );
}

function ReelCard({ item }: { item: IgReelRow }) {
    return (
        <a data-card href={item.permalink} target="_blank" rel="noopener noreferrer"
            className="group relative shrink-0 w-[200px] md:w-[220px] snap-start rounded-2xl overflow-hidden border border-white/[0.08] bg-[#0A0A0C] hover:border-[#C8697A]/40 transition-all"
            style={{ boxShadow: '0 4px 24px -8px rgba(0,0,0,0.6)' }}>
            <div className="relative w-full" style={{ aspectRatio: '9/16' }}>
                {item.thumbnailUrl
                    ? <img src={item.thumbnailUrl} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
                    : <div className="w-full h-full bg-gradient-to-br from-zinc-900 to-zinc-800 flex items-center justify-center"><ImageIcon className="w-8 h-8 text-zinc-700" /></div>
                }
                <div className="absolute top-2.5 right-2.5 h-7 w-7 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center border border-white/15">
                    <Play className="w-3 h-3 text-white fill-white ml-0.5" />
                </div>
                <div className="absolute inset-x-0 bottom-0 p-3 pt-10 group-hover:opacity-0 transition-opacity"
                    style={{ background: 'linear-gradient(180deg,transparent 0%,rgba(0,0,0,0.85) 70%)' }}>
                    <div className="flex items-center gap-3 mb-1.5">
                        <span className="flex items-center gap-1 text-white text-[12px] font-semibold"><Eye className="w-3.5 h-3.5 text-[#F5BEC8]" />{fmtNum(item.plays)}</span>
                        <span className="flex items-center gap-1 text-white text-[12px] font-semibold"><Heart className="w-3.5 h-3.5 text-[#F5BEC8] fill-[#F5BEC8]" />{fmtNum(item.likeCount)}</span>
                        <span className="flex items-center gap-1 text-white text-[12px] font-semibold"><MessageCircle className="w-3.5 h-3.5 text-[#F5BEC8]" />{fmtNum(item.commentsCount)}</span>
                    </div>
                    <p className="text-[10px] text-zinc-400 line-clamp-2">{item.caption?.substring(0, 80) || 'Açıklama yok'}</p>
                </div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"
                    style={{ background: 'linear-gradient(180deg,rgba(10,10,12,0.35) 0%,rgba(10,10,12,0.75) 100%)', backdropFilter: 'blur(2px)' }}>
                    <div className="flex items-center gap-2 px-4 py-2.5 rounded-full text-white text-[13px] font-semibold transform scale-90 group-hover:scale-100 transition-transform"
                        style={{ background: 'linear-gradient(135deg,#D1181C 0%,#C8697A 100%)', boxShadow: '0 10px 30px -8px rgba(209,24,28,0.6)' }}>
                        <ExternalLink className="w-3.5 h-3.5" />Videoyu Gör
                    </div>
                </div>
            </div>
            <div className="px-3 py-2 border-t border-white/[0.05] bg-[#09090b]">
                <p className="text-[10px] text-zinc-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(item.timestamp).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
            </div>
        </a>
    );
}

function MediaCarousel({ items }: { items: IgReelRow[] }) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [canPrev, setCanPrev] = useState(false);
    const [canNext, setCanNext] = useState(true);
    const updateArrows = () => {
        const el = scrollRef.current; if (!el) return;
        setCanPrev(el.scrollLeft > 8);
        setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
    };
    useEffect(() => {
        updateArrows();
        const el = scrollRef.current; if (!el) return;
        el.addEventListener('scroll', updateArrows, { passive: true });
        window.addEventListener('resize', updateArrows);
        return () => { el.removeEventListener('scroll', updateArrows); window.removeEventListener('resize', updateArrows); };
    }, [items.length]);
    const doScroll = (dir: 1 | -1) => {
        const el = scrollRef.current; if (!el) return;
        const card = el.querySelector<HTMLElement>('[data-card]');
        el.scrollBy({ left: dir * ((card ? card.offsetWidth : 220) + 16) * 2, behavior: 'smooth' });
    };
    return (
        <div className="bg-[#0C0C0E] border border-white/[0.06] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
                <span className="text-xs text-zinc-500">{items.length} reels</span>
                <div className="flex items-center gap-1.5">
                    <button onClick={() => doScroll(-1)} disabled={!canPrev} className="h-9 w-9 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-zinc-400 hover:text-[#F5BEC8] disabled:opacity-30 disabled:cursor-not-allowed transition-all"><ChevronLeft className="w-4 h-4" /></button>
                    <button onClick={() => doScroll(1)} disabled={!canNext} className="h-9 w-9 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-zinc-400 hover:text-[#F5BEC8] disabled:opacity-30 disabled:cursor-not-allowed transition-all"><ChevronRight className="w-4 h-4" /></button>
                </div>
            </div>
            <div ref={scrollRef} className="flex gap-4 overflow-x-auto pb-2 scroll-smooth" style={{ scrollbarWidth: 'none' }}>
                {items.map(m => <ReelCard key={m.id} item={m} />)}
            </div>
        </div>
    );
}

export default function InstagramReelsPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const companyId = user?.companyId;
    const [reels, setReels] = useState<IgReelRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [connected, setConnected] = useState(false);
    const [username, setUsername] = useState('');
    const [authUrl, setAuthUrl] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (!companyId) return;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLoading(true);
        setError('');
        igApi.getStatus(companyId)
            .then(async s => {
                setConnected(s.connected);
                setUsername(s.username || '');
                setAuthUrl(s.authUrl || '');
                if (s.connected) setReels(await igApi.getReels(companyId, 50));
            })
            .catch((err: unknown) => setError(getApiErrorMessage(err, 'Instagram Reels verileri yüklenemedi')))
            .finally(() => setLoading(false));
    }, [companyId]);

    const summary = useMemo(() => ({
        count: reels.length,
        totalLikes: reels.reduce((a, r) => a + r.likeCount, 0),
        totalComments: reels.reduce((a, r) => a + r.commentsCount, 0),
        totalPlays: reels.reduce((a, r) => a + r.plays, 0),
    }), [reels]);

    const currentMonthLabel = new Date().toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });

    if (loading) return (
        <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
            <div className="flex items-center gap-3"><Loader2 className="w-6 h-6 text-pink-400 animate-spin" /><span className="text-zinc-400">Reels yükleniyor...</span></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#09090b] p-4 md:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/client/analytics')} className="h-10 w-10 rounded-xl bg-[#16161a] border border-white/[0.06] flex items-center justify-center hover:bg-[#1e1e22] transition-colors"><ArrowLeft className="w-5 h-5 text-zinc-400" /></button>
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center"><Instagram className="w-6 h-6 text-pink-400" /></div>
                        <div>
                            <h1 className="text-xl font-bold text-white">Instagram Reels</h1>
                            <p className="text-sm text-zinc-500">{username ? '@' + username + ' — ' + currentMonthLabel : currentMonthLabel}</p>
                        </div>
                    </div>
                    {connected && <div className="ml-auto flex items-center gap-1.5 bg-pink-500/10 border border-pink-500/20 rounded-xl px-3 py-2.5"><CheckCircle2 className="w-4 h-4 text-pink-400" /><span className="text-xs text-pink-400 font-medium">Canlı</span></div>}
                </div>

                {error ? (
                    <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-5 text-sm text-red-300">{error}</div>
                ) : !connected ? (
                    <div className="bg-[#0C0C0E] border border-white/[0.06] rounded-2xl p-12 text-center">
                        <Instagram className="w-8 h-8 text-pink-400 mx-auto mb-4" />
                        <h3 className="text-white font-semibold text-lg mb-2">Instagram Bağlı Değil</h3>
                        {authUrl && <a href={authUrl} className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white text-sm font-medium px-6 py-3 rounded-xl"><Instagram className="w-4 h-4" />Instagram'ı Bağla</a>}
                    </div>
                ) : (
                    <>
                        <div>
                            <h2 className="text-base font-semibold text-white">{currentMonthLabel} — Reels</h2>
                            <p className="text-xs text-zinc-500 mt-0.5">Ayın başından bugüne paylaşılan reels'ler</p>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <SummaryCard label="Paylaşılan Reels" value={fmtNum(summary.count)} icon={Play} color="text-pink-400" bgColor="bg-pink-500/10" />
                            <SummaryCard label="Toplam Beğeni" value={fmtNum(summary.totalLikes)} icon={Heart} color="text-rose-400" bgColor="bg-rose-500/10" />
                            <SummaryCard label="Toplam Yorum" value={fmtNum(summary.totalComments)} icon={MessageCircle} color="text-violet-400" bgColor="bg-violet-500/10" />
                            <SummaryCard label="Toplam Görüntülenme" value={fmtNum(summary.totalPlays)} icon={Eye} color="text-cyan-400" bgColor="bg-cyan-500/10" />
                        </div>
                        {reels.length > 0
                            ? <MediaCarousel items={reels} />
                            : <div className="bg-[#16161a] border border-white/[0.06] rounded-xl p-10 text-center text-zinc-500 text-sm">Bu ay henüz reels paylaşılmamış.</div>
                        }
                    </>
                )}
            </div>
        </div>
    );
}
