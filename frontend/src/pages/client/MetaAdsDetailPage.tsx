import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import {
    TrendingUp, MousePointerClick, Eye, Users, AlertTriangle,
    Loader2, Link, Check, RefreshCw, ChevronUp, ChevronDown, Unlink,
} from 'lucide-react';
import {
    formatMetaAdsCurrency,
    formatMetaAdsMetric,
    metaAdsApi,
    metaAdsKeys,
    sortMetaAdsCampaigns,
    type MetaAdsSortColumn,
} from '../../features/meta-ads';
import {
    integrationSnapshotApi,
    integrationSnapshotKeys,
} from '../../features/integration-snapshots';
import { MissingCompanyState } from '../../components/client/MissingCompanyState';
import { useAuth } from '../../store/AuthContext';
import { getApiErrorMessage } from '../../lib/apiError';

const currency = formatMetaAdsCurrency;
const fmt = formatMetaAdsMetric;

export default function MetaAdsDetailPage() {
    const { user, isLoading: authLoading } = useAuth();
    const qc = useQueryClient();
    const [adAccountInput, setAdAccountInput] = useState('');
    const [showSetup, setShowSetup] = useState(false);
    const [sortCol, setSortCol] = useState<MetaAdsSortColumn>('spend');
    const [sortAsc, setSortAsc] = useState(false);
    const [actionError, setActionError] = useState('');
    const returnPath = '/client/meta-ads';

    const { data: status, isLoading: statusLoading, error: statusError } = useQuery({
        queryKey: metaAdsKeys.status(user?.companyId ?? '', returnPath),
        queryFn: () => metaAdsApi.getStatus(user!.companyId!, returnPath),
        enabled: !!user?.companyId && !authLoading,
    });

    const { data: snapshotOverview, isLoading, error: snapshotError } = useQuery({
        queryKey: integrationSnapshotKeys.overview(user?.companyId ?? ''),
        queryFn: () => integrationSnapshotApi.getOverview(user!.companyId!),
        enabled: !!user?.companyId && !authLoading,
        staleTime: 5 * 60 * 1000,
    });
    const data = snapshotOverview?.metaAds;
    const snapshotMeta = snapshotOverview?.metaAdsSnapshot;

    const saveMut = useMutation({
        mutationFn: async (id: string) => {
            await metaAdsApi.saveAdAccount(user!.companyId!, id);
            await integrationSnapshotApi.refreshMetaAds(user!.companyId!);
        },
        onSuccess: async () => {
            await Promise.all([
                qc.invalidateQueries({ queryKey: metaAdsKeys.status(user!.companyId!, returnPath) }),
                qc.invalidateQueries({
                    queryKey: integrationSnapshotKeys.overview(user!.companyId!),
                }),
            ]);
            setShowSetup(false);
            setAdAccountInput('');
            setActionError('');
        },
        onError: (error: unknown) => setActionError(
            getApiErrorMessage(error, 'Meta reklam hesabı kaydedilemedi'),
        ),
    });

    const disconnectMut = useMutation({
        mutationFn: async () => {
            await metaAdsApi.disconnect(user!.companyId!);
            await integrationSnapshotApi.refreshMetaAds(user!.companyId!);
        },
        onSuccess: async () => {
            await Promise.all([
                qc.invalidateQueries({ queryKey: metaAdsKeys.status(user!.companyId!, returnPath) }),
                qc.invalidateQueries({
                    queryKey: integrationSnapshotKeys.overview(user!.companyId!),
                }),
            ]);
            setShowSetup(true);
            setActionError('');
        },
        onError: (error: unknown) => setActionError(
            getApiErrorMessage(error, 'Meta reklam hesabı kaldırılamadı'),
        ),
    });

    const refreshMut = useMutation({
        mutationFn: () => integrationSnapshotApi.refreshMetaAds(user!.companyId!),
        onSuccess: async () => {
            await qc.invalidateQueries({
                queryKey: integrationSnapshotKeys.overview(user!.companyId!),
            });
            setActionError('');
        },
        onError: (error: unknown) => setActionError(
            getApiErrorMessage(error, 'Meta Ads snapshot yenilenemedi'),
        ),
    });

    if (authLoading || statusLoading) {
        return (
            <div className="flex h-40 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
            </div>
        );
    }

    if (!user?.companyId) {
        return (
            <MissingCompanyState description="Meta Ads ekranı şirket bilgisi olan bir müşteri hesabıyla açılmalıdır." />
        );
    }

    const adAccountId = status?.adAccountId || data?.adAccountId || '';
    const effectiveConnected = Boolean(status?.connected);
    const hasStoredData = Boolean(data?.connected && data.adAccountId);
    const loadError = statusError ?? snapshotError;
    const visibleError = actionError
        || (snapshotMeta?.status === 'FAILED' && !hasStoredData
            ? 'Meta Ads snapshot oluşturulamadı. Hesap ID’sini ve reklam izinlerini kontrol edin.'
            : '')
        || (loadError ? getApiErrorMessage(loadError, 'Meta Ads verileri yüklenemedi') : '');
    const sortedCampaigns = sortMetaAdsCampaigns(
        data?.campaigns ?? [],
        sortCol,
        sortAsc,
    );
    const hasPerformanceData = Boolean(data && (
        data.totalSpend > 0
        || data.impressions > 0
        || data.clicks > 0
        || data.reach > 0
        || data.campaigns.length > 0
        || data.dailyTrend.length > 0
    ));

    const handleSort = (col: typeof sortCol) => {
        if (sortCol === col) setSortAsc(value => !value);
        else {
            setSortCol(col);
            setSortAsc(false);
        }
    };

    const SortIcon = ({ col }: { col: typeof sortCol }) =>
        sortCol === col
            ? (sortAsc ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)
            : null;

    return (
        <div className="space-y-6">
            <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0C0C0E] p-6">
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-blue-600/8 via-transparent to-pink-500/5" />
                <div className="relative flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-600/20 bg-gradient-to-br from-blue-600/20 to-pink-500/20">
                            <TrendingUp className="h-5 w-5 text-blue-400" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-white">Meta Ads</h1>
                            <p className="mt-0.5 text-xs text-zinc-500">
                                {data?.adAccountName || 'Facebook & Instagram Reklam Raporu'}
                                {adAccountId && <span className="ml-2 text-zinc-600">· {adAccountId}</span>}
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        {snapshotMeta && (
                            <div className={`rounded-full border px-3 py-1.5 text-[11px] font-medium ${
                                snapshotMeta.status === 'FAILED'
                                    ? 'border-amber-500/20 bg-amber-500/10 text-amber-300'
                                    : 'border-white/[0.06] bg-black/20 text-zinc-400'
                            }`}>
                                {snapshotMeta.status === 'FAILED'
                                    ? 'Son başarılı veri korunuyor'
                                    : snapshotMeta.lastSyncedAt
                                        ? `Son güncelleme: ${new Date(snapshotMeta.lastSyncedAt).toLocaleString('tr-TR', {
                                            day: '2-digit',
                                            month: '2-digit',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}`
                                        : 'Veriler hazırlanıyor'}
                            </div>
                        )}
                        <button
                            onClick={() => refreshMut.mutate()}
                            disabled={refreshMut.isPending || !effectiveConnected || !adAccountId}
                            title="Meta Ads snapshot'ını yenile"
                            className="rounded-xl border border-white/[0.06] p-2 text-zinc-500 transition-colors hover:text-zinc-300 disabled:opacity-40"
                        >
                            <RefreshCw className={`h-3.5 w-3.5 ${refreshMut.isPending ? 'animate-spin' : ''}`} />
                        </button>
                        {effectiveConnected && (
                            <button
                                onClick={() => setShowSetup(value => !value)}
                                className="flex items-center gap-2 rounded-xl border border-white/[0.06] px-3 py-2 text-xs text-zinc-400 transition-colors hover:text-white"
                            >
                                <Link className="h-3.5 w-3.5" />
                                {adAccountId ? 'Hesap Güncelle' : 'Hesap Bağla'}
                            </button>
                        )}
                        {!effectiveConnected && status?.authUrl && (
                            <a
                                href={status.authUrl}
                                className="flex items-center gap-2 rounded-xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-blue-700"
                            >
                                Meta ile Bağla
                            </a>
                        )}
                        {effectiveConnected && snapshotMeta?.status === 'FAILED' && status?.authUrl && (
                            <a
                                href={status.authUrl}
                                className="flex items-center gap-2 rounded-xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-blue-700"
                            >
                                Yeniden Bağla
                            </a>
                        )}
                        {effectiveConnected && adAccountId && (
                            <button
                                onClick={() => {
                                    if (confirm('Meta reklam hesabını kaldırmak istediğinizden emin misiniz?')) {
                                        disconnectMut.mutate();
                                    }
                                }}
                                disabled={disconnectMut.isPending}
                                title="Reklam Hesabını Kaldır"
                                className="flex items-center gap-2 rounded-xl border border-red-500/20 px-3 py-2 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/10 disabled:opacity-50"
                            >
                                {disconnectMut.isPending
                                    ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    : <Unlink className="h-3.5 w-3.5" />}
                                Reklam Hesabını Kaldır
                            </button>
                        )}
                    </div>
                </div>

                {effectiveConnected && (showSetup || !adAccountId) && (
                    <div className="relative mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                        <input
                            value={adAccountInput}
                            onChange={event => setAdAccountInput(event.target.value)}
                            placeholder="Meta Reklam Hesabı ID (örn: 123456789 veya act_123456789)"
                            className="flex-1 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-xs text-white placeholder-zinc-600 focus:border-blue-500/50 focus:outline-none"
                        />
                        <button
                            onClick={() => saveMut.mutate(adAccountInput)}
                            disabled={!adAccountInput.trim() || saveMut.isPending}
                            className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-40"
                        >
                            {saveMut.isPending
                                ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                : <Check className="h-3.5 w-3.5" />}
                            Kaydet
                        </button>
                    </div>
                )}
            </div>

            {!effectiveConnected && !visibleError && (
                <div className="flex items-start gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
                    <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
                    <div>
                        <p className="text-sm font-semibold text-white">Meta Ads bağlı değil</p>
                        <p className="mt-1 text-xs text-zinc-500">Meta hesabınızı bağlayın.</p>
                    </div>
                </div>
            )}

            {effectiveConnected && !adAccountId && (
                <div className="flex items-start gap-3 rounded-2xl border border-blue-500/20 bg-blue-500/5 p-5">
                    <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-blue-400" />
                    <div>
                        <p className="text-sm font-semibold text-white">Meta hesabı bağlı, reklam hesabı ID'si eksik</p>
                        <p className="mt-1 text-xs text-zinc-500">Raporu açmak için reklam hesabı ID'sini girin.</p>
                    </div>
                </div>
            )}

            {visibleError && (
                <div className="flex items-start gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
                    <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
                    <div>
                        <p className="text-sm font-semibold text-white">{visibleError}</p>
                        <p className="mt-1 text-xs text-zinc-500">Meta reklam hesabı ID'sini ve reklam izinlerini kontrol edin.</p>
                    </div>
                </div>
            )}

            {hasStoredData && snapshotMeta?.status === 'FAILED' && (
                <div className="flex items-start gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
                    <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
                    <div>
                        <p className="text-sm font-semibold text-amber-200">Son başarılı reklam verisi gösteriliyor</p>
                        <p className="mt-1 text-xs text-zinc-500">
                            Yeni veri alınamadı; kayıtlı snapshot korunuyor. Gerekirse Meta hesabını yeniden bağlayın.
                        </p>
                    </div>
                </div>
            )}

            {isLoading && (
                <div className="flex h-40 items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                </div>
            )}

            {effectiveConnected && adAccountId && !hasStoredData && !visibleError && !isLoading && (
                <div className="rounded-2xl border border-amber-500/20 bg-[#0C0C0E] px-6 py-10 text-center">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin text-amber-400" />
                    <p className="mt-3 text-sm font-medium text-amber-200">Meta Ads snapshot verileri hazırlanıyor</p>
                    <p className="mt-1 text-xs text-zinc-500">Yenile düğmesiyle ilk snapshot'ı hemen oluşturabilirsiniz.</p>
                </div>
            )}

            {effectiveConnected && adAccountId && hasStoredData && !visibleError && !isLoading && !hasPerformanceData && (
                <div className="rounded-2xl border border-white/[0.06] bg-[#0C0C0E] px-6 py-12 text-center">
                    <TrendingUp className="mx-auto h-8 w-8 text-zinc-600" />
                    <h2 className="mt-4 text-base font-semibold text-white">Bu dönemde reklam performansı yok</h2>
                    <p className="mt-1 text-sm text-zinc-500">Aktif kampanya veya ölçümlenmiş reklam hareketi bulunamadı.</p>
                </div>
            )}

            {effectiveConnected && adAccountId && hasStoredData && !visibleError && !isLoading && hasPerformanceData && data && (
                <>
                    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                        {[
                            { label: 'Toplam Harcama', value: currency(data.totalSpend), icon: TrendingUp, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
                            { label: 'Tıklama', value: fmt(data.clicks), icon: MousePointerClick, color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20' },
                            { label: 'Erişim', value: fmt(data.reach), icon: Users, color: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/20' },
                            { label: 'Gösterim', value: fmt(data.impressions), icon: Eye, color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
                        ].map(item => {
                            const Icon = item.icon;
                            return (
                                <div key={item.label} className={`${item.bg} ${item.border} rounded-2xl border p-4`}>
                                    <div className="mb-2 flex items-center gap-2">
                                        <Icon className={`h-4 w-4 ${item.color}`} />
                                        <span className="text-[11px] text-zinc-400">{item.label}</span>
                                    </div>
                                    <p className="text-xl font-bold text-white">{item.value}</p>
                                </div>
                            );
                        })}
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                        {[
                            { label: 'CPM (1000 Gösterim Başı)', value: currency(data.cpm) },
                            { label: 'CPC (Tıklama Başı)', value: currency(data.cpc) },
                            { label: 'CTR (Tıklama Oranı)', value: `${data.ctr.toFixed(2)}%` },
                        ].map(item => (
                            <div key={item.label} className="rounded-2xl border border-white/[0.06] bg-[#0C0C0E] p-4">
                                <p className="mb-1 text-[10px] text-zinc-500">{item.label}</p>
                                <p className="text-lg font-bold text-white">{item.value}</p>
                            </div>
                        ))}
                    </div>

                    {data.dailyTrend.length > 0 && (
                        <div className="rounded-2xl border border-white/[0.06] bg-[#0C0C0E] p-5">
                            <h3 className="mb-4 text-[11px] uppercase tracking-widest text-zinc-500">Günlük Harcama Trendi</h3>
                            <ResponsiveContainer width="100%" height={200}>
                                <AreaChart data={data.dailyTrend}>
                                    <defs>
                                        <linearGradient id="metaGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                                    <XAxis
                                        dataKey="date"
                                        tick={{ fontSize: 10, fill: '#52525b' }}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={value => value.slice(5)}
                                    />
                                    <YAxis
                                        tick={{ fontSize: 10, fill: '#52525b' }}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={value => `₺${value}`}
                                    />
                                    <Tooltip
                                        contentStyle={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12 }}
                                        labelStyle={{ color: '#a1a1aa', fontSize: 11 }}
                                        itemStyle={{ color: '#2563eb', fontSize: 12 }}
                                        formatter={value => [currency(Number(value ?? 0)), 'Harcama']}
                                    />
                                    <Area type="monotone" dataKey="spend" stroke="#2563eb" strokeWidth={2} fill="url(#metaGrad)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    )}

                    {sortedCampaigns.length > 0 && (
                        <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0C0C0E]">
                            <div className="border-b border-white/[0.06] px-5 py-4">
                                <h3 className="text-[11px] uppercase tracking-widest text-zinc-500">Kampanyalar</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-white/[0.04]">
                                            <th className="px-5 py-3 text-left text-[10px] font-medium uppercase tracking-wider text-zinc-600">Kampanya</th>
                                            {(['spend', 'impressions', 'clicks', 'reach'] as const).map(col => (
                                                <th
                                                    key={col}
                                                    onClick={() => handleSort(col)}
                                                    className="cursor-pointer select-none px-4 py-3 text-right text-[10px] font-medium uppercase tracking-wider text-zinc-600 hover:text-zinc-400"
                                                >
                                                    <span className="flex items-center justify-end gap-1">
                                                        {col === 'spend' ? 'Harcama' : col === 'impressions' ? 'Gösterim' : col === 'clicks' ? 'Tıklama' : 'Erişim'}
                                                        <SortIcon col={col} />
                                                    </span>
                                                </th>
                                            ))}
                                            <th className="px-5 py-3 text-right text-[10px] font-medium uppercase tracking-wider text-zinc-600">CTR</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sortedCampaigns.map(campaign => (
                                            <tr key={campaign.campaignId} className="border-b border-white/[0.03] transition-colors hover:bg-white/[0.01]">
                                                <td className="px-5 py-3">
                                                    <p className="text-xs font-medium text-white">{campaign.campaignName}</p>
                                                    {campaign.objective && <p className="text-[10px] text-zinc-600">{campaign.objective}</p>}
                                                </td>
                                                <td className="px-4 py-3 text-right text-xs font-semibold text-blue-400">{currency(campaign.spend)}</td>
                                                <td className="px-4 py-3 text-right text-xs text-zinc-300">{fmt(campaign.impressions)}</td>
                                                <td className="px-4 py-3 text-right text-xs text-zinc-300">{fmt(campaign.clicks)}</td>
                                                <td className="px-4 py-3 text-right text-xs text-zinc-300">{fmt(campaign.reach)}</td>
                                                <td className="px-5 py-3 text-right text-xs text-zinc-400">{campaign.ctr.toFixed(2)}%</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
