import { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext';
import { gaApi, type GaOverviewResponse } from '../../api/googleAnalytics';
import { igApi, type IgOverviewResponse } from '../../api/instagram';
import type { PageResponse } from '../../api/staff';
import {
    searchConsoleApi,
    searchConsoleKeys,
    type ScOverviewResponse,
} from '../../features/search-console';
import { taskApi, taskKeys, type TaskResponse } from '../../features/tasks';
import { shootApi, shootKeys, type ShootResponse } from '../../features/shoots';
import { useActiveServices } from '../../hooks/useActiveServices';
import { ServiceBlurOverlay } from '../../components/ServiceUpsellOverlay';
import {
    AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';
import {
    Sparkles, Users, Eye, MousePointerClick, Globe, Search, Instagram, TrendingUp,
    ArrowUpRight, ArrowDownRight, ChevronRight, Loader2, Camera, ListTodo,
    FileText, Clock, MapPin, ExternalLink, BarChart3, Megaphone, CalendarDays, Zap, RefreshCw
} from 'lucide-react';

type TabKey = 'overview' | 'web' | 'social' | 'schedule';

const fmt = (n: number) => {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
    if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
    return n.toLocaleString('tr-TR');
};

const pct = (n: number) => (n * 100).toFixed(1) + '%';
const dur = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.round(s % 60);
    return m > 0 ? `${m}dk ${sec}sn` : `${sec}sn`;
};

export default function ClientDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const companyId = user?.companyId || '';
    const [tab, setTab] = useState<TabKey>('overview');
    const [refreshing, setRefreshing] = useState<string | null>(null);
    const { hasService, hasDigitalMarketing, hasSocialMedia, hasProduction, hasContentMarketing } = useActiveServices();

    const hour = new Date().getHours();
    const greeting = hour < 6 ? 'Hayırlı geceler' : hour < 12 ? 'Günaydın' : hour < 18 ? 'İyi günler' : 'İyi akşamlar';
    const firstName = user?.fullName?.split(' ')[0] || '';

    // ─── Use shared cache keys (prefetched in ClientLayout) ────────────────────
    const STALE = Infinity;
    const CACHE = 30 * 60_000;
    const { data: ga, isLoading: gaLoading } = useQuery<GaOverviewResponse>({
        queryKey: ['client-ga', companyId],
        queryFn: () => gaApi.getOverview(companyId),
        enabled: !!companyId, staleTime: STALE, gcTime: CACHE,
    });
    const { data: sc, isLoading: scLoading } = useQuery<ScOverviewResponse>({
        queryKey: searchConsoleKeys.overview(companyId),
        queryFn: () => searchConsoleApi.getOverview(companyId),
        enabled: !!companyId, staleTime: STALE, gcTime: CACHE,
    });
    const { data: ig, isLoading: igLoading } = useQuery<IgOverviewResponse>({
        queryKey: ['client-ig', companyId],
        queryFn: () => igApi.getOverview(companyId),
        enabled: !!companyId, staleTime: STALE, gcTime: CACHE,
    });
    const { data: shootsData } = useQuery<PageResponse<ShootResponse>>({
        queryKey: shootKeys.list('client', 0, 20),
        queryFn: () => shootApi.listClient(0, 20),
        enabled: !!companyId, staleTime: STALE, gcTime: CACHE,
    });
    const { data: tasksData } = useQuery<PageResponse<TaskResponse>>({
        queryKey: taskKeys.clientList(),
        queryFn: () => taskApi.listClient(0, 20),
        enabled: !!companyId, staleTime: STALE, gcTime: CACHE,
    });

    const isLoading = gaLoading || scLoading || igLoading;

    const refreshTab = async (keys: string[]) => {
        const id = keys.join(',');
        setRefreshing(id);
        await Promise.all(keys.map(k => queryClient.invalidateQueries({ queryKey: [k, companyId] })));
        setRefreshing(null);
    };

    // ─── Derived ─────────────────────────────────────────────────────────────
    const upcomingShoots = useMemo(() => {
        const now = new Date();
        return (shootsData?.content ?? [])
            .filter((s): s is ShootResponse & { shootDate: string } =>
                s.status === 'PLANNED' && Boolean(s.shootDate) && new Date(s.shootDate!) >= now)
            .sort((a, b) => new Date(a.shootDate).getTime() - new Date(b.shootDate).getTime())
            .slice(0, 4);
    }, [shootsData]);

    const activeTasks = useMemo(() =>
        (tasksData?.content ?? []).filter(t => t.status !== 'DONE').slice(0, 5)
    , [tasksData]);

    const gaConnected = ga?.connected && ga?.propertyId;
    const scConnected = sc?.connected && sc?.siteUrl;
    const igConnected = ig?.connected && ig?.username;

    // ─── Tabs (sadece aktif hizmetler gösterilir) ─────────────────────────────
    const tabs: { key: TabKey; label: string; icon: typeof Globe; service?: string }[] = [
        { key: 'overview', label: 'Genel Bakış', icon: BarChart3 },
        { key: 'web',      label: 'Web Performansı', icon: Globe,       service: 'DIGITAL_MARKETING' },
        { key: 'social',   label: 'Sosyal Medya',    icon: Instagram,   service: 'SOCIAL_MEDIA' },
        { key: 'schedule', label: 'Takvim & Görevler', icon: CalendarDays, service: 'PRODUCTION' },
    ];

    return (
        <div className="space-y-6">
            {/* ═══ HERO ═══ */}
            <section className="fog-hero-card p-7 md:p-9">
                <div className="relative z-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                    <div className="space-y-3">
                        <div className="fog-chip inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] uppercase tracking-[0.18em]">
                            <Sparkles className="w-3 h-3" />
                            Dijital Performans
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
                            {greeting}{firstName ? `, ${firstName}` : ''}
                        </h1>
                        <p className="text-sm text-zinc-400 max-w-xl">
                            Tüm dijital kanallarınızın anlık performansı tek bakışta.
                        </p>
                    </div>
                    <div className="hidden md:flex items-center gap-2 text-xs text-zinc-500">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="font-medium tracking-wider uppercase">Canlı Veriler</span>
                    </div>
                </div>
            </section>

            {/* ═══ TAB NAV ═══ */}
            <div className="flex gap-1.5 p-1 bg-[#0C0C0E] border border-white/[0.06] rounded-2xl overflow-x-auto">
                {tabs.map(t => (
                    <button
                        key={t.key}
                        onClick={() => setTab(t.key)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-medium whitespace-nowrap transition-all ${
                            tab === t.key
                                ? 'bg-white/[0.08] text-white shadow-lg shadow-black/20'
                                : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.03]'
                        }`}
                    >
                        <t.icon className="w-4 h-4" />
                        {t.label}
                    </button>
                ))}
            </div>

            {/* ═══ CONTENT ═══ */}
            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-6 h-6 text-pink-400 animate-spin" />
                </div>
            ) : (
                <>
                    {/* Per-tab refresh */}
                    <div className="flex justify-end -mt-2">
                        <button
                            onClick={() => {
                                const keyMap: Record<TabKey, string[]> = {
                                    overview: ['client-ga', 'client-sc', 'client-ig', 'client-shoots', 'client-tasks'],
                                    web: ['client-ga', 'client-sc'],
                                    social: ['client-ig'],
                                    schedule: ['client-shoots', 'client-tasks'],
                                };
                                refreshTab(keyMap[tab]);
                            }}
                            disabled={!!refreshing}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium text-zinc-500 hover:text-white hover:bg-white/[0.06] border border-white/[0.06] transition-all disabled:opacity-40"
                        >
                            <RefreshCw className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`} />
                            {refreshing ? 'Yenileniyor…' : 'Yenile'}
                        </button>
                    </div>

                    {tab === 'overview' && <OverviewTab ga={ga} sc={sc} ig={ig} navigate={navigate} upcomingShoots={upcomingShoots} activeTasks={activeTasks} gaConnected={!!gaConnected} scConnected={!!scConnected} igConnected={!!igConnected} hasDigitalMarketing={hasDigitalMarketing} hasSocialMedia={hasSocialMedia} />}
                    {tab === 'web' && (
                        hasService('DIGITAL_MARKETING')
                            ? <WebTab ga={ga} sc={sc} navigate={navigate} gaConnected={!!gaConnected} scConnected={!!scConnected} />
                            : <ServiceBlurOverlay service="DIGITAL_MARKETING" />
                    )}
                    {tab === 'social' && (
                        hasService('SOCIAL_MEDIA')
                            ? <SocialTab ig={ig} navigate={navigate} igConnected={!!igConnected} />
                            : <ServiceBlurOverlay service="SOCIAL_MEDIA" />
                    )}
                    {tab === 'schedule' && (
                        hasService('PRODUCTION') || hasService('CONTENT_MARKETING')
                            ? <ScheduleTab upcomingShoots={upcomingShoots} activeTasks={activeTasks} navigate={navigate} hasProduction={hasProduction} hasContentMarketing={hasContentMarketing} />
                            : <ServiceBlurOverlay service="PRODUCTION" />
                    )}
                </>
            )}
        </div>
    );
}

// ════════════════════════════════════════════════════════════════════════════════
// OVERVIEW TAB
// ════════════════════════════════════════════════════════════════════════════════

function OverviewTab({ ga, sc, ig, navigate, upcomingShoots, activeTasks, gaConnected, scConnected, igConnected }: any) {
    const stats = [
        { label: 'Ziyaretçi', value: gaConnected ? fmt(ga.totalUsers) : '—', icon: Users, color: 'from-blue-500/15 to-blue-400/5 border-blue-500/20', textColor: 'text-blue-400', connected: gaConnected },
        { label: 'Sayfa Görüntüleme', value: gaConnected ? fmt(ga.pageViews) : '—', icon: Eye, color: 'from-violet-500/15 to-violet-400/5 border-violet-500/20', textColor: 'text-violet-400', connected: gaConnected },
        { label: 'Tıklama (SC)', value: scConnected ? fmt(sc.totalClicks) : '—', icon: MousePointerClick, color: 'from-emerald-500/15 to-emerald-400/5 border-emerald-500/20', textColor: 'text-emerald-400', connected: scConnected },
        { label: 'Takipçi', value: igConnected ? fmt(ig.followersCount) : '—', icon: Instagram, color: 'from-pink-500/15 to-pink-400/5 border-pink-500/20', textColor: 'text-pink-400', connected: igConnected },
    ];

    return (
        <div className="space-y-6">
            {/* Hero Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {stats.map(s => (
                    <div key={s.label} className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br ${s.color} p-5`}>
                        <s.icon className={`w-8 h-8 ${s.textColor} opacity-20 absolute -top-1 -right-1`} />
                        <p className={`text-[11px] font-semibold uppercase tracking-wider ${s.textColor} mb-2`}>{s.label}</p>
                        <p className="text-2xl font-bold text-white tracking-tight">{s.value}</p>
                        {!s.connected && <p className="text-[10px] text-zinc-600 mt-1">Bağlantı gerekli</p>}
                    </div>
                ))}
            </div>

            {/* Two‐col: Traffic Chart + Quick Links */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Traffic chart */}
                <div className="lg:col-span-2 bg-[#0C0C0E] border border-white/[0.06] rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-sm font-semibold text-white">Trafik Trendi</h3>
                            <p className="text-[11px] text-zinc-500">Son 30 gün</p>
                        </div>
                        <button onClick={() => navigate('/client/google-analytics')} className="text-[11px] text-zinc-500 hover:text-zinc-300 flex items-center gap-1">
                            Detay <ChevronRight className="w-3 h-3" />
                        </button>
                    </div>
                    {gaConnected && ga.dailyTrend?.length > 0 ? (
                        <ResponsiveContainer width="100%" height={220}>
                            <AreaChart data={ga.dailyTrend}>
                                <defs>
                                    <linearGradient id="gSessions" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#818cf8" stopOpacity={0.4} />
                                        <stop offset="100%" stopColor="#818cf8" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="gUsers" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#f472b6" stopOpacity={0.3} />
                                        <stop offset="100%" stopColor="#f472b6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#52525b' }} tickFormatter={(d: string) => d.slice(5)} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 10, fill: '#52525b' }} axisLine={false} tickLine={false} width={35} />
                                <Tooltip contentStyle={{ background: '#18181b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 }} />
                                <Area type="monotone" dataKey="sessions" name="Oturum" stroke="#818cf8" fill="url(#gSessions)" strokeWidth={2} />
                                <Area type="monotone" dataKey="users" name="Kullanıcı" stroke="#f472b6" fill="url(#gUsers)" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <EmptyState icon={Globe} text="Google Analytics bağlayarak trafik verilerini görün" action={() => navigate('/client/analytics')} actionLabel="Bağla" />
                    )}
                </div>

                {/* Quick links / Integration status */}
                <div className="bg-[#0C0C0E] border border-white/[0.06] rounded-2xl p-5 flex flex-col">
                    <h3 className="text-sm font-semibold text-white mb-4">Hızlı Erişim</h3>
                    <div className="space-y-2 flex-1">
                        <QuickLink icon={Globe} label="Google Analytics" to="/client/google-analytics" connected={gaConnected} navigate={navigate} />
                        <QuickLink icon={Search} label="Search Console" to="/client/search-console" connected={scConnected} navigate={navigate} />
                        <QuickLink icon={Instagram} label="Instagram" to="/client/instagram" connected={igConnected} navigate={navigate} />
                        <QuickLink icon={Megaphone} label="Google Ads" to="/client/google-ads" connected={false} navigate={navigate} />
                        <QuickLink icon={FileText} label="İçerik Planı" to="/client/content-plans" connected={true} navigate={navigate} />
                        <QuickLink icon={Camera} label="Çekim Takvimi" to="/client/shoots" connected={true} navigate={navigate} />
                    </div>
                </div>
            </div>

            {/* Three-col: SC Keywords + IG Highlights + Upcoming */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* SC Top Queries */}
                <div className="bg-[#0C0C0E] border border-white/[0.06] rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-white">Top Anahtar Kelimeler</h3>
                        <Search className="w-4 h-4 text-emerald-400" />
                    </div>
                    {scConnected && sc.topQueries?.length > 0 ? (
                        <div className="space-y-2.5">
                            {sc.topQueries.slice(0, 5).map((q: any, i: number) => (
                                <div key={i} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <span className="text-[10px] font-bold text-zinc-600 w-4 text-right">{i + 1}</span>
                                        <span className="text-[12px] text-zinc-300 truncate">{q.query}</span>
                                    </div>
                                    <span className="text-[11px] font-semibold text-emerald-400 shrink-0 ml-2">{q.clicks} tık</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <EmptyState icon={Search} text="Search Console bağlayın" small />
                    )}
                </div>

                {/* IG Summary */}
                <div className="bg-[#0C0C0E] border border-white/[0.06] rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-white">Instagram Özeti</h3>
                        <Instagram className="w-4 h-4 text-pink-400" />
                    </div>
                    {igConnected ? (
                        <div className="grid grid-cols-2 gap-3">
                            <MiniStat label="Takipçi" value={fmt(ig.followersCount)} color="text-pink-400" />
                            <MiniStat label="Gönderi" value={fmt(ig.mediaCount)} color="text-violet-400" />
                            <MiniStat label="Erişim" value={fmt(ig.reach)} color="text-blue-400" />
                            <MiniStat label="Etkileşim" value={fmt(ig.totalLikes + ig.totalComments)} color="text-amber-400" />
                            <MiniStat label="Profil Ziyareti" value={fmt(ig.profileViews)} color="text-emerald-400" />
                            <MiniStat label="Site Tıklama" value={fmt(ig.websiteClicks)} color="text-cyan-400" />
                        </div>
                    ) : (
                        <EmptyState icon={Instagram} text="Instagram bağlayın" small />
                    )}
                </div>

                {/* Upcoming Shoots + Tasks */}
                <div className="bg-[#0C0C0E] border border-white/[0.06] rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-white">Yaklaşanlar</h3>
                        <CalendarDays className="w-4 h-4 text-violet-400" />
                    </div>
                    <div className="space-y-2">
                        {upcomingShoots.slice(0, 3).map((s: ShootResponse & { shootDate: string }) => {
                            const d = new Date(s.shootDate);
                            return (
                                <div key={s.id} className="flex items-center gap-2.5 p-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                                    <div className="shrink-0 w-10 h-10 rounded-lg bg-violet-500/10 border border-violet-500/20 flex flex-col items-center justify-center">
                                        <span className="text-[9px] font-bold text-violet-400 uppercase">{d.toLocaleDateString('tr-TR', { month: 'short' }).replace('.', '')}</span>
                                        <span className="text-sm font-bold text-white leading-none">{d.getDate()}</span>
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[12px] font-medium text-white truncate">{s.title}</p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            {s.shootTime && <span className="text-[10px] text-zinc-500 flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" />{s.shootTime.slice(0, 5)}</span>}
                                            {s.location && <span className="text-[10px] text-zinc-500 flex items-center gap-0.5 truncate"><MapPin className="w-2.5 h-2.5" />{s.location}</span>}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        {activeTasks.slice(0, 2).map((t: TaskResponse) => (
                            <div key={t.id} className="flex items-center gap-2.5 p-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                                <div className="shrink-0 w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                                    <ListTodo className="w-4 h-4 text-amber-400" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[12px] font-medium text-white truncate">{t.title}</p>
                                    <p className="text-[10px] text-zinc-500">{t.status === 'IN_PROGRESS' ? 'Devam ediyor' : 'Bekliyor'}</p>
                                </div>
                            </div>
                        ))}
                        {upcomingShoots.length === 0 && activeTasks.length === 0 && (
                            <p className="text-[12px] text-zinc-600 text-center py-4">Yaklaşan etkinlik yok</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ════════════════════════════════════════════════════════════════════════════════
// WEB TAB
// ════════════════════════════════════════════════════════════════════════════════

function WebTab({ ga, sc, navigate, gaConnected, scConnected }: any) {
    return (
        <div className="space-y-6">
            {/* GA Metrics Row */}
            {gaConnected ? (
                <>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                        <MetricCard label="Oturumlar" value={fmt(ga.sessions)} icon={Zap} color="violet" />
                        <MetricCard label="Kullanıcılar" value={fmt(ga.totalUsers)} icon={Users} color="blue" />
                        <MetricCard label="Yeni Kullanıcılar" value={fmt(ga.newUsers)} icon={ArrowUpRight} color="emerald" />
                        <MetricCard label="Sayfa Görüntüleme" value={fmt(ga.pageViews)} icon={Eye} color="pink" />
                        <MetricCard label="Hemen Çıkma" value={pct(ga.bounceRate)} icon={ArrowDownRight} color="amber" />
                        <MetricCard label="Ort. Süre" value={dur(ga.avgSessionDuration)} icon={Clock} color="cyan" />
                    </div>

                    {/* Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <ChartCard title="Günlük Trafik" subtitle="Oturum & Kullanıcı">
                            <ResponsiveContainer width="100%" height={240}>
                                <AreaChart data={ga.dailyTrend}>
                                    <defs>
                                        <linearGradient id="wSes" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#818cf8" stopOpacity={0.4} />
                                            <stop offset="100%" stopColor="#818cf8" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#52525b' }} tickFormatter={(d: string) => d.slice(8)} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 10, fill: '#52525b' }} axisLine={false} tickLine={false} width={35} />
                                    <Tooltip contentStyle={{ background: '#18181b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 }} />
                                    <Area type="monotone" dataKey="sessions" name="Oturum" stroke="#818cf8" fill="url(#wSes)" strokeWidth={2} />
                                    <Area type="monotone" dataKey="users" name="Kullanıcı" stroke="#f472b6" fill="transparent" strokeWidth={1.5} strokeDasharray="4 3" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </ChartCard>

                        <ChartCard title="Trafik Kaynakları" subtitle="Son 30 gün">
                            {ga.trafficSources?.length > 0 ? (
                                <ResponsiveContainer width="100%" height={240}>
                                    <BarChart data={ga.trafficSources.slice(0, 6)} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                                        <XAxis type="number" tick={{ fontSize: 10, fill: '#52525b' }} axisLine={false} tickLine={false} />
                                        <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#a1a1aa' }} width={90} axisLine={false} tickLine={false} />
                                        <Tooltip contentStyle={{ background: '#18181b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 }} />
                                        <Bar dataKey="value" name="Oturum" fill="#818cf8" radius={[0, 6, 6, 0]} barSize={18} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : <p className="text-zinc-600 text-sm text-center py-10">Kaynak verisi yok</p>}
                        </ChartCard>
                    </div>

                    {/* Top Pages + Countries */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <ListCard title="Popüler Sayfalar" icon={FileText} items={ga.topPages?.slice(0, 8).map((p: any) => ({ label: p.name, value: fmt(p.value) }))} />
                        <ListCard title="Ülkeler" icon={Globe} items={ga.topCountries?.slice(0, 8).map((c: any) => ({ label: c.name, value: fmt(c.value) }))} />
                    </div>
                </>
            ) : (
                <EmptyState icon={Globe} text="Google Analytics bağlayarak web performansınızı görün" action={() => navigate('/client/analytics')} actionLabel="Analytics Bağla" />
            )}

            {/* SC Section */}
            <div className="border-t border-white/[0.04] pt-6">
                <div className="flex items-center gap-2 mb-4">
                    <Search className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-sm font-semibold text-white">Search Console</h3>
                    <button onClick={() => navigate('/client/search-console')} className="ml-auto text-[11px] text-zinc-500 hover:text-zinc-300 flex items-center gap-1">
                        Detay <ChevronRight className="w-3 h-3" />
                    </button>
                </div>
                {scConnected ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <MetricCard label="Toplam Tıklama" value={fmt(sc.totalClicks)} icon={MousePointerClick} color="emerald" />
                        <MetricCard label="Gösterim" value={fmt(sc.totalImpressions)} icon={Eye} color="blue" />
                        <MetricCard label="Ort. TO" value={pct(sc.avgCtr)} icon={TrendingUp} color="violet" />
                        <MetricCard label="Ort. Sıra" value={sc.avgPosition?.toFixed(1)} icon={BarChart3} color="amber" />
                    </div>
                ) : (
                    <EmptyState icon={Search} text="Search Console bağlayın" action={() => navigate('/client/analytics')} actionLabel="SC Bağla" />
                )}
            </div>
        </div>
    );
}

// ════════════════════════════════════════════════════════════════════════════════
// SOCIAL TAB
// ════════════════════════════════════════════════════════════════════════════════

function SocialTab({ ig, navigate, igConnected }: any) {
    if (!igConnected) {
        return <EmptyState icon={Instagram} text="Instagram hesabınızı bağlayarak sosyal medya verilerinizi görün" action={() => navigate('/client/analytics')} actionLabel="Instagram Bağla" />;
    }

    return (
        <div className="space-y-6">
            {/* IG Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                <MetricCard label="Takipçi" value={fmt(ig.followersCount)} icon={Users} color="pink" />
                <MetricCard label="Takip" value={fmt(ig.followsCount)} icon={Users} color="violet" />
                <MetricCard label="Gönderi" value={fmt(ig.mediaCount)} icon={FileText} color="blue" />
                <MetricCard label="Erişim" value={fmt(ig.reach)} icon={Eye} color="emerald" />
                <MetricCard label="Gösterim" value={fmt(ig.impressions)} icon={TrendingUp} color="amber" />
                <MetricCard label="Profil Ziyareti" value={fmt(ig.profileViews)} icon={ExternalLink} color="cyan" />
            </div>

            {/* Engagement Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-[#0C0C0E] border border-white/[0.06] rounded-2xl p-5">
                    <h3 className="text-sm font-semibold text-white mb-4">Etkileşim Özeti</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <MiniStat label="Beğeni" value={fmt(ig.totalLikes)} color="text-pink-400" />
                        <MiniStat label="Yorum" value={fmt(ig.totalComments)} color="text-blue-400" />
                        <MiniStat label="Yeni Takipçi" value={`+${fmt(ig.followersGained)}`} color="text-emerald-400" />
                        <MiniStat label="Kayıp Takipçi" value={`-${fmt(ig.followersLost)}`} color="text-red-400" />
                        <MiniStat label="Site Tıklama" value={fmt(ig.websiteClicks)} color="text-amber-400" />
                        <MiniStat label="Net Büyüme" value={`${ig.followersGained - ig.followersLost > 0 ? '+' : ''}${fmt(ig.followersGained - ig.followersLost)}`} color="text-violet-400" />
                    </div>
                </div>

                {/* Daily IG trend */}
                <ChartCard title="Günlük Takipçi & Erişim" subtitle="Son 30 gün">
                    {ig.dailyTrend?.length > 0 ? (
                        <ResponsiveContainer width="100%" height={220}>
                            <AreaChart data={ig.dailyTrend}>
                                <defs>
                                    <linearGradient id="igReach" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#f472b6" stopOpacity={0.3} />
                                        <stop offset="100%" stopColor="#f472b6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#52525b' }} tickFormatter={(d: string) => d.slice(5)} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 10, fill: '#52525b' }} axisLine={false} tickLine={false} width={35} />
                                <Tooltip contentStyle={{ background: '#18181b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 }} />
                                <Area type="monotone" dataKey="reach" name="Erişim" stroke="#f472b6" fill="url(#igReach)" strokeWidth={2} />
                                <Area type="monotone" dataKey="impressions" name="Gösterim" stroke="#818cf8" fill="transparent" strokeWidth={1.5} strokeDasharray="4 3" />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : <p className="text-zinc-600 text-sm text-center py-10">Günlük veri yok</p>}
                </ChartCard>
            </div>

            {/* Recent media */}
            {ig.recentMedia?.length > 0 && (
                <div className="bg-[#0C0C0E] border border-white/[0.06] rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-white">Son Gönderiler</h3>
                        <button onClick={() => navigate('/client/instagram')} className="text-[11px] text-zinc-500 hover:text-zinc-300 flex items-center gap-1">
                            Tümü <ChevronRight className="w-3 h-3" />
                        </button>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                        {ig.recentMedia.slice(0, 6).map((m: any) => (
                            <a key={m.id} href={m.permalink} target="_blank" rel="noreferrer" className="group relative aspect-square rounded-xl overflow-hidden border border-white/[0.06] hover:border-pink-500/30 transition-all">
                                <img src={m.mediaUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <span className="text-[10px] text-white font-bold">❤️ {m.likeCount}</span>
                                    <span className="text-[10px] text-white font-bold">💬 {m.commentsCount}</span>
                                </div>
                            </a>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// ════════════════════════════════════════════════════════════════════════════════
// SCHEDULE TAB
// ════════════════════════════════════════════════════════════════════════════════

function ScheduleTab({ upcomingShoots, activeTasks, navigate }: any) {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Upcoming shoots */}
                <div className="bg-[#0C0C0E] border border-white/[0.06] rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Camera className="w-4 h-4 text-violet-400" />
                            <h3 className="text-sm font-semibold text-white">Yaklaşan Çekimler</h3>
                        </div>
                        <button onClick={() => navigate('/client/shoots')} className="text-[11px] text-zinc-500 hover:text-zinc-300 flex items-center gap-1">
                            Tümü <ChevronRight className="w-3 h-3" />
                        </button>
                    </div>
                    {upcomingShoots.length > 0 ? (
                        <div className="space-y-3">
                            {upcomingShoots.map((s: ShootResponse & { shootDate: string }) => {
                                const d = new Date(s.shootDate);
                                return (
                                    <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-violet-500/20 transition-all">
                                        <div className="shrink-0 w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex flex-col items-center justify-center">
                                            <span className="text-[9px] font-bold text-violet-400 uppercase">{d.toLocaleDateString('tr-TR', { month: 'short' }).replace('.', '')}</span>
                                            <span className="text-lg font-bold text-white leading-none">{d.getDate()}</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[13px] font-semibold text-white truncate">{s.title}</p>
                                            <div className="flex items-center gap-3 mt-1">
                                                {s.shootTime && <span className="text-[11px] text-zinc-500 flex items-center gap-1"><Clock className="w-3 h-3" />{s.shootTime.slice(0, 5)}</span>}
                                                {s.location && <span className="text-[11px] text-zinc-500 flex items-center gap-1 truncate"><MapPin className="w-3 h-3" />{s.location}</span>}
                                            </div>
                                        </div>
                                        <span className="shrink-0 text-[10px] font-semibold px-2.5 py-1 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20">Planlandı</span>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-[12px] text-zinc-600 text-center py-8">Yaklaşan çekim bulunmuyor</p>
                    )}
                </div>

                {/* Active tasks */}
                <div className="bg-[#0C0C0E] border border-white/[0.06] rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <ListTodo className="w-4 h-4 text-amber-400" />
                            <h3 className="text-sm font-semibold text-white">Aktif Görevler</h3>
                        </div>
                        <button onClick={() => navigate('/client/tasks')} className="text-[11px] text-zinc-500 hover:text-zinc-300 flex items-center gap-1">
                            Tümü <ChevronRight className="w-3 h-3" />
                        </button>
                    </div>
                    {activeTasks.length > 0 ? (
                        <div className="space-y-2.5">
                            {activeTasks.map((t: TaskResponse) => {
                                const statusMap: Record<string, { label: string; cls: string }> = {
                                    IN_PROGRESS: { label: 'Devam Ediyor', cls: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
                                    PENDING: { label: 'Bekliyor', cls: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
                                    IN_REVIEW: { label: 'İncelemede', cls: 'bg-violet-500/10 text-violet-400 border-violet-500/20' },
                                };
                                const s = statusMap[t.status] || statusMap.PENDING;
                                return (
                                    <div key={t.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                                        <div className="shrink-0 w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                                            <ListTodo className="w-4 h-4 text-amber-400" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[13px] font-medium text-white truncate">{t.title}</p>
                                            {t.assignedToName && <p className="text-[10px] text-zinc-500 mt-0.5">{t.assignedToName}</p>}
                                        </div>
                                        <span className={`shrink-0 text-[10px] font-semibold px-2.5 py-1 rounded-full border ${s.cls}`}>{s.label}</span>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-[12px] text-zinc-600 text-center py-8">Aktif görev bulunmuyor</p>
                    )}
                </div>
            </div>
        </div>
    );
}

// ════════════════════════════════════════════════════════════════════════════════
// SHARED COMPONENTS
// ════════════════════════════════════════════════════════════════════════════════

function MetricCard({ label, value, icon: Icon, color }: { label: string; value: string; icon: any; color: string }) {
    const colorMap: Record<string, string> = {
        pink: 'from-pink-500/12 to-pink-500/3 border-pink-500/20 text-pink-400',
        violet: 'from-violet-500/12 to-violet-500/3 border-violet-500/20 text-violet-400',
        blue: 'from-blue-500/12 to-blue-500/3 border-blue-500/20 text-blue-400',
        emerald: 'from-emerald-500/12 to-emerald-500/3 border-emerald-500/20 text-emerald-400',
        amber: 'from-amber-500/12 to-amber-500/3 border-amber-500/20 text-amber-400',
        cyan: 'from-cyan-500/12 to-cyan-500/3 border-cyan-500/20 text-cyan-400',
    };
    const c = colorMap[color] || colorMap.violet;
    return (
        <div className={`rounded-xl border bg-gradient-to-br ${c} p-4`}>
            <Icon className="w-4 h-4 opacity-60 mb-2" />
            <p className="text-lg font-bold text-white">{value}</p>
            <p className="text-[10px] uppercase tracking-wider opacity-80 mt-0.5">{label}</p>
        </div>
    );
}

function MiniStat({ label, value, color }: { label: string; value: string; color: string }) {
    return (
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <p className={`text-lg font-bold ${color}`}>{value}</p>
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider mt-0.5">{label}</p>
        </div>
    );
}

function ChartCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
    return (
        <div className="bg-[#0C0C0E] border border-white/[0.06] rounded-2xl p-5">
            <div className="mb-4">
                <h3 className="text-sm font-semibold text-white">{title}</h3>
                {subtitle && <p className="text-[11px] text-zinc-500">{subtitle}</p>}
            </div>
            {children}
        </div>
    );
}

function ListCard({ title, icon: Icon, items }: { title: string; icon: any; items?: { label: string; value: string }[] }) {
    return (
        <div className="bg-[#0C0C0E] border border-white/[0.06] rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
                <Icon className="w-4 h-4 text-zinc-500" />
                <h3 className="text-sm font-semibold text-white">{title}</h3>
            </div>
            {items && items.length > 0 ? (
                <div className="space-y-2">
                    {items.map((item, i) => (
                        <div key={i} className="flex items-center justify-between py-1.5 border-b border-white/[0.03] last:border-0">
                            <span className="text-[12px] text-zinc-400 truncate max-w-[70%]">{item.label}</span>
                            <span className="text-[12px] font-semibold text-white">{item.value}</span>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-[12px] text-zinc-600 text-center py-4">Veri yok</p>
            )}
        </div>
    );
}

function QuickLink({ icon: Icon, label, to, connected, navigate }: { icon: any; label: string; to: string; connected: boolean; navigate: any }) {
    return (
        <button
            onClick={() => navigate(to)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.12] hover:bg-white/[0.04] transition-all group"
        >
            <Icon className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors" />
            <span className="flex-1 text-left text-[12px] font-medium text-zinc-400 group-hover:text-white transition-colors">{label}</span>
            {connected ? (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
            )}
            <ChevronRight className="w-3 h-3 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
        </button>
    );
}

function EmptyState({ icon: Icon, text, action, actionLabel, small }: { icon: any; text: string; action?: () => void; actionLabel?: string; small?: boolean }) {
    return (
        <div className={`flex flex-col items-center justify-center ${small ? 'py-6' : 'py-12'} ${!small ? 'bg-[#0C0C0E] border border-white/[0.06] rounded-2xl' : ''}`}>
            <Icon className={`${small ? 'w-8 h-8' : 'w-10 h-10'} text-zinc-700 mb-2`} />
            <p className={`${small ? 'text-[11px]' : 'text-sm'} text-zinc-500 text-center max-w-xs`}>{text}</p>
            {action && actionLabel && (
                <button onClick={action} className="mt-3 px-4 py-2 rounded-xl text-[12px] font-semibold text-white bg-gradient-to-r from-[#D1181C] to-[#C8697A] hover:opacity-90 transition-opacity">
                    {actionLabel}
                </button>
            )}
        </div>
    );
}
