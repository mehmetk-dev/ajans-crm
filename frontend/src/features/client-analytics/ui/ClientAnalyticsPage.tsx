import { lazy, useState, type ReactElement } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
    Activity,
    AlertTriangle,
    BarChart3,
    Camera,
    Globe,
    Instagram,
    LayoutTemplate,
    RefreshCw,
    Search,
    TrendingUp,
} from 'lucide-react';
import { useAuth } from '../../../store/AuthContext';
import { useActiveServices } from '../../../hooks/useActiveServices';
import { ServiceBlurOverlay } from '../../../components/ServiceUpsellOverlay';
import type { ServiceCategory } from '../../serviceCatalog';
import { AnalyticsSection } from './AnalyticsSection';
import {
    DeferredPanel,
    PanelPlaceholder,
} from './DeferredPanel';
import { clientAnalyticsRefreshKeys } from '../model/analyticsRefreshKeys';
const WebDesignPanel = lazy(
    () => import('../../web-design/ui/WebDesignPanel'),
);
const InstagramAnalyticsPanel = lazy(
    () => import('./InstagramAnalyticsPanel'),
);
const ContentPlanPanel = lazy(() =>
    import('../../content-plans/ui/ContentPlanPanel').then(module => ({
        default: module.ContentPlanPanel,
    })),
);
const ShootingTimelinePanel = lazy(
    () => import('./ShootingTimelinePanel'),
);
const SearchConsolePanel = lazy(
    () => import('../../search-console/ui/SearchConsolePanel'),
);
const GoogleAnalyticsPanel = lazy(
    () => import('../../google-analytics/ui/GoogleAnalyticsPanel'),
);
const GoogleAdsPanel = lazy(
    () => import('../../google-ads/ui/GoogleAdsPanel'),
);
const MetaAdsPanel = lazy(
    () => import('../../meta-ads/ui/MetaAdsPanel'),
);
interface ServicePanelProps {
    service: ServiceCategory;
    active: boolean;
    servicesLoading: boolean;
    children: ReactElement;
    minHeight?: number;
    eager?: boolean;
}
function ServicePanel({
    service,
    active,
    servicesLoading,
    children,
    minHeight,
    eager,
}: ServicePanelProps) {
    if (servicesLoading) {
        return <PanelPlaceholder minHeight={minHeight} />;
    }
    if (!active) {
        return <ServiceBlurOverlay service={service} />;
    }
    return (
        <DeferredPanel minHeight={minHeight} eager={eager}>
            {children}
        </DeferredPanel>
    );
}
export default function ClientAnalyticsPage() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const {
        hasService,
        isLoading: servicesLoading,
    } = useActiveServices();
    const [refreshing, setRefreshing] = useState(false);
    const [localRefreshVersion, setLocalRefreshVersion] = useState(0);
    const companyId = user?.companyId ?? null;
    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            await Promise.all(
                clientAnalyticsRefreshKeys(companyId ?? '').map(queryKey =>
                    queryClient.invalidateQueries({
                        queryKey,
                        refetchType: 'active',
                    }),
                ),
            );
            setLocalRefreshVersion(version => version + 1);
        } finally {
            setRefreshing(false);
        }
    };
    if (!companyId) {
        return (
            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
                <div className="flex items-start gap-3">
                    <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-400" />
                    <div>
                        <h1 className="text-sm font-semibold text-amber-200">
                            Müşteri şirketi bulunamadı
                        </h1>
                        <p className="mt-1 text-xs text-zinc-500">
                            Analitik ekranı şirket bilgisi olan bir müşteri hesabıyla
                            açılmalıdır.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-white">
                        Raporlar & Analitik
                    </h1>
                    <p className="mt-1 text-[13px] text-zinc-500">
                        Şirketinizin dijital performans metrikleri
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-[#0C0C0E] px-3 py-2 transition-all hover:border-[#C8697A]/30 disabled:opacity-50"
                    >
                        <RefreshCw
                            className={`h-4 w-4 text-[#C8697A] ${
                                refreshing ? 'animate-spin' : ''
                            }`}
                        />
                        <span className="text-xs text-zinc-400">
                            {refreshing ? 'Yenileniyor...' : 'Verileri Yenile'}
                        </span>
                    </button>
                    <div className="flex items-center gap-2 self-start rounded-xl border border-white/[0.06] bg-[#0C0C0E] px-3 py-2">
                        <Activity className="h-4 w-4 text-[#C8697A]" />
                        <span className="text-xs text-zinc-400">Canlı Veriler</span>
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#C8697A]" />
                    </div>
                </div>
            </header>

            <AnalyticsSection
                title="Web Tasarım"
                icon={LayoutTemplate}
                iconClassName="text-[#F5BEC8]"
            >
                <ServicePanel
                    service="WEB_DESIGN"
                    active={hasService('WEB_DESIGN')}
                    servicesLoading={servicesLoading}
                    minHeight={280}
                    eager
                >
                    <WebDesignPanel key={`web-${localRefreshVersion}`} />
                </ServicePanel>
            </AnalyticsSection>

            <AnalyticsSection
                title="Instagram Analizleri"
                icon={Instagram}
                iconClassName="text-[#C8697A]"
                actionLabel="Detaylı Gör"
                actionTo="/client/instagram"
            >
                <ServicePanel
                    service="SOCIAL_MEDIA"
                    active={hasService('SOCIAL_MEDIA')}
                    servicesLoading={servicesLoading}
                    minHeight={420}
                >
                    <InstagramAnalyticsPanel companyId={companyId} />
                </ServicePanel>
            </AnalyticsSection>

            <AnalyticsSection
                title="İçerik Planı"
                icon={BarChart3}
                iconClassName="text-violet-400"
                actionLabel="Detaylı Gör"
                actionTo="/client/content-plans"
            >
                <ServicePanel
                    service="CONTENT_MARKETING"
                    active={hasService('CONTENT_MARKETING')}
                    servicesLoading={servicesLoading}
                    minHeight={260}
                >
                    <div className="relative">
                        <div className="max-h-[260px] overflow-y-auto [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-1">
                            <ContentPlanPanel
                                companyId={companyId}
                                readOnly
                                limit={5}
                            />
                        </div>
                        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 rounded-b-2xl bg-gradient-to-t from-[#0A0A0C] to-transparent" />
                    </div>
                </ServicePanel>
            </AnalyticsSection>

            <AnalyticsSection
                title="Çekim Günleri"
                icon={Camera}
                iconClassName="text-[#F5BEC8]"
                actionLabel="Tümünü Gör"
                actionTo="/client/shoots"
            >
                <ServicePanel
                    service="PRODUCTION"
                    active={hasService('PRODUCTION')}
                    servicesLoading={servicesLoading}
                    minHeight={190}
                >
                    <ShootingTimelinePanel />
                </ServicePanel>
            </AnalyticsSection>

            <AnalyticsSection
                title="Google Search Console"
                icon={Search}
                iconClassName="text-pink-400"
            >
                <ServicePanel
                    service="DIGITAL_MARKETING"
                    active={hasService('DIGITAL_MARKETING')}
                    servicesLoading={servicesLoading}
                    minHeight={360}
                >
                    <SearchConsolePanel
                        key={`search-console-${localRefreshVersion}`}
                        companyId={companyId}
                    />
                </ServicePanel>
            </AnalyticsSection>

            <AnalyticsSection
                title="Google Analytics"
                icon={Globe}
                iconClassName="text-[#F5BEC8]"
            >
                <ServicePanel
                    service="DIGITAL_MARKETING"
                    active={hasService('DIGITAL_MARKETING')}
                    servicesLoading={servicesLoading}
                    minHeight={360}
                >
                    <GoogleAnalyticsPanel
                        key={`google-analytics-${localRefreshVersion}`}
                        companyId={companyId}
                    />
                </ServicePanel>
            </AnalyticsSection>

            <AnalyticsSection
                title="Google Ads"
                icon={TrendingUp}
                iconClassName="text-blue-400"
                actionLabel="Detaylı Rapor"
                actionTo="/client/google-ads"
            >
                <ServicePanel
                    service="AD_MANAGEMENT"
                    active={hasService('AD_MANAGEMENT')}
                    servicesLoading={servicesLoading}
                    minHeight={220}
                >
                    <GoogleAdsPanel companyId={companyId} />
                </ServicePanel>
            </AnalyticsSection>

            <AnalyticsSection
                title="Meta Ads"
                icon={TrendingUp}
                iconClassName="text-blue-500"
                actionLabel="Detaylı Rapor"
                actionTo="/client/meta-ads"
            >
                <ServicePanel
                    service="AD_MANAGEMENT"
                    active={hasService('AD_MANAGEMENT')}
                    servicesLoading={servicesLoading}
                    minHeight={220}
                >
                    <MetaAdsPanel companyId={companyId} />
                </ServicePanel>
            </AnalyticsSection>
        </div>
    );
}
