import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    BarChart3, Globe, Instagram, CalendarDays, Loader2, RefreshCw
} from 'lucide-react';
import { ServiceBlurOverlay } from '../../../components/ServiceUpsellOverlay';
import { useClientDashboard, useRefreshDashboard } from '../useClientDashboard';
import type { TabKey } from '../dashboard.types';
import { OverviewTab } from '../ui/OverviewTab';
import { WebAnalyticsTab } from '../ui/WebAnalyticsTab';
import { SocialTab } from '../ui/SocialTab';
import { ScheduleTab } from '../ui/ScheduleTab';

const TABS: { key: TabKey; label: string; icon: typeof Globe; service?: string }[] = [
    { key: 'overview', label: 'Genel Bakış', icon: BarChart3 },
    { key: 'web', label: 'Web Performansı', icon: Globe, service: 'DIGITAL_MARKETING' },
    { key: 'social', label: 'Sosyal Medya', icon: Instagram, service: 'SOCIAL_MEDIA' },
    { key: 'schedule', label: 'Takvim & Görevler', icon: CalendarDays, service: 'PRODUCTION' },
];

export default function ClientDashboardPage() {
    const navigate = useNavigate();
    const [tab, setTab] = useState<TabKey>('overview');
    const [refreshing, setRefreshing] = useState<string | null>(null);
    const { refreshTab } = useRefreshDashboard();

    const {
        isLoading, ga, sc, ig, shoots, tasks,
        gaSnapshot, scSnapshot, igSnapshot,
        gaConnected, scConnected, igConnected,
        hasService, hasProduction, hasContentMarketing,
    } = useClientDashboard();

    const upcomingShoots = useMemo(() => {
        const now = new Date();
        return shoots
            .filter((s): s is typeof s & { shootDate: string } =>
                s.status === 'PLANNED' && Boolean(s.shootDate) && new Date(s.shootDate!) >= now)
            .sort((a, b) => new Date(a.shootDate).getTime() - new Date(b.shootDate).getTime())
            .slice(0, 4);
    }, [shoots]);

    const activeTasks = useMemo(() =>
        tasks.filter(t => t.status !== 'DONE').slice(0, 5)
    , [tasks]);

    const hour = new Date().getHours();
    const greeting = hour < 6 ? 'Hayırlı geceler' : hour < 12 ? 'Günaydın' : hour < 18 ? 'İyi günler' : 'İyi akşamlar';

    const handleRefresh = async () => {
        setRefreshing(tab);
        try {
            await refreshTab(tab);
        } finally {
            setRefreshing(null);
        }
    };

    return (
        <div className="space-y-6">
            <section className="fog-hero-card p-7 md:p-9">
                <div className="relative z-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                    <div className="space-y-3">
                        <div className="fog-chip inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] uppercase tracking-[0.18em]">
                            <span className="w-1.5 h-1.5 rounded-full bg-pink-400" />
                            Dijital Performans
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
                            {greeting}
                        </h1>
                        <p className="text-sm text-zinc-400 max-w-xl">
                            Tüm dijital kanallarınızın son ölçülen performansı tek bakışta.
                        </p>
                    </div>
                    <div className="hidden md:flex items-center gap-2 text-xs text-zinc-500">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="font-medium tracking-wider uppercase">Snapshot Veriler</span>
                    </div>
                </div>
            </section>

            <div className="flex gap-1.5 p-1 bg-[#0C0C0E] border border-white/[0.06] rounded-2xl overflow-x-auto">
                {TABS.map(t => {
                    if (t.service && !hasService(t.service)) return null;
                    return (
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
                    );
                })}
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-6 h-6 text-pink-400 animate-spin" />
                </div>
            ) : (
                <>
                    <div className="flex justify-end -mt-2">
                        <button
                            onClick={handleRefresh}
                            disabled={!!refreshing}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium text-zinc-500 hover:text-white hover:bg-white/[0.06] border border-white/[0.06] transition-all disabled:opacity-40"
                        >
                            <RefreshCw className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`} />
                            {refreshing ? 'Yenileniyor…' : 'Yenile'}
                        </button>
                    </div>

                    {tab === 'overview' && (
                        <OverviewTab
                            ga={ga} sc={sc} ig={ig} navigate={navigate}
                            gaSnapshot={gaSnapshot} scSnapshot={scSnapshot} igSnapshot={igSnapshot}
                            upcomingShoots={upcomingShoots} activeTasks={activeTasks}
                            gaConnected={gaConnected} scConnected={scConnected} igConnected={igConnected}
                        />
                    )}
                    {tab === 'web' && (
                        hasService('DIGITAL_MARKETING')
                            ? <WebAnalyticsTab ga={ga} sc={sc} navigate={navigate} gaConnected={gaConnected} scConnected={scConnected} />
                            : <ServiceBlurOverlay service="DIGITAL_MARKETING" />
                    )}
                    {tab === 'social' && (
                        hasService('SOCIAL_MEDIA')
                            ? <SocialTab ig={ig} navigate={navigate} igConnected={igConnected} snapshot={igSnapshot} />
                            : <ServiceBlurOverlay service="SOCIAL_MEDIA" />
                    )}
                    {tab === 'schedule' && (
                        (hasProduction || hasContentMarketing)
                            ? <ScheduleTab upcomingShoots={upcomingShoots} activeTasks={activeTasks} navigate={navigate} />
                            : <ServiceBlurOverlay service="PRODUCTION" />
                    )}
                </>
            )}
        </div>
    );
}
