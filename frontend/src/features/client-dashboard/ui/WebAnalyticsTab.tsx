import {
    Users, Eye, MousePointerClick, ArrowUpRight, ArrowDownRight,
    Clock, Globe, Search, ChevronRight, FileText, TrendingUp, BarChart3, Zap
} from 'lucide-react';
import {
    AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';
import type { GaOverviewResponse, ScOverviewResponse } from '../dashboard.types';
import { MetricCard, ChartCard, ListCard, EmptyState } from './DashboardCards';
import { fmt, pct, dur } from '../dashboard.utils';

interface WebAnalyticsTabProps {
    ga: GaOverviewResponse | undefined;
    sc: ScOverviewResponse | undefined;
    navigate: (path: string) => void;
    gaConnected: boolean;
    scConnected: boolean;
}

export function WebAnalyticsTab({ ga, sc, navigate, gaConnected, scConnected }: WebAnalyticsTabProps) {
    return (
        <div className="space-y-6">
            {gaConnected ? (
                <>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                        <MetricCard label="Oturumlar" value={fmt(ga!.sessions)} icon={Zap} color="violet" />
                        <MetricCard label="Kullanıcılar" value={fmt(ga!.totalUsers)} icon={Users} color="blue" />
                        <MetricCard label="Yeni Kullanıcılar" value={fmt(ga!.newUsers)} icon={ArrowUpRight} color="emerald" />
                        <MetricCard label="Sayfa Görüntüleme" value={fmt(ga!.pageViews)} icon={Eye} color="pink" />
                        <MetricCard label="Hemen Çıkma" value={pct(ga!.bounceRate)} icon={ArrowDownRight} color="amber" />
                        <MetricCard label="Ort. Süre" value={dur(ga!.avgSessionDuration)} icon={Clock} color="cyan" />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <ChartCard title="Günlük Trafik" subtitle="Oturum & Kullanıcı">
                            <ResponsiveContainer width="100%" height={240}>
                                <AreaChart data={ga!.dailyTrend}>
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
                            {ga!.trafficSources?.length > 0 ? (
                                <ResponsiveContainer width="100%" height={240}>
                                    <BarChart data={ga!.trafficSources.slice(0, 6)} layout="vertical">
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

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <ListCard title="Popüler Sayfalar" icon={FileText} items={ga!.topPages?.slice(0, 8).map((p: { name: string; value: number }) => ({ label: p.name, value: fmt(p.value) }))} />
                        <ListCard title="Ülkeler" icon={Globe} items={ga!.topCountries?.slice(0, 8).map((c: { name: string; value: number }) => ({ label: c.name, value: fmt(c.value) }))} />
                    </div>
                </>
            ) : (
                <EmptyState icon={Globe} text="Google Analytics bağlayarak web performansınızı görün" action={() => navigate('/client/analytics')} actionLabel="Analytics Bağla" />
            )}

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
                        <MetricCard label="Toplam Tıklama" value={fmt(sc!.totalClicks)} icon={MousePointerClick} color="emerald" />
                        <MetricCard label="Gösterim" value={fmt(sc!.totalImpressions)} icon={Eye} color="blue" />
                        <MetricCard label="Ort. TO" value={pct(sc!.avgCtr)} icon={TrendingUp} color="violet" />
                        <MetricCard label="Ort. Sıra" value={sc!.avgPosition?.toFixed(1)} icon={BarChart3} color="amber" />
                    </div>
                ) : (
                    <EmptyState icon={Search} text="Search Console bağlayın" action={() => navigate('/client/analytics')} actionLabel="SC Bağla" />
                )}
            </div>
        </div>
    );
}