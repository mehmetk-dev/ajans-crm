import { lazy, useState, type ReactElement } from 'react';
import { useQueries, useQueryClient } from '@tanstack/react-query';
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
    type LucideIcon,
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
import { googleAnalyticsApi } from '../../google-analytics/api/googleAnalyticsApi';
import { analyticsKeys } from '../../google-analytics/googleAnalyticsKeys';
import { searchConsoleApi } from '../../search-console/api/searchConsoleApi';
import { searchConsoleKeys } from '../../search-console/searchConsoleKeys';
import { googleAdsApi } from '../../google-ads/api/googleAdsApi';
import { googleAdsKeys } from '../../google-ads/googleAdsKeys';
import { metaAdsApi } from '../../meta-ads/api/metaAdsApi';
import { metaAdsKeys } from '../../meta-ads/metaAdsKeys';
import { igApi } from '../../instagram/api/instagramApi';
import { instagramKeys } from '../../instagram/instagramKeys';

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

interface AnalyticsPanelConfig {
    key: string;
    title: string;
    icon: LucideIcon;
    iconClassName: string;
    service: ServiceCategory;
    minHeight: number;
    render: () => ReactElement;
    actionLabel?: string;
    actionTo?: string;
    eager?: boolean;
    connected?: boolean;
}

function orderPanelsByServiceState(
    panels: AnalyticsPanelConfig[],
    servicesLoading: boolean,
    hasService: (service: ServiceCategory) => boolean,
) {
    if (servicesLoading) {
        return panels;
    }

    return panels
        .map((panel, index) => ({
            panel,
            index,
            active: hasService(panel.service),
            disconnected: panel.connected === false,
        }))
        .sort((left, right) => {
            if (left.active !== right.active) {
                return left.active ? -1 : 1;
            }
            if (left.active && left.disconnected !== right.disconnected) {
                return left.disconnected ? 1 : -1;
            }
            return left.index - right.index;
        })
        .map(item => item.panel);
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
    const companyIdForQuery = companyId ?? '';
    const canFetchConnectionStatus = Boolean(companyId) && !servicesLoading;
    const [
        gaStatus,
        scStatus,
        googleAdsStatus,
        metaAdsStatus,
        instagramStatus,
    ] = useQueries({
        queries: [
            {
                queryKey: analyticsKeys.status(companyIdForQuery),
                queryFn: () => googleAnalyticsApi.getStatus(companyIdForQuery),
                enabled:
                    canFetchConnectionStatus &&
                    hasService('DIGITAL_MARKETING'),
                staleTime: 5 * 60_000,
            },
            {
                queryKey: searchConsoleKeys.status(companyIdForQuery),
                queryFn: () => searchConsoleApi.getStatus(companyIdForQuery),
                enabled:
                    canFetchConnectionStatus &&
                    hasService('DIGITAL_MARKETING'),
                staleTime: 5 * 60_000,
            },
            {
                queryKey: googleAdsKeys.status(companyIdForQuery),
                queryFn: () => googleAdsApi.getStatus(companyIdForQuery),
                enabled:
                    canFetchConnectionStatus &&
                    hasService('AD_MANAGEMENT'),
                staleTime: 5 * 60_000,
            },
            {
                queryKey: metaAdsKeys.status(companyIdForQuery),
                queryFn: () => metaAdsApi.getStatus(companyIdForQuery),
                enabled:
                    canFetchConnectionStatus &&
                    hasService('AD_MANAGEMENT'),
                staleTime: 5 * 60_000,
            },
            {
                queryKey: instagramKeys.status(companyIdForQuery, '/client/instagram'),
                queryFn: () => igApi.getStatus(companyIdForQuery, '/client/instagram'),
                enabled:
                    canFetchConnectionStatus &&
                    hasService('SOCIAL_MEDIA'),
                staleTime: 5 * 60_000,
            },
        ],
    });
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

    const analyticsPanels: AnalyticsPanelConfig[] = [
        {
            key: 'web-design',
            title: 'Web Tasarım',
            icon: LayoutTemplate,
            iconClassName: 'text-[#F5BEC8]',
            service: 'WEB_DESIGN',
            minHeight: 280,
            eager: true,
            render: () => <WebDesignPanel key={`web-${localRefreshVersion}`} />,
        },
        {
            key: 'instagram',
            title: 'Instagram Analizleri',
            icon: Instagram,
            iconClassName: 'text-[#C8697A]',
            service: 'SOCIAL_MEDIA',
            minHeight: 420,
            actionLabel: 'Detaylı Gör',
            actionTo: '/client/instagram',
            connected: instagramStatus.data?.connected,
            render: () => <InstagramAnalyticsPanel companyId={companyId} />,
        },
        {
            key: 'content-plan',
            title: 'İçerik Planı',
            icon: BarChart3,
            iconClassName: 'text-violet-400',
            service: 'CONTENT_MARKETING',
            minHeight: 260,
            actionLabel: 'Detaylı Gör',
            actionTo: '/client/content-plans',
            render: () => (
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
            ),
        },
        {
            key: 'shoots',
            title: 'Çekim Günleri',
            icon: Camera,
            iconClassName: 'text-[#F5BEC8]',
            service: 'PRODUCTION',
            minHeight: 190,
            actionLabel: 'Tümünü Gör',
            actionTo: '/client/shoots',
            render: () => <ShootingTimelinePanel />,
        },
        {
            key: 'search-console',
            title: 'Google Search Console',
            icon: Search,
            iconClassName: 'text-pink-400',
            service: 'DIGITAL_MARKETING',
            minHeight: 360,
            connected: scStatus.data?.connected,
            render: () => (
                <SearchConsolePanel
                    key={`search-console-${localRefreshVersion}`}
                    companyId={companyId}
                />
            ),
        },
        {
            key: 'google-analytics',
            title: 'Google Analytics',
            icon: Globe,
            iconClassName: 'text-[#F5BEC8]',
            service: 'DIGITAL_MARKETING',
            minHeight: 360,
            connected: gaStatus.data?.connected,
            render: () => (
                <GoogleAnalyticsPanel
                    key={`google-analytics-${localRefreshVersion}`}
                    companyId={companyId}
                />
            ),
        },
        {
            key: 'google-ads',
            title: 'Google Ads',
            icon: TrendingUp,
            iconClassName: 'text-blue-400',
            service: 'AD_MANAGEMENT',
            minHeight: 220,
            actionLabel: 'Detaylı Rapor',
            actionTo: '/client/google-ads',
            connected: googleAdsStatus.data?.connected,
            render: () => <GoogleAdsPanel companyId={companyId} />,
        },
        {
            key: 'meta-ads',
            title: 'Meta Ads',
            icon: TrendingUp,
            iconClassName: 'text-blue-500',
            service: 'AD_MANAGEMENT',
            minHeight: 220,
            actionLabel: 'Detaylı Rapor',
            actionTo: '/client/meta-ads',
            connected: metaAdsStatus.data?.connected,
            render: () => <MetaAdsPanel companyId={companyId} />,
        },
    ];

    const orderedPanels = orderPanelsByServiceState(
        analyticsPanels,
        servicesLoading,
        hasService,
    );

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

            {orderedPanels.map(panel => (
                <AnalyticsSection
                    key={panel.key}
                    title={panel.title}
                    icon={panel.icon}
                    iconClassName={panel.iconClassName}
                    actionLabel={panel.actionLabel}
                    actionTo={panel.actionTo}
                >
                    <ServicePanel
                        service={panel.service}
                        active={hasService(panel.service)}
                        servicesLoading={servicesLoading}
                        minHeight={panel.minHeight}
                        eager={panel.eager}
                    >
                        {panel.render()}
                    </ServicePanel>
                </AnalyticsSection>
            ))}
        </div>
    );
}
