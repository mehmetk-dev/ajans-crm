import { AlertTriangle, Eye, Megaphone, MousePointerClick, Target, Wallet } from 'lucide-react';
import type { GoogleAdsOverviewResponse } from '../../google-ads';
import type { MetaAdsOverviewResponse } from '../../meta-ads';
import type { IntegrationSnapshotMeta } from '../../integration-snapshots';
import { EmptyState, MetricCard } from './DashboardCards';
import { fmt } from '../dashboard.utils';

interface AdsTabProps {
    ads: GoogleAdsOverviewResponse | undefined;
    metaAds: MetaAdsOverviewResponse | undefined;
    googleAdsConnected: boolean;
    metaAdsConnected: boolean;
    adsSnapshot?: IntegrationSnapshotMeta;
    metaAdsSnapshot?: IntegrationSnapshotMeta;
    navigate: (path: string) => void;
}

function SnapshotWarning({ provider, snapshot }: { provider: string; snapshot?: IntegrationSnapshotMeta }) {
    if (snapshot?.status !== 'FAILED') return null;
    return (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-amber-400/20 bg-amber-400/10 px-3 py-2 text-xs text-amber-100">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-300" />
            {provider} için son başarılı veri gösteriliyor.
        </div>
    );
}

export function AdsTab({
    ads,
    metaAds,
    googleAdsConnected,
    metaAdsConnected,
    adsSnapshot,
    metaAdsSnapshot,
    navigate,
}: AdsTabProps) {
    return (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <section className="rounded-2xl border border-white/[0.06] bg-[#0C0C0E] p-5">
                <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Megaphone className="h-4 w-4 text-blue-400" />
                        <h3 className="text-sm font-semibold text-white">Google Ads</h3>
                    </div>
                    <button onClick={() => navigate('/client/google-ads')} className="text-[11px] text-zinc-500 hover:text-zinc-300">Detay</button>
                </div>
                <SnapshotWarning provider="Google Ads" snapshot={adsSnapshot} />
                {googleAdsConnected && ads ? (
                    <div className="grid grid-cols-2 gap-3">
                        <MetricCard label="Harcama" value={`₺${fmt(ads.totalSpend)}`} icon={Wallet} color="blue" />
                        <MetricCard label="Gösterim" value={fmt(ads.impressions)} icon={Eye} color="violet" />
                        <MetricCard label="Tıklama" value={fmt(ads.clicks)} icon={MousePointerClick} color="cyan" />
                        <MetricCard label="Dönüşüm" value={fmt(ads.conversions)} icon={Target} color="emerald" />
                    </div>
                ) : (
                    <EmptyState icon={Megaphone} text="Google Ads bağlı değil" action={() => navigate('/client/google-ads')} actionLabel="Bağla" small />
                )}
            </section>

            <section className="rounded-2xl border border-white/[0.06] bg-[#0C0C0E] p-5">
                <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Megaphone className="h-4 w-4 text-indigo-400" />
                        <h3 className="text-sm font-semibold text-white">Meta Ads</h3>
                    </div>
                    <button onClick={() => navigate('/client/meta-ads')} className="text-[11px] text-zinc-500 hover:text-zinc-300">Detay</button>
                </div>
                <SnapshotWarning provider="Meta Ads" snapshot={metaAdsSnapshot} />
                {metaAdsConnected && metaAds ? (
                    <div className="grid grid-cols-2 gap-3">
                        <MetricCard label="Harcama" value={`₺${fmt(metaAds.totalSpend)}`} icon={Wallet} color="blue" />
                        <MetricCard label="Gösterim" value={fmt(metaAds.impressions)} icon={Eye} color="violet" />
                        <MetricCard label="Tıklama" value={fmt(metaAds.clicks)} icon={MousePointerClick} color="cyan" />
                        <MetricCard label="Erişim" value={fmt(metaAds.reach)} icon={Target} color="pink" />
                    </div>
                ) : (
                    <EmptyState icon={Megaphone} text="Meta Ads bağlı değil" action={() => navigate('/client/meta-ads')} actionLabel="Bağla" small />
                )}
            </section>
        </div>
    );
}
