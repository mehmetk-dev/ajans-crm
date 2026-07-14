import {
    Users, Eye, MousePointerClick, Globe, Search, Instagram,
    ChevronRight, CalendarDays, Clock, MapPin, ListTodo, FileText, Megaphone
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';
import type { GaOverviewResponse, ScOverviewResponse, IgOverviewResponse } from '../dashboard.types';
import type { IntegrationSnapshotMeta } from '../../integration-snapshots';
import type { ShootResponse } from '../../shoots/api/shoot.types';
import type { TaskResponse } from '../../tasks/api/task.types';
import { MiniStat, QuickLink, EmptyState } from './DashboardCards';
import { fmt } from '../dashboard.utils';

interface OverviewTabProps {
    ga: GaOverviewResponse | undefined;
    sc: ScOverviewResponse | undefined;
    ig: IgOverviewResponse | undefined;
    navigate: (path: string) => void;
    upcomingShoots: (ShootResponse & { shootDate: string })[];
    activeTasks: TaskResponse[];
    gaSnapshot: IntegrationSnapshotMeta | undefined;
    scSnapshot: IntegrationSnapshotMeta | undefined;
    igSnapshot: IntegrationSnapshotMeta | undefined;
    gaConnected: boolean;
    scConnected: boolean;
    igConnected: boolean;
    googleAdsConnected: boolean;
    metaAdsConnected: boolean;
}

export function OverviewTab({
    ga, sc, ig, navigate, upcomingShoots, activeTasks,
    gaSnapshot, scSnapshot, igSnapshot,
    gaConnected, scConnected, igConnected, googleAdsConnected, metaAdsConnected,
}: OverviewTabProps) {
    const stats = [
        { label: 'Ziyaretçi', value: gaConnected ? fmt(ga!.totalUsers) : '—', icon: Users, color: 'from-blue-500/15 to-blue-400/5 border-blue-500/20', textColor: 'text-blue-400', connected: gaConnected, snapshot: gaSnapshot },
        { label: 'Sayfa Görüntüleme', value: gaConnected ? fmt(ga!.pageViews) : '—', icon: Eye, color: 'from-violet-500/15 to-violet-400/5 border-violet-500/20', textColor: 'text-violet-400', connected: gaConnected, snapshot: gaSnapshot },
        { label: 'Tıklama (SC)', value: scConnected ? fmt(sc!.totalClicks) : '—', icon: MousePointerClick, color: 'from-emerald-500/15 to-emerald-400/5 border-emerald-500/20', textColor: 'text-emerald-400', connected: scConnected, snapshot: scSnapshot },
        { label: 'Takipçi', value: igConnected ? fmt(ig!.followersCount) : '—', icon: Instagram, color: 'from-pink-500/15 to-pink-400/5 border-pink-500/20', textColor: 'text-pink-400', connected: igConnected, snapshot: igSnapshot },
    ];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {stats.map(s => (
                    <div key={s.label} className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br ${s.color} p-5`}>
                        <s.icon className={`w-8 h-8 ${s.textColor} opacity-20 absolute -top-1 -right-1`} />
                        <p className={`text-[11px] font-semibold uppercase tracking-wider ${s.textColor} mb-2`}>{s.label}</p>
                        <p className="text-2xl font-bold text-white tracking-tight">{s.value}</p>
                        <p className="text-[10px] text-zinc-600 mt-1">
                            {snapshotLabel(s.connected, s.snapshot)}
                        </p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
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
                    {gaConnected && ga!.dailyTrend?.length > 0 ? (
                        <ResponsiveContainer width="100%" height={220}>
                            <AreaChart data={ga!.dailyTrend}>
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

                <div className="bg-[#0C0C0E] border border-white/[0.06] rounded-2xl p-5 flex flex-col">
                    <h3 className="text-sm font-semibold text-white mb-4">Hızlı Erişim</h3>
                    <div className="space-y-2 flex-1">
                        <QuickLink icon={Globe} label="Google Analytics" to="/client/google-analytics" connected={gaConnected} navigate={navigate} />
                        <QuickLink icon={Search} label="Search Console" to="/client/search-console" connected={scConnected} navigate={navigate} />
                        <QuickLink icon={Instagram} label="Instagram" to="/client/instagram" connected={igConnected} navigate={navigate} />
                        <QuickLink icon={Megaphone} label="Google Ads" to="/client/google-ads" connected={googleAdsConnected} navigate={navigate} />
                        <QuickLink icon={Megaphone} label="Meta Ads" to="/client/meta-ads" connected={metaAdsConnected} navigate={navigate} />
                        <QuickLink icon={FileText} label="İçerik Planı" to="/client/content-plans" connected navigate={navigate} />
                        <QuickLink icon={CalendarDays} label="Çekim Takvimi" to="/client/shoots" connected navigate={navigate} />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-[#0C0C0E] border border-white/[0.06] rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-white">Top Anahtar Kelimeler</h3>
                        <Search className="w-4 h-4 text-emerald-400" />
                    </div>
                    {scConnected && sc!.topQueries?.length > 0 ? (
                        <div className="space-y-2.5">
                            {sc!.topQueries.slice(0, 5).map((q: { query: string; clicks: number }, i: number) => (
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

                <div className="bg-[#0C0C0E] border border-white/[0.06] rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-white">Instagram Özeti</h3>
                        <Instagram className="w-4 h-4 text-pink-400" />
                    </div>
                    {igConnected ? (
                        <div className="grid grid-cols-2 gap-3">
                            <MiniStat label="Takipçi" value={fmt(ig!.followersCount)} color="text-pink-400" />
                            <MiniStat label="Gönderi" value={fmt(ig!.mediaCount)} color="text-violet-400" />
                            <MiniStat label="Erişim" value={fmt(ig!.reach)} color="text-blue-400" />
                            <MiniStat label="Etkileşim" value={fmt(ig!.totalLikes + ig!.totalComments)} color="text-amber-400" />
                            <MiniStat label="Profil Ziyareti" value={fmt(ig!.profileViews)} color="text-emerald-400" />
                            <MiniStat label="Site Tıklama" value={fmt(ig!.websiteClicks)} color="text-cyan-400" />
                        </div>
                    ) : (
                        <EmptyState icon={Instagram} text="Instagram bağlayın" small />
                    )}
                </div>

                <div className="bg-[#0C0C0E] border border-white/[0.06] rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-white">Yaklaşanlar</h3>
                        <CalendarDays className="w-4 h-4 text-violet-400" />
                    </div>
                    <div className="space-y-2">
                        {upcomingShoots.slice(0, 3).map((s) => {
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
                        {activeTasks.slice(0, 2).map((t) => (
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

function snapshotLabel(connected: boolean, snapshot: IntegrationSnapshotMeta | undefined) {
    if (!connected) {
        return snapshot?.status === 'PENDING' ? 'Veriler hazırlanıyor' : 'Bağlantı gerekli';
    }
    if (snapshot?.status === 'FAILED') {
        return 'Son veri korunuyor';
    }
    if (!snapshot?.lastSyncedAt) {
        return 'Veriler hazırlanıyor';
    }
    return `Son: ${new Date(snapshot.lastSyncedAt).toLocaleTimeString('tr-TR', {
        hour: '2-digit',
        minute: '2-digit',
    })}`;
}
