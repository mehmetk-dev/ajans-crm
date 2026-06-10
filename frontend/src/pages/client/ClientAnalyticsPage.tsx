import { useState } from 'react';
import {
    Globe, Instagram, Search, BarChart3, Activity,
    Camera, MapPin, Clock,
    Loader2, LayoutTemplate, TrendingUp, RefreshCw,
    AlertTriangle, CheckCircle2, XCircle, ChevronRight,
    Play, Image as ImageIcon
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { GoogleAnalyticsPanel, SearchConsolePanel, ContentPlanPanel, WebDesignPanel } from '../../components/analytics';
import { PostsColumn, ReelsColumn, StatsColumn } from '../../components/analytics/InstagramPanel';
import GoogleAdsPanel from '../../components/analytics/GoogleAdsPanel';
import MetaAdsPanel from '../../components/analytics/MetaAdsPanel';
import type { PageResponse } from '../../api/staff';
import { shootApi, shootKeys, type ShootResponse } from '../../features/shoots';
import { useAuth } from '../../store/AuthContext';
import { useRefreshAllClientData } from '../../hooks/useClientDataPrefetch';
import { useActiveServices } from '../../hooks/useActiveServices';
import { ServiceBlurOverlay } from '../../components/ServiceUpsellOverlay';

export default function ClientAnalyticsPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const refreshAll = useRefreshAllClientData();
    const [refreshing, setRefreshing] = useState(false);
    
    const { hasService } = useActiveServices();

    // Bu sayfaya COMPANY_USER dÄ±ÅŸÄ±nda birinin girmesi olaÄŸandÄ±ÅŸÄ±
    // ama test iÃ§in null kontrolÃ¼
    const companyId = user?.companyId ?? null;

    const handleRefresh = () => {
        setRefreshing(true);
        refreshAll();
        setTimeout(() => setRefreshing(false), 2000);
    };

    const showPanels = !!companyId;

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Raporlar & Analitik</h1>
                    <p className="text-zinc-500 text-[13px] mt-1">Åirketinizin dijital performans metrikleri</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="flex items-center gap-2 bg-[#0C0C0E] border border-white/[0.06] rounded-xl px-3 py-2 hover:border-[#C8697A]/30 transition-all disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 text-[#C8697A] ${refreshing ? 'animate-spin' : ''}`} />
                        <span className="text-xs text-zinc-400">{refreshing ? 'Yenileniyor...' : 'Verileri Yenile'}</span>
                    </button>
                    <div className="flex items-center gap-2 bg-[#0C0C0E] border border-white/[0.06] rounded-xl px-3 py-2 self-start">
                        <Activity className="w-4 h-4 text-[#C8697A]" />
                        <span className="text-xs text-zinc-400">CanlÄ± Veriler</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-[#C8697A] animate-pulse" />
                    </div>
                </div>
            </div>

            {/* â•â•â• WEB TASARIM â•â•â• */}
            {!showPanels && (
                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-400" />
                        <div>
                            <h2 className="text-sm font-semibold text-amber-200">Musteri sirketi bulunamadi</h2>
                            <p className="mt-1 text-xs text-zinc-500">
                                Bu analitik ekranini musteri kullanicisi olarak acman gerekiyor. Su anki oturumda sirket bilgisi olmadigi icin rapor panelleri yuklenmedi.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {showPanels && (
            <section>
                <div className="flex items-center gap-2 mb-4">
                    <LayoutTemplate className="w-4 h-4 text-[#F5BEC8]" />
                    <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">Web TasarÄ±m</h2>
                </div>
                {hasService('WEB_DESIGN') ? (
                    <WebDesignPanel />
                ) : (
                    <ServiceBlurOverlay service="WEB_DESIGN" />
                )}
            </section>
            )}


            {/* â•â•â• INSTAGRAM ANALÄ°TÄ°KLERÄ° â•â•â• */}
            {showPanels && (
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Instagram className="w-4 h-4 text-[#C8697A]" />
                            <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">Instagram Analizleri</h2>
                        </div>
                        <button onClick={() => navigate('/client/instagram')}
                            className="text-[11px] text-zinc-500 hover:text-zinc-300 flex items-center gap-1 transition-colors">
                            DetaylÄ± GÃ¶r <ChevronRight className="w-3 h-3" />
                        </button>
                    </div>
                    {hasService('SOCIAL_MEDIA') ? (
                        <>
                            <StatsColumn companyId={companyId ?? ''} />
                            <div className="mt-6 space-y-6">
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <Play className="w-4 h-4 text-pink-400" />
                                            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Reels</h3>
                                        </div>
                                        <button
                                            onClick={() => navigate('/client/instagram/reels')}
                                            className="text-[11px] text-zinc-500 hover:text-zinc-300 flex items-center gap-1 transition-colors"
                                        >
                                            TÃ¼mÃ¼nÃ¼ GÃ¶r <ChevronRight className="w-3 h-3" />
                                        </button>
                                    </div>
                                    <ReelsColumn companyId={companyId ?? ''} />
                                </div>
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <ImageIcon className="w-4 h-4 text-pink-400" />
                                            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">GÃ¶nderiler</h3>
                                        </div>
                                        <button
                                            onClick={() => navigate('/client/instagram/posts')}
                                            className="text-[11px] text-zinc-500 hover:text-zinc-300 flex items-center gap-1 transition-colors"
                                        >
                                            TÃ¼mÃ¼nÃ¼ GÃ¶r <ChevronRight className="w-3 h-3" />
                                        </button>
                                    </div>
                                    <PostsColumn companyId={companyId ?? ''} />
                                </div>
                            </div>
                        </>
                    ) : (
                        <ServiceBlurOverlay service="SOCIAL_MEDIA" />
                    )}
                </section>
            )}

            {/* â•â•â• Ä°Ã‡ERÄ°K PLANI â•â•â• */}
            {showPanels && (
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <BarChart3 className="w-4 h-4 text-violet-400" />
                            <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">Ä°Ã§erik PlanÄ±</h2>
                        </div>
                        <button
                            onClick={() => navigate('/client/content-plans')}
                            className="text-[11px] text-zinc-500 hover:text-zinc-300 flex items-center gap-1 transition-colors"
                        >
                            DetaylÄ± GÃ¶r <ChevronRight className="w-3 h-3" />
                        </button>
                    </div>
                    {hasService('CONTENT_MARKETING') ? (
                        <div className="relative">
                            <div className="max-h-[260px] overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full">
                                <ContentPlanPanel companyId={companyId ?? ''} readOnly limit={5} />
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-[#0A0A0C] to-transparent pointer-events-none rounded-b-2xl" />
                        </div>
                    ) : (
                        <ServiceBlurOverlay service="CONTENT_MARKETING" />
                    )}
                </section>
            )}

            {/* â•â•â• Ã‡EKÄ°M GÃœNLERÄ° â•â•â• */}
            <section>
                {hasService('PRODUCTION') ? (
                    <ShootingTimelineSection />
                ) : (
                    <>
                        <div className="flex items-center gap-2 mb-4">
                            <Camera className="w-4 h-4 text-[#F5BEC8]" />
                            <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">Ã‡ekim GÃ¼nleri</h2>
                        </div>
                        <ServiceBlurOverlay service="PRODUCTION" />
                    </>
                )}
            </section>

            {/* â•â•â• SEARCH CONSOLE â•â•â• */}
            {showPanels && (
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <Search className="w-4 h-4 text-pink-400" />
                        <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">Google Search Console</h2>
                    </div>
                    {hasService('DIGITAL_MARKETING') ? (
                        <SearchConsolePanel companyId={companyId ?? ''} />
                    ) : (
                        <ServiceBlurOverlay service="DIGITAL_MARKETING" />
                    )}
                </section>
            )}

            {/* â•â•â• GOOGLE ANALYTICS â•â•â• */}
            {showPanels && (
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <Globe className="w-4 h-4 text-[#F5BEC8]" />
                        <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">Google Analytics</h2>
                    </div>
                    {hasService('DIGITAL_MARKETING') ? (
                        <GoogleAnalyticsPanel companyId={companyId ?? ''} />
                    ) : (
                        <ServiceBlurOverlay service="DIGITAL_MARKETING" />
                    )}
                </section>
            )}

            {/* â•â•â• GOOGLE ADS â•â•â• */}
            {showPanels && (
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-blue-400" />
                            <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">Google Ads</h2>
                        </div>
                        <button onClick={() => navigate('/client/google-ads')}
                            className="text-[11px] text-zinc-500 hover:text-zinc-300 flex items-center gap-1 transition-colors">
                            DetaylÄ± Rapor <ChevronRight className="w-3 h-3" />
                        </button>
                    </div>
                    {hasService('AD_MANAGEMENT') ? (
                        <GoogleAdsPanel companyId={companyId ?? ''} />
                    ) : (
                        <ServiceBlurOverlay service="AD_MANAGEMENT" />
                    )}
                </section>
            )}

            {/* â•â•â• META ADS â•â•â• */}
            {showPanels && (
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-blue-500" />
                            <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">Meta Ads</h2>
                        </div>
                        <button onClick={() => navigate('/client/meta-ads')}
                            className="text-[11px] text-zinc-500 hover:text-zinc-300 flex items-center gap-1 transition-colors">
                            DetaylÄ± Rapor <ChevronRight className="w-3 h-3" />
                        </button>
                    </div>
                    {hasService('AD_MANAGEMENT') ? (
                        <MetaAdsPanel companyId={companyId ?? ''} />
                    ) : (
                        <ServiceBlurOverlay service="AD_MANAGEMENT" />
                    )}
                </section>
            )}

        </div>
    );
}


// ============================================================================
// Shooting Timeline Section
// ============================================================================

type DatedShoot = ShootResponse & { shootDate: string };

function isOverdue(shoot: ShootResponse): shoot is DatedShoot {
    if (shoot.status !== 'PLANNED' || !shoot.shootDate) return false;
    const shootDay = new Date(shoot.shootDate);
    shootDay.setHours(23, 59, 59, 999);
    return shootDay < new Date();
}

function isUpcoming(shoot: ShootResponse): shoot is DatedShoot {
    if (shoot.status !== 'PLANNED' || !shoot.shootDate) return false;
    const shootDay = new Date(shoot.shootDate);
    shootDay.setHours(23, 59, 59, 999);
    return shootDay >= new Date();
}

function ShootingTimelineSection() {
    const navigate = useNavigate();

    const { data, isLoading } = useQuery<PageResponse<ShootResponse>>({
        queryKey: shootKeys.list('client', 0, 50),
        queryFn: () => shootApi.listClient(0, 50),
    });

    const allShoots = data?.content ?? [];

    const upcoming  = allShoots.filter(isUpcoming).sort((a, b) => new Date(a.shootDate).getTime() - new Date(b.shootDate).getTime());
    const overdue   = allShoots.filter(isOverdue);
    const completed = allShoots.filter(s => s.status === 'COMPLETED');
    const cancelled = allShoots.filter(s => s.status === 'CANCELLED');

    const summaryBadges = [
        overdue.length   > 0 && { tab: 'OVERDUE',   count: overdue.length,   label: 'gecikmiÅŸ',   icon: AlertTriangle, cls: 'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/15' },
        completed.length > 0 && { tab: 'COMPLETED', count: completed.length, label: 'tamamlanan', icon: CheckCircle2,  cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/15' },
        cancelled.length > 0 && { tab: 'CANCELLED', count: cancelled.length, label: 'iptal',      icon: XCircle,      cls: 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/15' },
    ].filter(Boolean) as { tab: string; count: number; label: string; icon: typeof AlertTriangle; cls: string }[];

    if (isLoading) {
        return (
            <section>
                <div className="flex items-center gap-2 mb-4">
                    <Camera className="w-4 h-4 text-[#F5BEC8]" />
                    <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">Ã‡ekim GÃ¼nleri</h2>
                </div>
                <div className="bg-[#0C0C0E] border border-white/[0.06] rounded-2xl p-6 flex items-center justify-center py-12">
                    <Loader2 className="w-5 h-5 text-pink-400 animate-spin" />
                </div>
            </section>
        );
    }

    if (allShoots.length === 0) return null;

    return (
        <section>
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4 text-[#F5BEC8]" />
                    <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">Ã‡ekim GÃ¼nleri</h2>
                </div>
                <button
                    onClick={() => navigate('/client/shoots')}
                    className="text-[11px] text-zinc-500 hover:text-zinc-300 flex items-center gap-1 transition-colors"
                >
                    TÃ¼mÃ¼nÃ¼ gÃ¶r <ChevronRight className="w-3 h-3" />
                </button>
            </div>

            <div className="bg-[#0C0C0E] border border-white/[0.06] rounded-2xl p-6">
                {upcoming.length === 0 ? (
                    <div className="text-center py-6">
                        <Camera className="w-10 h-10 text-zinc-700 mx-auto mb-2" />
                        <p className="text-sm text-zinc-500">YaklaÅŸan Ã§ekim bulunmuyor</p>
                    </div>
                ) : (
                    <div className="divide-y divide-white/[0.04]">
                        {upcoming.map((shoot) => {
                            const date = new Date(shoot.shootDate);
                            const day = date.getDate();
                            const monthShort = date.toLocaleDateString('tr-TR', { month: 'short' }).replace('.', '');

                            return (
                                <div key={shoot.id} className="flex items-center gap-3 py-2.5 group">
                                    {/* Compact date badge */}
                                    <div className="shrink-0 flex items-center gap-1.5 min-w-[60px]">
                                        <span className="text-lg font-bold text-white leading-none">{day}</span>
                                        <span className="text-[10px] font-semibold text-[#C8697A] uppercase">{monthShort}</span>
                                    </div>

                                    {/* Title */}
                                    <p className="flex-1 text-[12px] font-medium text-white truncate">{shoot.title}</p>

                                    {/* Meta inline */}
                                    <div className="flex items-center gap-3 shrink-0">
                                        {shoot.shootTime && (
                                            <span className="flex items-center gap-1 text-[11px] text-zinc-500">
                                                <Clock className="w-3 h-3" />
                                                {shoot.shootTime.slice(0, 5)}
                                            </span>
                                        )}
                                        {shoot.location && (
                                            <span className="hidden sm:flex items-center gap-1 text-[11px] text-zinc-500">
                                                <MapPin className="w-3 h-3" />
                                                <span className="max-w-[100px] truncate">{shoot.location}</span>
                                            </span>
                                        )}
                                        <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20">
                                            PlanlandÄ±
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Summary badges for past/non-upcoming shoots */}
                {summaryBadges.length > 0 && (
                    <div className="mt-5 pt-4 border-t border-white/[0.04] flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] text-zinc-600 uppercase tracking-wider mr-1">GeÃ§miÅŸ:</span>
                        {summaryBadges.map(({ tab, count, label, icon: Icon, cls }) => (
                            <button
                                key={tab}
                                onClick={() => navigate(`/client/shoots?tab=${tab}`)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-semibold transition-colors ${cls}`}
                            >
                                <Icon className="w-3 h-3" />
                                {count} {label}
                                <ChevronRight className="w-3 h-3 opacity-60" />
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
