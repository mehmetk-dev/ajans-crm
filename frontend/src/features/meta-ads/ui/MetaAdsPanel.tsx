import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
    AlertTriangle,
    ChevronRight,
    ExternalLink,
    Eye,
    Link2,
    Loader2,
    MousePointerClick,
    RefreshCw,
    TrendingUp,
    Unlink,
    Users,
} from 'lucide-react';
import { getApiErrorMessage } from '../../../lib/apiError';
import { integrationSnapshotApi } from '../../integration-snapshots/api/integrationSnapshotApi';
import { integrationSnapshotKeys } from '../../integration-snapshots/integrationSnapshotKeys';
import { metaAdsApi } from '../api/metaAdsApi';
import { metaAdsKeys } from '../metaAdsKeys';
import type { MetaAdsStatusResponse } from '../metaAds.types';
import {
    formatMetaAdsCurrency,
    formatMetaAdsMetric,
} from '../model/metaAds.utils';

interface Props {
    companyId: string;
    initialStatus?: MetaAdsStatusResponse;
}

function snapshotLabel(lastSyncedAt: string | null): string {
    if (!lastSyncedAt) return 'Veriler hazırlanıyor';
    return `Son güncelleme: ${new Date(lastSyncedAt).toLocaleString('tr-TR', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    })}`;
}

export default function MetaAdsPanel({ companyId, initialStatus }: Props) {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const statusQuery = useQuery({
        queryKey: metaAdsKeys.status(companyId),
        queryFn: () => metaAdsApi.getStatus(companyId),
        enabled: !initialStatus,
        staleTime: 5 * 60 * 1000,
    });
    const status = initialStatus ?? statusQuery.data;
    const snapshotQuery = useQuery({
        queryKey: integrationSnapshotKeys.overview(companyId),
        queryFn: () => integrationSnapshotApi.getOverview(companyId),
        enabled: Boolean(status?.connected),
        staleTime: 5 * 60 * 1000,
    });
    const data = snapshotQuery.data?.metaAds;
    const snapshotMeta = snapshotQuery.data?.metaAdsSnapshot;

    const refreshMutation = useMutation({
        mutationFn: () => integrationSnapshotApi.refreshMetaAds(companyId),
        onSuccess: () => queryClient.invalidateQueries({
            queryKey: integrationSnapshotKeys.overview(companyId),
        }),
    });
    const disconnectMutation = useMutation({
        mutationFn: async () => {
            await metaAdsApi.disconnect(companyId);
            await integrationSnapshotApi.refreshMetaAds(companyId);
        },
        onSuccess: async () => {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: metaAdsKeys.status(companyId) }),
                queryClient.invalidateQueries({
                    queryKey: integrationSnapshotKeys.overview(companyId),
                }),
            ]);
        },
    });

    const queryError = statusQuery.error ?? snapshotQuery.error;
    if (queryError) {
        return (
            <div className="flex items-center justify-between gap-4 rounded-2xl border border-red-500/20 bg-[#0C0C0E] p-6">
                <div className="flex items-start gap-3">
                    <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
                    <div>
                        <p className="text-sm font-semibold text-white">Meta Ads verileri yüklenemedi</p>
                        <p className="mt-1 text-xs text-zinc-500">
                            {getApiErrorMessage(queryError, 'Lütfen biraz sonra tekrar deneyin')}
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => {
                        statusQuery.refetch();
                        snapshotQuery.refetch();
                    }}
                    className="shrink-0 rounded-lg bg-red-500/10 px-3 py-2 text-xs font-medium text-red-300 hover:bg-red-500/20"
                >
                    Tekrar Dene
                </button>
            </div>
        );
    }

    if ((!initialStatus && statusQuery.isLoading) || (status?.connected && snapshotQuery.isLoading)) {
        return (
            <div className="flex items-center justify-center rounded-2xl border border-white/[0.06] bg-[#0C0C0E] p-8">
                <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
            </div>
        );
    }

    if (!status?.connected) {
        return (
            <div className="rounded-2xl border border-white/[0.06] bg-[#0C0C0E] p-8">
                <div className="flex flex-col items-center gap-5 text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-800">
                        <TrendingUp className="h-7 w-7 text-zinc-500" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-white">Meta Ads Bağlı Değil</h3>
                        <p className="mt-1 text-sm text-zinc-500">
                            Facebook ve Instagram reklam verilerini görmek için Meta hesabınızı bağlayın.
                        </p>
                    </div>
                    {status?.authUrl && (
                        <a
                            href={status.authUrl}
                            className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-500"
                        >
                            <Link2 className="h-4 w-4" />
                            Meta Ads'i Bağla
                        </a>
                    )}
                </div>
            </div>
        );
    }

    if (!status.adAccountId) {
        return (
            <div className="rounded-2xl border border-white/[0.06] bg-[#0C0C0E] p-6 text-center">
                <TrendingUp className="mx-auto mb-2 h-8 w-8 text-blue-400/50" />
                <p className="text-sm text-zinc-400">Meta reklam hesabı ID'si girilmemiş</p>
                <button
                    onClick={() => navigate('/client/meta-ads')}
                    className="mx-auto mt-3 flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
                >
                    Şimdi ayarla <ChevronRight className="h-3 w-3" />
                </button>
            </div>
        );
    }

    const hasStoredData = Boolean(data?.connected && data.adAccountId);
    if (snapshotMeta?.status === 'FAILED' && !hasStoredData) {
        return (
            <div className="flex items-center justify-between gap-4 rounded-2xl border border-amber-500/20 bg-[#0C0C0E] p-6">
                <div className="flex items-start gap-3">
                    <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
                    <div>
                        <p className="text-sm font-semibold text-amber-200">Meta Ads snapshot oluşturulamadı</p>
                        <p className="mt-1 text-xs text-zinc-500">Hesap ID'sini ve Meta reklam izinlerini kontrol edin.</p>
                    </div>
                </div>
                <button
                    onClick={() => refreshMutation.mutate()}
                    disabled={refreshMutation.isPending}
                    className="shrink-0 rounded-lg bg-amber-500/10 px-3 py-2 text-xs font-medium text-amber-200 disabled:opacity-50"
                >
                    Tekrar Dene
                </button>
            </div>
        );
    }

    if (!hasStoredData) {
        return (
            <div className="flex items-center gap-3 rounded-2xl border border-amber-500/20 bg-[#0C0C0E] p-6">
                <Loader2 className="h-5 w-5 animate-spin text-amber-400" />
                <div>
                    <p className="text-sm font-medium text-amber-200">Meta Ads snapshot verileri hazırlanıyor</p>
                    <p className="mt-1 text-xs text-zinc-500">İsterseniz yenileme düğmesiyle hemen oluşturabilirsiniz.</p>
                </div>
                <button
                    onClick={() => refreshMutation.mutate()}
                    disabled={refreshMutation.isPending}
                    className="ml-auto rounded-lg bg-amber-500/10 px-3 py-2 text-xs font-medium text-amber-200 disabled:opacity-50"
                >
                    Şimdi Yenile
                </button>
            </div>
        );
    }

    const hasPerformanceData = data!.totalSpend > 0
        || data!.impressions > 0
        || data!.clicks > 0
        || data!.reach > 0
        || data!.campaigns.length > 0
        || data!.dailyTrend.length > 0;
    const stats = [
        { label: 'Harcama', value: formatMetaAdsCurrency(data!.totalSpend), icon: TrendingUp, color: 'text-blue-500' },
        { label: 'Tıklama', value: formatMetaAdsMetric(data!.clicks), icon: MousePointerClick, color: 'text-violet-400' },
        { label: 'Erişim', value: formatMetaAdsMetric(data!.reach), icon: Users, color: 'text-pink-400' },
        { label: 'Gösterim', value: formatMetaAdsMetric(data!.impressions), icon: Eye, color: 'text-cyan-400' },
    ];

    return (
        <div className="space-y-4 rounded-2xl border border-white/[0.06] bg-[#0C0C0E] p-5">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                <div>
                    <p className="text-xs font-semibold text-white">Meta Ads · Son 30 Gün</p>
                    <p className="mt-1 text-[11px] text-zinc-500">
                        {snapshotMeta?.status === 'FAILED'
                            ? 'Son başarılı veri korunuyor'
                            : snapshotLabel(snapshotMeta?.lastSyncedAt ?? null)}
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <button
                        onClick={() => refreshMutation.mutate()}
                        disabled={refreshMutation.isPending}
                        title="Meta Ads snapshot'ını yenile"
                        className="rounded-lg border border-white/[0.06] p-2 text-zinc-500 hover:text-zinc-300 disabled:opacity-50"
                    >
                        <RefreshCw className={`h-3.5 w-3.5 ${refreshMutation.isPending ? 'animate-spin' : ''}`} />
                    </button>
                    <button
                        onClick={() => navigate('/client/meta-ads')}
                        className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-500"
                    >
                        Detaylı İncele <ExternalLink className="h-3.5 w-3.5" />
                    </button>
                </div>
            </div>

            {snapshotMeta?.status === 'FAILED' && (
                <div className="flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                    <div className="flex-1">
                        <p className="text-sm font-medium text-amber-200">Son başarılı veri gösteriliyor</p>
                        <p className="mt-0.5 text-xs text-amber-400/80">
                            Yeni veri alınamadı; mevcut snapshot korunuyor.
                        </p>
                    </div>
                    {status.authUrl && (
                        <a href={status.authUrl} className="text-xs font-medium text-blue-300 hover:text-blue-200">
                            Yeniden bağla
                        </a>
                    )}
                </div>
            )}

            {(refreshMutation.error || disconnectMutation.error) && (
                <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                    <p className="text-xs text-red-200">
                        {getApiErrorMessage(
                            refreshMutation.error ?? disconnectMutation.error,
                            'Meta Ads işlemi tamamlanamadı',
                        )}
                    </p>
                </div>
            )}

            {!hasPerformanceData ? (
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-5 py-8 text-center">
                    <p className="text-sm font-medium text-zinc-300">Bu dönemde reklam performansı yok</p>
                    <p className="mt-1 text-xs text-zinc-500">Aktif kampanya veya ölçümlenmiş reklam hareketi bulunamadı.</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {stats.map(item => {
                            const Icon = item.icon;
                            return (
                                <div key={item.label} className="rounded-xl bg-white/[0.02] p-3">
                                    <div className="mb-1 flex items-center gap-1.5">
                                        <Icon className={`h-3 w-3 ${item.color}`} />
                                        <span className="text-[10px] text-zinc-500">{item.label}</span>
                                    </div>
                                    <p className="text-base font-bold text-white">{item.value}</p>
                                </div>
                            );
                        })}
                    </div>
                    <div className="flex flex-wrap items-center gap-4 px-1 text-[11px] text-zinc-500">
                        <span>CPM: <strong className="text-zinc-300">{formatMetaAdsCurrency(data!.cpm)}</strong></span>
                        <span>CPC: <strong className="text-zinc-300">{formatMetaAdsCurrency(data!.cpc)}</strong></span>
                        <span>CTR: <strong className="text-zinc-300">{data!.ctr.toFixed(2)}%</strong></span>
                    </div>
                    {data!.campaigns.length > 0 && (
                        <div className="space-y-1.5">
                            <p className="px-1 text-[10px] uppercase tracking-widest text-zinc-600">Kampanyalar</p>
                            {data!.campaigns.slice(0, 4).map(campaign => (
                                <div key={campaign.campaignId} className="flex items-center gap-3 rounded-lg px-1 py-1.5 hover:bg-white/[0.02]">
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-xs font-medium text-white">{campaign.campaignName}</p>
                                        <p className="text-[10px] text-zinc-600">
                                            {formatMetaAdsMetric(campaign.impressions)} gösterim · {formatMetaAdsMetric(campaign.reach)} erişim
                                        </p>
                                    </div>
                                    <span className="shrink-0 text-xs font-semibold text-blue-400">
                                        {formatMetaAdsCurrency(campaign.spend)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

            <div className="flex justify-end border-t border-white/[0.04] pt-2">
                <button
                    onClick={() => {
                        if (confirm('Meta reklam hesabını kaldırmak istediğinizden emin misiniz?')) {
                            disconnectMutation.mutate();
                        }
                    }}
                    disabled={disconnectMutation.isPending}
                    className="flex items-center gap-1.5 px-2 py-1 text-xs text-zinc-500 hover:text-red-400 disabled:opacity-50"
                >
                    {disconnectMutation.isPending
                        ? <Loader2 className="h-3 w-3 animate-spin" />
                        : <Unlink className="h-3 w-3" />}
                    Reklam Hesabını Kaldır
                </button>
            </div>
        </div>
    );
}
