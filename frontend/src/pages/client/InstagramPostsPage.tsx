import { useState, useEffect, useRef, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Instagram, Eye, Heart, MessageCircle, Loader2,
    ArrowLeft, CheckCircle2, ExternalLink,
    Image as ImageIcon, Calendar, ChevronLeft, ChevronRight
} from 'lucide-react';
import {
    formatInstagramMetric,
    getInstagramOAuthCallbackError,
    InstagramDisconnectedState,
    getInstagramDisconnectedCopy,
    igApi,
    type IgPostRow,
} from '../../features/instagram';
import { getApiErrorMessage } from '../../lib/apiError';
import { useAuth } from '../../store/AuthContext';
import { MissingCompanyState } from '../../components/client/MissingCompanyState';

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

function PostCard({ item }: { item: IgPostRow }) {
    return (
        <a data-card href={item.permalink} target="_blank" rel="noopener noreferrer"
            className="group relative shrink-0 w-[220px] snap-start rounded-2xl overflow-hidden border border-white/[0.08] bg-[#0A0A0C] hover:border-[#C8697A]/40 transition-all"
            style={{ boxShadow: '0 4px 24px -8px rgba(0,0,0,0.6)' }}>
            <div className="relative w-full" style={{ aspectRatio: '1/1' }}>
                {item.mediaUrl
                    ? <img src={item.mediaUrl} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
                    : <div className="w-full h-full bg-gradient-to-br from-zinc-900 to-zinc-800 flex items-center justify-center"><ImageIcon className="w-8 h-8 text-zinc-700" /></div>
                }
                <div className="absolute inset-x-0 bottom-0 p-3 pt-10 group-hover:opacity-0 transition-opacity"
                    style={{ background: 'linear-gradient(180deg,transparent 0%,rgba(0,0,0,0.85) 70%)' }}>
                    <div className="flex items-center gap-3 mb-1.5">
                        <span className="flex items-center gap-1 text-white text-[12px] font-semibold"><Heart className="w-3.5 h-3.5 text-[#F5BEC8] fill-[#F5BEC8]" />{fmtNum(item.likeCount)}</span>
                        <span className="flex items-center gap-1 text-white text-[12px] font-semibold"><MessageCircle className="w-3.5 h-3.5 text-[#F5BEC8]" />{fmtNum(item.commentsCount)}</span>
                        <span className="flex items-center gap-1 text-white text-[12px] font-semibold"><Eye className="w-3.5 h-3.5 text-[#F5BEC8]" />{fmtNum(item.impressions)}</span>
                    </div>
                    <p className="text-[10px] text-zinc-400 line-clamp-2">{item.caption?.substring(0, 80) || 'Açıklama yok'}</p>
                </div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"
                    style={{ background: 'linear-gradient(180deg,rgba(10,10,12,0.35) 0%,rgba(10,10,12,0.75) 100%)', backdropFilter: 'blur(2px)' }}>
                    <div className="flex items-center gap-2 px-4 py-2.5 rounded-full text-white text-[13px] font-semibold transform scale-90 group-hover:scale-100 transition-transform"
                        style={{ background: 'linear-gradient(135deg,#D1181C 0%,#C8697A 100%)', boxShadow: '0 10px 30px -8px rgba(209,24,28,0.6)' }}>
                        <ExternalLink className="w-3.5 h-3.5" />Gönderiyi Gör
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

function MediaCarousel({ items }: { items: IgPostRow[] }) {
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
                <span className="text-xs text-zinc-500">{items.length} gönderi</span>
                <div className="flex items-center gap-1.5">
                    <button onClick={() => doScroll(-1)} disabled={!canPrev} className="h-9 w-9 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-zinc-400 hover:text-[#F5BEC8] disabled:opacity-30 disabled:cursor-not-allowed transition-all"><ChevronLeft className="w-4 h-4" /></button>
                    <button onClick={() => doScroll(1)} disabled={!canNext} className="h-9 w-9 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-zinc-400 hover:text-[#F5BEC8] disabled:opacity-30 disabled:cursor-not-allowed transition-all"><ChevronRight className="w-4 h-4" /></button>
                </div>
            </div>
            <div ref={scrollRef} className="flex gap-4 overflow-x-auto pb-2 scroll-smooth" style={{ scrollbarWidth: 'none' }}>
                {items.map(m => <PostCard key={m.id} item={m} />)}
            </div>
        </div>
    );
}

export default function InstagramPostsPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, isLoading: authLoading } = useAuth();
    const companyId = user?.companyId;
    const [posts, setPosts] = useState<IgPostRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [connected, setConnected] = useState(false);
    const [username, setUsername] = useState('');
    const [authUrl, setAuthUrl] = useState('');
    const [error, setError] = useState('');
    const callbackError = useMemo(
        () => getInstagramOAuthCallbackError(location.search),
        [location.search],
    );

    useEffect(() => {
        if (authLoading) return;
        if (!companyId) return;
        // The request lifecycle owns the page-level loading state.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLoading(true);
        setError(callbackError);
        igApi.getStatus(companyId, '/client/instagram/posts')
            .then(async s => {
                setConnected(s.connected);
                setUsername(s.username || '');
                setAuthUrl(s.authUrl || '');
                if (s.connected) setPosts(await igApi.getPosts(companyId, 24));
            })
            .catch((err: unknown) => setError(getApiErrorMessage(err, 'Instagram gönderileri yüklenemedi')))
            .finally(() => setLoading(false));
    }, [authLoading, callbackError, companyId]);

    const summary = useMemo(() => ({
        count: posts.length,
        totalLikes: posts.reduce((a, p) => a + p.likeCount, 0),
        totalComments: posts.reduce((a, p) => a + p.commentsCount, 0),
        totalImpressions: posts.reduce((a, p) => a + p.impressions, 0),
    }), [posts]);

    const currentMonthLabel = new Date().toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });

    if (authLoading) return (
        <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
            <div className="flex items-center gap-3"><Loader2 className="w-6 h-6 text-pink-400 animate-spin" /><span className="text-zinc-400">Gönderiler yükleniyor...</span></div>
        </div>
    );

    if (!companyId) {
        return (
            <MissingCompanyState description="Instagram gönderileri ekranı şirket bilgisi olan bir müşteri hesabıyla açılmalıdır." />
        );
    }

    if (loading) return (
        <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
            <div className="flex items-center gap-3"><Loader2 className="w-6 h-6 text-pink-400 animate-spin" /><span className="text-zinc-400">Gönderiler yükleniyor...</span></div>
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
                            <h1 className="text-xl font-bold text-white">Instagram Gönderiler</h1>
                            <p className="text-sm text-zinc-500">{username ? '@' + username + ' — ' + currentMonthLabel : currentMonthLabel}</p>
                        </div>
                    </div>
                    {connected && <div className="ml-auto flex items-center gap-1.5 bg-pink-500/10 border border-pink-500/20 rounded-xl px-3 py-2.5"><CheckCircle2 className="w-4 h-4 text-pink-400" /><span className="text-xs text-pink-400 font-medium">Canlı</span></div>}
                </div>

                {error && (
                    <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-5 text-sm text-red-300">{error}</div>
                )}

                {!connected ? (
                    <InstagramDisconnectedState
                        {...getInstagramDisconnectedCopy('/client/instagram/posts')}
                        href={authUrl}
                        className="p-12"
                    />
                ) : (
                    <>
                        <div>
                            <h2 className="text-base font-semibold text-white">{currentMonthLabel} — Gönderiler</h2>
                            <p className="text-xs text-zinc-500 mt-0.5">Ayın başından bugüne paylaşılan gönderiler</p>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <SummaryCard label="Paylaşılan Gönderi" value={fmtNum(summary.count)} icon={ImageIcon} color="text-pink-400" bgColor="bg-pink-500/10" />
                            <SummaryCard label="Toplam Beğeni" value={fmtNum(summary.totalLikes)} icon={Heart} color="text-rose-400" bgColor="bg-rose-500/10" />
                            <SummaryCard label="Toplam Yorum" value={fmtNum(summary.totalComments)} icon={MessageCircle} color="text-violet-400" bgColor="bg-violet-500/10" />
                            <SummaryCard label="Toplam Görüntülenme" value={fmtNum(summary.totalImpressions)} icon={Eye} color="text-cyan-400" bgColor="bg-cyan-500/10" />
                        </div>
                        {posts.length > 0
                            ? <MediaCarousel items={posts} />
                            : <div className="bg-[#16161a] border border-white/[0.06] rounded-xl p-10 text-center text-zinc-500 text-sm">Bu ay henüz gönderi paylaşılmamış.</div>
                        }
                    </>
                )}
            </div>
        </div>
    );
}
