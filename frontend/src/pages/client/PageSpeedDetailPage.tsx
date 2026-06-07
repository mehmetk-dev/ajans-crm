import { useEffect, useMemo, useState, type ElementType } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    AlertCircle,
    ArrowLeft,
    BarChart3,
    CheckCircle2,
    CircleAlert,
    ExternalLink,
    Gauge,
    Globe2,
    Info,
    Loader2,
    Monitor,
    RefreshCw,
    Save,
    Search,
    ShieldCheck,
    Smartphone,
    Sparkles,
    TrendingUp,
    XCircle,
    Zap,
} from 'lucide-react';
import { webDesignApi, type PageSpeedReport, type PageSpeedScore } from '../../api/webDesign';

type Strategy = 'mobile' | 'desktop';
type HealthTone = 'good' | 'warning' | 'bad' | 'unknown';

type ToneStyle = {
    label: string;
    text: string;
    border: string;
    bg: string;
    iconBg: string;
    softBg: string;
};

const toneStyles: Record<HealthTone, ToneStyle> = {
    good: {
        label: 'Sağlıklı',
        text: 'text-emerald-400',
        border: 'border-emerald-500/20',
        bg: 'bg-emerald-500/10',
        iconBg: 'bg-emerald-500/15',
        softBg: 'bg-emerald-500/5',
    },
    warning: {
        label: 'Dikkat',
        text: 'text-amber-400',
        border: 'border-amber-500/20',
        bg: 'bg-amber-500/10',
        iconBg: 'bg-amber-500/15',
        softBg: 'bg-amber-500/5',
    },
    bad: {
        label: 'Kritik',
        text: 'text-red-400',
        border: 'border-red-500/20',
        bg: 'bg-red-500/10',
        iconBg: 'bg-red-500/15',
        softBg: 'bg-red-500/5',
    },
    unknown: {
        label: 'Bekliyor',
        text: 'text-zinc-500',
        border: 'border-white/[0.08]',
        bg: 'bg-white/[0.04]',
        iconBg: 'bg-white/[0.05]',
        softBg: 'bg-white/[0.02]',
    },
};

function normalizeInputUrl(value: string): string {
    const trimmed = value.trim();
    if (!trimmed) return '';
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
    return `https://${trimmed}`;
}

function scoreTone(score?: number | null): HealthTone {
    if (score == null) return 'unknown';
    if (score >= 90) return 'good';
    if (score >= 50) return 'warning';
    return 'bad';
}

function metricTone(metric: 'lcp' | 'fcp' | 'tbt' | 'cls' | 'fid', value?: number | null): HealthTone {
    if (value == null) return 'unknown';
    if (metric === 'cls') {
        if (value <= 0.1) return 'good';
        if (value <= 0.25) return 'warning';
        return 'bad';
    }
    if (metric === 'lcp') {
        if (value <= 2500) return 'good';
        if (value <= 4000) return 'warning';
        return 'bad';
    }
    if (metric === 'fcp') {
        if (value <= 1800) return 'good';
        if (value <= 3000) return 'warning';
        return 'bad';
    }
    if (metric === 'fid') {
        if (value <= 100) return 'good';
        if (value <= 300) return 'warning';
        return 'bad';
    }
    if (value <= 200) return 'good';
    if (value <= 600) return 'warning';
    return 'bad';
}

function statusIcon(tone: HealthTone): ElementType {
    if (tone === 'good') return CheckCircle2;
    if (tone === 'warning') return CircleAlert;
    if (tone === 'bad') return XCircle;
    return Info;
}

function formatMs(ms?: number | null): string {
    if (ms == null) return '-';
    if (ms < 1000) return `${Math.round(ms)} ms`;
    return `${(ms / 1000).toFixed(2)} sn`;
}

function formatCls(value?: number | null): string {
    if (value == null) return '-';
    return value.toFixed(3);
}

function formatDate(value?: string | null): string {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '-';
    return date.toLocaleString('tr-TR', {
        day: '2-digit',
        month: 'long',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function averageScore(score?: PageSpeedScore): number | null {
    if (!score) return null;
    const scores = [score.performance, score.accessibility, score.bestPractices, score.seo]
        .filter((value): value is number => value != null);
    if (scores.length === 0) return null;
    return Math.round(scores.reduce((sum, value) => sum + value, 0) / scores.length);
}

function overallMessage(tone: HealthTone, strategy: Strategy): string {
    const device = strategy === 'mobile' ? 'mobilde' : 'masaüstünde';
    if (tone === 'good') return `Site ${device} iyi durumda. Ziyaretçi deneyimi ve Google sinyalleri sağlıklı görünüyor.`;
    if (tone === 'warning') return `Site ${device} çalışıyor ama hız ve deneyim tarafında iyileştirme alanları var.`;
    if (tone === 'bad') return `Site ${device} ziyaretçiyi kaybettirebilecek seviyede sorunlar gösteriyor. Öncelik hız ve stabilite olmalı.`;
    return 'Google PageSpeed verisi henüz okunamadı. Bağlantı durumunu ve site erişimini kontrol edin.';
}

function HealthSummary({ score, strategy }: { score?: PageSpeedScore; strategy: Strategy }) {
    const average = averageScore(score);
    const tone = score?.fetchError ? 'bad' : scoreTone(average);
    const style = toneStyles[tone];
    const Icon = statusIcon(tone);

    return (
        <section className={`rounded-2xl border ${style.border} ${style.softBg} p-5 md:p-6`}>
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-start gap-4">
                    <div className={`h-12 w-12 rounded-xl ${style.iconBg} flex items-center justify-center shrink-0`}>
                        <Icon className={`w-6 h-6 ${style.text}`} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <h2 className="text-lg font-bold text-white">Genel Site Sağlığı</h2>
                            <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-full ${style.bg} ${style.text} border ${style.border}`}>
                                {style.label}
                            </span>
                        </div>
                        <p className="text-sm text-zinc-400 mt-2 max-w-2xl leading-relaxed">
                            {overallMessage(tone, strategy)}
                        </p>
                    </div>
                </div>

                <div className="flex items-end gap-3">
                    <div className="text-right">
                        <p className="text-[11px] text-zinc-500 uppercase tracking-wider">Ortalama Skor</p>
                        <p className={`text-5xl font-bold leading-none ${style.text}`}>{average ?? '-'}</p>
                    </div>
                    <p className="text-zinc-600 text-sm pb-1">/ 100</p>
                </div>
            </div>
        </section>
    );
}

function DeviceCompareCard({ label, icon: Icon, score, active, onClick }: {
    label: string;
    icon: ElementType;
    score?: PageSpeedScore;
    active: boolean;
    onClick: () => void;
}) {
    const avg = averageScore(score);
    const tone = score?.fetchError ? 'bad' : scoreTone(avg);
    const style = toneStyles[tone];

    return (
        <button
            onClick={onClick}
            className={`text-left rounded-2xl border p-4 transition-all ${
                active ? `${style.border} ${style.softBg}` : 'border-white/[0.06] bg-[#0C0C0E] hover:border-white/[0.12]'
            }`}
        >
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-xl ${style.iconBg} flex items-center justify-center`}>
                        <Icon className={`w-5 h-5 ${style.text}`} />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-white">{label}</p>
                        <p className={`text-[11px] ${style.text}`}>{style.label}</p>
                    </div>
                </div>
                <p className={`text-2xl font-bold ${style.text}`}>{avg ?? '-'}</p>
            </div>
        </button>
    );
}

function ConnectionCard({ active, label, value, icon: Icon, healthyText, missingText }: {
    active: boolean;
    label: string;
    value: string;
    icon: ElementType;
    healthyText: string;
    missingText: string;
}) {
    const tone: HealthTone = active ? 'good' : 'warning';
    const style = toneStyles[tone];
    const StatusIcon = statusIcon(tone);

    return (
        <div className={`rounded-2xl border ${style.border} ${style.softBg} p-4 min-w-0`}>
            <div className="flex items-start gap-3">
                <div className={`h-10 w-10 rounded-xl ${style.iconBg} flex items-center justify-center shrink-0`}>
                    <Icon className={`w-5 h-5 ${style.text}`} />
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-white">{label}</p>
                        <StatusIcon className={`w-4 h-4 ${style.text} shrink-0`} />
                    </div>
                    <p className="text-xs text-zinc-500 truncate mt-1" title={value}>{value}</p>
                    <p className={`text-[11px] mt-3 ${style.text}`}>
                        {active ? healthyText : missingText}
                    </p>
                </div>
            </div>
        </div>
    );
}

function ScoreInsightCard({ icon: Icon, title, score, meaning, healthy, warning, bad }: {
    icon: ElementType;
    title: string;
    score?: number | null;
    meaning: string;
    healthy: string;
    warning: string;
    bad: string;
}) {
    const tone = scoreTone(score);
    const style = toneStyles[tone];
    const StatusIcon = statusIcon(tone);
    const action = tone === 'good' ? healthy : tone === 'warning' ? warning : tone === 'bad' ? bad : 'Skor alındığında durum burada görünecek.';

    return (
        <div className={`rounded-2xl border ${style.border} bg-[#0C0C0E] p-5`}>
            <div className="flex items-start justify-between gap-3">
                <div className={`h-11 w-11 rounded-xl ${style.iconBg} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${style.text}`} />
                </div>
                <div className="flex items-center gap-2">
                    <StatusIcon className={`w-4 h-4 ${style.text}`} />
                    <span className={`text-[10px] font-semibold uppercase tracking-wider ${style.text}`}>
                        {style.label}
                    </span>
                </div>
            </div>
            <div className="mt-5 flex items-end gap-2">
                <p className={`text-4xl font-bold leading-none ${style.text}`}>{score ?? '-'}</p>
                <p className="text-sm text-zinc-600 pb-1">/ 100</p>
            </div>
            <h3 className="text-sm font-semibold text-white mt-4">{title}</h3>
            <p className="text-xs text-zinc-500 mt-2 leading-relaxed">{meaning}</p>
            <div className={`mt-4 rounded-xl ${style.softBg} border ${style.border} p-3`}>
                <p className={`text-xs leading-relaxed ${style.text}`}>{action}</p>
            </div>
        </div>
    );
}

function VitalCard({ metric, title, value, formatted, meaning, good, warning, bad }: {
    metric: 'lcp' | 'fcp' | 'tbt' | 'cls' | 'fid';
    title: string;
    value?: number | null;
    formatted: string;
    meaning: string;
    good: string;
    warning: string;
    bad: string;
}) {
    const tone = metricTone(metric, value);
    const style = toneStyles[tone];
    const StatusIcon = statusIcon(tone);
    const summary = tone === 'good' ? good : tone === 'warning' ? warning : tone === 'bad' ? bad : 'Bu metrik henüz ölçülemedi.';

    return (
        <div className={`rounded-2xl border ${style.border} bg-[#0C0C0E] p-4`}>
            <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-white">{title}</p>
                <StatusIcon className={`w-4 h-4 ${style.text}`} />
            </div>
            <p className={`text-2xl font-bold mt-3 ${style.text}`}>{formatted}</p>
            <p className="text-[11px] text-zinc-500 mt-2 leading-relaxed">{meaning}</p>
            <p className={`text-[11px] mt-3 leading-relaxed ${style.text}`}>{summary}</p>
        </div>
    );
}

function ReadinessRow({ done, label, detail }: { done: boolean; label: string; detail: string }) {
    return (
        <div className="flex items-start gap-3 py-3 border-b border-white/[0.04] last:border-b-0">
            <div className={`h-6 w-6 rounded-lg flex items-center justify-center shrink-0 ${
                done ? 'bg-emerald-500/10' : 'bg-amber-500/10'
            }`}>
                {done ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <CircleAlert className="w-3.5 h-3.5 text-amber-400" />}
            </div>
            <div>
                <p className="text-sm font-medium text-white">{label}</p>
                <p className="text-xs text-zinc-500 mt-0.5">{detail}</p>
            </div>
        </div>
    );
}

export default function PageSpeedDetailPage() {
    const navigate = useNavigate();
    const [report, setReport] = useState<PageSpeedReport | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [strategy, setStrategy] = useState<Strategy>('mobile');
    const [websiteInput, setWebsiteInput] = useState('');
    const [formError, setFormError] = useState('');

    const score: PageSpeedScore | undefined = strategy === 'mobile' ? report?.mobile : report?.desktop;
    const normalizedInput = useMemo(() => normalizeInputUrl(websiteInput), [websiteInput]);
    const mobileAverage = averageScore(report?.mobile);
    const desktopAverage = averageScore(report?.desktop);

    const loadReport = async (refresh = false) => {
        if (refresh) setRefreshing(true);
        else setLoading(true);

        try {
            const data = await webDesignApi.getMyPageSpeed(refresh);
            setReport(data);
            setWebsiteInput(data.websiteUrl ?? '');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadReport();
    }, []);

    const handleSaveWebsite = async () => {
        setFormError('');
        if (!normalizedInput) {
            setFormError('Web sitesi adresi giriniz.');
            return;
        }

        setSaving(true);
        try {
            const data = await webDesignApi.updateMyWebsite(normalizedInput);
            setReport(data);
            setWebsiteInput(data.websiteUrl ?? normalizedInput);
        } catch {
            setFormError('Web sitesi kaydedilemedi. Adresi kontrol edip tekrar deneyin.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="flex items-center gap-3 text-zinc-500 text-sm">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Web Tasarım verileri yükleniyor...
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex items-start gap-4">
                    <button
                        onClick={() => navigate('/client/analytics')}
                        className="h-10 w-10 rounded-xl bg-[#0C0C0E] border border-white/[0.06] text-zinc-400 hover:text-white flex items-center justify-center"
                        title="Geri"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                            <Gauge className="w-6 h-6 text-[#F5BEC8]" />
                            Site Sağlık Merkezi
                        </h1>
                        <p className="text-sm text-zinc-500 mt-1">
                            Site hızı, kullanıcı deneyimi, SEO ve Google bağlantılarını anlaşılır kartlarla takip edin.
                        </p>
                    </div>
                </div>

                <button
                    onClick={() => loadReport(true)}
                    disabled={refreshing || !report?.websiteUrl}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#0C0C0E] border border-white/[0.06] text-sm text-zinc-300 hover:text-white disabled:opacity-50"
                >
                    <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                    Verileri Yenile
                </button>
            </div>

            <section className="rounded-2xl border border-white/[0.06] bg-[#0C0C0E] p-5">
                <div className="flex items-center gap-2 mb-4">
                    <Globe2 className="w-4 h-4 text-[#F5BEC8]" />
                    <h2 className="text-sm font-semibold text-zinc-200">Site Bağlantısı</h2>
                </div>
                <div className="flex flex-col md:flex-row gap-3">
                    <input
                        value={websiteInput}
                        onChange={(event) => setWebsiteInput(event.target.value)}
                        placeholder="https://ornek.com"
                        className="flex-1 h-11 rounded-xl bg-white/[0.03] border border-white/[0.06] px-4 text-sm text-white outline-none focus:border-[#C8697A]/50"
                    />
                    <button
                        onClick={handleSaveWebsite}
                        disabled={saving}
                        className="h-11 px-5 rounded-xl bg-[#C8697A] hover:bg-[#B5556A] text-white text-sm font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Bağlantıyı Kaydet
                    </button>
                </div>
                {formError && <p className="text-xs text-red-400 mt-2">{formError}</p>}
                {report?.websiteUrl && (
                    <a
                        href={report.websiteUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 inline-flex items-center gap-1.5 text-xs text-[#F5BEC8] hover:text-white"
                    >
                        {report.websiteUrl}
                        <ExternalLink className="w-3 h-3" />
                    </a>
                )}
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-4">
                <HealthSummary score={score} strategy={strategy} />

                <section className="rounded-2xl border border-white/[0.06] bg-[#0C0C0E] p-5">
                    <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="w-4 h-4 text-[#F5BEC8]" />
                        <h2 className="text-sm font-semibold text-zinc-200">Hazırlık Kontrolü</h2>
                    </div>
                    <ReadinessRow
                        done={Boolean(report?.websiteUrl)}
                        label="Web sitesi tanımlı"
                        detail={report?.websiteUrl ?? 'Site adresi eklenmeden sağlık takibi başlayamaz.'}
                    />
                    <ReadinessRow
                        done={Boolean(report?.searchConsoleConnected)}
                        label="Search Console bağlı"
                        detail={report?.searchConsoleConnected ? 'Arama performansı okunabilir.' : 'Google arama verileri için bağlantı bekleniyor.'}
                    />
                    <ReadinessRow
                        done={Boolean(report?.analyticsConnected)}
                        label="Google Analytics bağlı"
                        detail={report?.analyticsConnected ? 'Ziyaretçi davranışları okunabilir.' : 'Trafik ve kullanıcı verileri için bağlantı bekleniyor.'}
                    />
                    <ReadinessRow
                        done={mobileAverage != null || desktopAverage != null}
                        label="PageSpeed ölçümü"
                        detail={mobileAverage != null || desktopAverage != null ? 'Mobil veya masaüstü skorları alındı.' : 'Google PageSpeed skoru henüz alınamadı.'}
                    />
                </section>
            </div>

            <section className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <ConnectionCard
                    active={Boolean(report?.websiteUrl)}
                    icon={Globe2}
                    label="Web Sitesi"
                    value={report?.websiteUrl ?? 'Tanımlı değil'}
                    healthyText="Sağlık ölçümü için site adresi hazır."
                    missingText="Önce site adresi eklenmeli."
                />
                <ConnectionCard
                    active={Boolean(report?.searchConsoleConnected)}
                    icon={Search}
                    label="Search Console"
                    value={report?.searchConsoleSiteUrl ?? 'Bağlantı yok'}
                    healthyText="Google arama verileri panelde kullanılabilir."
                    missingText="Arama verileri görünmez."
                />
                <ConnectionCard
                    active={Boolean(report?.analyticsConnected)}
                    icon={BarChart3}
                    label="Google Analytics"
                    value={report?.gaPropertyId ? `GA4 ${report.gaPropertyId}` : 'Bağlantı yok'}
                    healthyText="Ziyaretçi verileri panelde kullanılabilir."
                    missingText="Trafik verileri eksik kalır."
                />
            </section>

            <section className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <DeviceCompareCard
                    label="Mobil Deneyim"
                    icon={Smartphone}
                    score={report?.mobile}
                    active={strategy === 'mobile'}
                    onClick={() => setStrategy('mobile')}
                />
                <DeviceCompareCard
                    label="Masaüstü Deneyim"
                    icon={Monitor}
                    score={report?.desktop}
                    active={strategy === 'desktop'}
                    onClick={() => setStrategy('desktop')}
                />
            </section>

            {score?.fetchError && (
                <section className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5 flex gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-semibold text-amber-300">PageSpeed skoru şu an alınamadı</p>
                        <p className="text-xs text-zinc-500 mt-1 leading-relaxed">{score.fetchError}</p>
                        <p className="text-xs text-amber-300 mt-3">
                            Site tarayıcıda açılsa bile Google Lighthouse botu engelleniyor, yavaş yanıt alıyor veya SSL/yönlendirme sorununa takılıyor olabilir.
                        </p>
                    </div>
                </section>
            )}

            <section className="rounded-2xl border border-white/[0.06] bg-[#0C0C0E] p-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
                    <div>
                        <h2 className="text-sm font-semibold text-zinc-200">PageSpeed Skorları</h2>
                        <p className="text-xs text-zinc-500 mt-1">
                            Seçili cihaz: {strategy === 'mobile' ? 'Mobil' : 'Masaüstü'} • Son ölçüm: {formatDate(score?.fetchedAt)}
                        </p>
                    </div>
                    <div className="flex bg-white/[0.04] border border-white/[0.06] rounded-lg p-0.5">
                        <button
                            onClick={() => setStrategy('mobile')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium ${strategy === 'mobile' ? 'bg-white/[0.08] text-white' : 'text-zinc-400'}`}
                        >
                            <Smartphone className="w-3.5 h-3.5" />
                            Mobil
                        </button>
                        <button
                            onClick={() => setStrategy('desktop')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium ${strategy === 'desktop' ? 'bg-white/[0.08] text-white' : 'text-zinc-400'}`}
                        >
                            <Monitor className="w-3.5 h-3.5" />
                            Masaüstü
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    <ScoreInsightCard
                        icon={Zap}
                        title="Performans"
                        score={score?.performance}
                        meaning="Sayfanın ne kadar hızlı açıldığını ve kullanıcıya ne kadar çabuk tepki verdiğini gösterir."
                        healthy="Hız iyi. Kullanıcı siteye girince bekleme hissi düşük olur."
                        warning="Site açılıyor ama görsel, yazılım veya sunucu tarafında hızlandırma yapılabilir."
                        bad="Ziyaretçiler sayfa yüklenmeden çıkabilir. Görseller, cache ve sunucu yanıtı öncelikli incelenmeli."
                    />
                    <ScoreInsightCard
                        icon={ShieldCheck}
                        title="Erişilebilirlik"
                        score={score?.accessibility}
                        meaning="Buton, yazı, kontrast ve ekran okuyucu uyumluluğunun ne kadar sağlıklı olduğunu ölçer."
                        healthy="Arayüz okunabilir ve erişilebilir durumda."
                        warning="Bazı yazılar, kontrastlar veya alan etiketleri iyileştirilebilir."
                        bad="Kullanıcıların bir kısmı siteyi kullanmakta zorlanabilir. Formlar, renkler ve etiketler kontrol edilmeli."
                    />
                    <ScoreInsightCard
                        icon={CheckCircle2}
                        title="Teknik Sağlık"
                        score={score?.bestPractices}
                        meaning="SSL, güvenli kaynaklar, tarayıcı uyumu ve temel teknik kaliteyi gösterir."
                        healthy="Teknik temel iyi görünüyor."
                        warning="Bazı tarayıcı/güvenlik uyarıları iyileştirilebilir."
                        bad="Sitede güvenlik veya eski teknoloji kaynaklı problemler olabilir."
                    />
                    <ScoreInsightCard
                        icon={Search}
                        title="SEO"
                        score={score?.seo}
                        meaning="Google'ın sayfayı anlaması için başlık, açıklama, link ve taranabilirlik sinyallerini ölçer."
                        healthy="Arama motorları sayfayı anlamakta zorlanmıyor."
                        warning="Başlık, açıklama veya sayfa yapısı daha iyi hale getirilebilir."
                        bad="Google görünürlüğü zarar görebilir. Meta alanları, indekslenebilirlik ve sayfa yapısı incelenmeli."
                    />
                </div>
            </section>

            <section className="rounded-2xl border border-white/[0.06] bg-[#0C0C0E] p-5">
                <div className="flex items-center gap-2 mb-5">
                    <TrendingUp className="w-4 h-4 text-[#F5BEC8]" />
                    <div>
                        <h2 className="text-sm font-semibold text-zinc-200">Kullanıcı Deneyimi Metrikleri</h2>
                        <p className="text-xs text-zinc-500 mt-1">Bu kartlar ziyaretçinin siteyi nasıl hissettiğini pratik dille anlatır.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
                    <VitalCard
                        metric="lcp"
                        title="Ana İçerik Hızı"
                        value={score?.lcpMs}
                        formatted={formatMs(score?.lcpMs)}
                        meaning="Sayfadaki ana görsel veya büyük içerik ne kadar sürede görünüyor?"
                        good="Ana içerik hızlı geliyor."
                        warning="İlk izlenim biraz yavaş olabilir."
                        bad="Kullanıcı sayfa açılmadan beklemek zorunda kalır."
                    />
                    <VitalCard
                        metric="fcp"
                        title="İlk Görünme"
                        value={score?.fcpMs}
                        formatted={formatMs(score?.fcpMs)}
                        meaning="Ekranda ilk yazı veya görselin görünme süresi."
                        good="Sayfa hızlı tepki veriyor."
                        warning="İlk görüntü gecikebilir."
                        bad="Boş ekran hissi oluşabilir."
                    />
                    <VitalCard
                        metric="tbt"
                        title="Tıklama Gecikmesi"
                        value={score?.tbtMs}
                        formatted={formatMs(score?.tbtMs)}
                        meaning="Sayfa açılırken tıklama ve kaydırmanın ne kadar bloklandığını gösterir."
                        good="Etkileşim akıcı."
                        warning="Bazı tıklamalar gecikmeli hissedilebilir."
                        bad="Site donuyor gibi algılanabilir."
                    />
                    <VitalCard
                        metric="cls"
                        title="Sayfa Kayması"
                        value={score?.clsValue}
                        formatted={formatCls(score?.clsValue)}
                        meaning="Sayfa açılırken buton ve yazıların yer değiştirip değiştirmediğini ölçer."
                        good="Sayfa stabil, kayma az."
                        warning="Bazı alanlar açılırken oynayabilir."
                        bad="Kullanıcı yanlış yere tıklayabilir."
                    />
                    <VitalCard
                        metric="fid"
                        title="İlk Tepki"
                        value={score?.fidMs}
                        formatted={formatMs(score?.fidMs)}
                        meaning="Kullanıcının ilk tıklamasına sitenin cevap verme süresi."
                        good="İlk tepki hızlı."
                        warning="İlk etkileşim biraz gecikebilir."
                        bad="Kullanıcı tıkladığında site geç cevap verebilir."
                    />
                </div>
            </section>
        </div>
    );
}
