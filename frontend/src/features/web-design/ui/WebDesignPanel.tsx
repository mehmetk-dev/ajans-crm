import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Gauge, RefreshCw, AlertCircle, Loader2, Smartphone, Monitor,
    Server, Calendar, ShieldCheck, Layers,
    CheckCircle2, ExternalLink, ArrowRight, BarChart3, Search,
} from 'lucide-react';
import type { PageSpeedReport, PageSpeedScore, Strategy } from '../webDesign.types';
import { webDesignApi } from '../api/webDesignApi';
import { formatMs, formatCls, formatDate, formatRelative, scoreColor, scoreRing } from '../model/webDesign.utils';
import { MaintenanceTimeline } from '../../maintenance-log';

interface Props {
    /** Belirtilmediğinde client endpoint'i kullanır (kendi şirketi). */
    companyId?: string;
}

function ScoreCircle({ label, score }: { label: string; score?: number | null }) {
    const value = score ?? 0;
    const radius = 32;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (value / 100) * circumference;

    return (
        <div className="flex flex-col items-center gap-2">
            <div className="relative w-20 h-20">
                <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                    <circle cx="40" cy="40" r={radius}
                            className="stroke-white/[0.06] fill-none" strokeWidth="6" />
                    {score != null && (
                        <circle cx="40" cy="40" r={radius}
                                className={`fill-none ${scoreRing(score)} transition-all duration-700`}
                                strokeWidth="6" strokeLinecap="round"
                                strokeDasharray={circumference} strokeDashoffset={offset} />
                    )}
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`text-xl font-bold ${scoreColor(score)}`}>
                        {score ?? '—'}
                    </span>
                </div>
            </div>
            <span className="text-[11px] text-zinc-400 text-center leading-tight">{label}</span>
        </div>
    );
}

function CoreVital({ label, value, hint }: { label: string; value: string; hint?: string }) {
    return (
        <div className="bg-white/[0.02] border border-white/[0.04] rounded-lg p-3" title={hint}>
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-0.5">{label}</p>
            <p className="text-sm font-semibold text-white">{value}</p>
        </div>
    );
}

function ScoresPanel({ report, refreshing, onRefresh, onDetail }: {
    report: PageSpeedReport | null;
    refreshing: boolean;
    onRefresh: () => void;
    onDetail?: () => void;
}) {
    const [strategy, setStrategy] = useState<Strategy>('mobile');
    const score: PageSpeedScore | undefined =
        strategy === 'mobile' ? report?.mobile : report?.desktop;
    const hasScores = [score?.performance, score?.accessibility, score?.bestPractices, score?.seo]
        .some(value => value != null);

    return (
        <div className="bg-[#0C0C0E] border border-white/[0.06] rounded-2xl p-5">
            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
                <div className="flex items-center gap-2">
                    <Gauge className="w-4 h-4 text-[#F5BEC8]" />
                    <h3 className="text-sm font-semibold text-zinc-200">Site Sağlık Skoru</h3>
                    {onDetail && (
                        <button
                            onClick={onDetail}
                            className="flex items-center gap-1 text-[11px] text-[#F5BEC8] hover:text-white transition-colors ml-1"
                        >
                            Detaylı Bak <ArrowRight className="w-3 h-3" />
                        </button>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex bg-white/[0.04] border border-white/[0.06] rounded-lg p-0.5">
                        <button
                            onClick={() => setStrategy('mobile')}
                            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                                strategy === 'mobile' ? 'bg-white/[0.08] text-white' : 'text-zinc-400 hover:text-zinc-200'
                            }`}
                        >
                            <Smartphone className="w-3 h-3" /> Mobil
                        </button>
                        <button
                            onClick={() => setStrategy('desktop')}
                            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                                strategy === 'desktop' ? 'bg-white/[0.08] text-white' : 'text-zinc-400 hover:text-zinc-200'
                            }`}
                        >
                            <Monitor className="w-3 h-3" /> Masaüstü
                        </button>
                    </div>
                    <button
                        onClick={onRefresh}
                        disabled={refreshing}
                        className="p-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors disabled:opacity-50"
                        title="Yenile"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {score?.fetchError && !hasScores ? (
                <div className="flex items-start gap-3 bg-amber-500/5 border border-amber-500/15 rounded-xl p-4">
                    <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                    <div className="text-xs">
                        <p className="text-amber-300 font-medium mb-1">Skor alınamadı</p>
                        <p className="text-zinc-500">{score.fetchError}</p>
                    </div>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-4 gap-3 mb-6">
                        <ScoreCircle label="Performans" score={score?.performance} />
                        <ScoreCircle label="Erişilebilirlik" score={score?.accessibility} />
                        <ScoreCircle label="En İyi Pratikler" score={score?.bestPractices} />
                        <ScoreCircle label="SEO" score={score?.seo} />
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-white/[0.04]">
                        <CoreVital label="LCP" value={formatMs(score?.lcpMs)} hint="Largest Contentful Paint" />
                        <CoreVital label="FCP" value={formatMs(score?.fcpMs)} hint="First Contentful Paint" />
                        <CoreVital label="TBT" value={formatMs(score?.tbtMs)} hint="Total Blocking Time" />
                        <CoreVital label="CLS" value={formatCls(score?.clsValue)} hint="Cumulative Layout Shift" />
                        <CoreVital label="FID" value={formatMs(score?.fidMs)} hint="Max Potential FID" />
                        <CoreVital label="Son ölçüm" value={formatRelative(score?.fetchedAt)} hint={score?.testedUrl ?? ''} />
                    </div>
                </>
            )}
        </div>
    );
}

function SiteConnectionCard({ report }: { report: PageSpeedReport | null }) {
    if (!report?.websiteUrl && !report?.analyticsConnected && !report?.searchConsoleConnected) {
        return null;
    }

    const items = [
        {
            icon: ExternalLink,
            label: 'Web Sitesi',
            value: report?.websiteUrl ?? 'Tanımlı değil',
            active: Boolean(report?.websiteUrl),
        },
        {
            icon: Search,
            label: 'Search Console',
            value: report?.searchConsoleSiteUrl ?? 'Bağlantı yok',
            active: Boolean(report?.searchConsoleConnected),
        },
        {
            icon: BarChart3,
            label: 'Google Analytics',
            value: report?.gaPropertyId ? `GA4 ${report.gaPropertyId}` : 'Bağlantı yok',
            active: Boolean(report?.analyticsConnected),
        },
    ];

    return (
        <div className="bg-[#0C0C0E] border border-white/[0.06] rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-semibold text-zinc-200">Site Bağlantıları</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {items.map((item) => {
                    const Icon = item.icon;
                    return (
                        <div key={item.label} className="bg-white/[0.02] border border-white/[0.04] rounded-lg p-3 flex items-start gap-3">
                            <div className={`h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                item.active ? 'bg-emerald-500/10' : 'bg-white/[0.04]'
                            }`}>
                                <Icon className={`w-4 h-4 ${item.active ? 'text-emerald-400' : 'text-zinc-500'}`} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-0.5">{item.label}</p>
                                <p className="text-sm font-semibold text-white truncate" title={item.value}>{item.value}</p>
                                <p className={`text-[10px] mt-1 ${item.active ? 'text-emerald-400' : 'text-zinc-600'}`}>
                                    {item.active ? 'Bağlı' : 'Bekliyor'}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function InfrastructureCard({ report }: { report: PageSpeedReport | null }) {
    const items: Array<{ icon: typeof Server; label: string; value: string }> = [];

    if (report?.websiteUrl) items.push({ icon: ExternalLink, label: 'Web Adresi', value: report.websiteUrl });
    if (report?.hostingProvider) items.push({ icon: Server, label: 'Hosting', value: report.hostingProvider });
    if (report?.domainExpiry) items.push({ icon: Calendar, label: 'Domain Bitiş', value: formatDate(report.domainExpiry) });
    if (report?.sslExpiry) items.push({ icon: ShieldCheck, label: 'SSL Bitiş', value: formatDate(report.sslExpiry) });
    if (report?.cmsType) {
        items.push({
            icon: Layers,
            label: 'CMS',
            value: report.cmsVersion ? `${report.cmsType} ${report.cmsVersion}` : report.cmsType,
        });
    }
    if (report?.themeName) items.push({ icon: Layers, label: 'Tema', value: report.themeName });

    if (items.length === 0) return null;

    return (
        <div className="bg-[#0C0C0E] border border-white/[0.06] rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
                <Server className="w-4 h-4 text-[#F5BEC8]" />
                <h3 className="text-sm font-semibold text-zinc-200">Altyapı</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {items.map((item, i) => {
                    const Icon = item.icon;
                    return (
                        <div key={i} className="bg-white/[0.02] border border-white/[0.04] rounded-lg p-3 flex items-start gap-3">
                            <div className="h-8 w-8 rounded-lg bg-white/[0.04] flex items-center justify-center flex-shrink-0">
                                <Icon className="w-4 h-4 text-[#F5BEC8]" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-0.5">{item.label}</p>
                                <p className="text-sm font-semibold text-white truncate" title={item.value}>{item.value}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default function WebDesignPanel({ companyId }: Props) {
    const navigate = useNavigate();
    const [report, setReport] = useState<PageSpeedReport | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchReport = async (refresh = false) => {
        const data = companyId
            ? await webDesignApi.getCompanyPageSpeed(companyId, refresh)
            : await webDesignApi.getMyPageSpeed(refresh);
        setReport(data);
    };

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        fetchReport(false)
            .catch(() => { /* report already null */ })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [companyId]);

    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            await fetchReport(true);
        } finally {
            setRefreshing(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-[#0C0C0E] border border-white/[0.06] rounded-2xl p-12 flex items-center justify-center">
                <Loader2 className="w-5 h-5 text-zinc-500 animate-spin" />
            </div>
        );
    }

    if (!report?.configured && !report?.websiteUrl) {
        return (
            <div className="bg-amber-500/5 border border-amber-500/15 rounded-2xl p-5 flex items-start gap-4">
                <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                    <h3 className="text-sm font-semibold text-amber-300">Web Tasarım Paneli Hazır Değil</h3>
                    <p className="text-xs text-zinc-500 mt-1">
                        Şirket için web sitesi adresi tanımlı değil. Yönetici panelinden eklendiğinde site sağlık skorları
                        burada görünecek.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <ScoresPanel report={report} refreshing={refreshing} onRefresh={handleRefresh}
                onDetail={!companyId ? () => navigate('/client/web-design') : undefined} />
            <SiteConnectionCard report={report} />
            <InfrastructureCard report={report} />
            <MaintenanceTimeline companyId={companyId} />
        </div>
    );
}
