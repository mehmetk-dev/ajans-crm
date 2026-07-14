import { useEffect, useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation, useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import {
    TrendingUp, MousePointerClick, Eye, Target, AlertTriangle,
    Loader2, Link, Check, RefreshCw, ChevronUp, ChevronDown, Unlink
} from 'lucide-react';
import {
    campaignStatusTone,
    formatCurrency,
    formatMetric,
    getGoogleAdsOAuthCallbackError,
    googleAdsApi,
    googleAdsKeys,
    sortCampaigns,
    type GoogleAdsSortColumn,
} from '../../features/google-ads';
import { MissingCompanyState } from '../../components/client/MissingCompanyState';
import { useAuth } from '../../store/AuthContext';
import { getApiErrorMessage } from '../../lib/apiError';
import {
    integrationSnapshotApi,
    integrationSnapshotKeys,
} from '../../features/integration-snapshots';

export default function GoogleAdsDetailPage() {
    const { user, isLoading: authLoading } = useAuth();
    const qc = useQueryClient();
    const location = useLocation();
    const navigate = useNavigate();
    const [customerIdInput, setCustomerIdInput] = useState('');
    const [showSetup, setShowSetup] = useState(false);
    const [sortCol, setSortCol] = useState<GoogleAdsSortColumn>('spend');
    const [sortAsc, setSortAsc] = useState(false);
    const [actionError, setActionError] = useState('');
    const callbackError = useMemo(
        () => getGoogleAdsOAuthCallbackError(location.search),
        [location.search],
    );

    const { data: status, isLoading: statusLoading, error: statusError } = useQuery({
        queryKey: googleAdsKeys.status(user?.companyId ?? ''),
        queryFn: () => googleAdsApi.getStatus(user!.companyId!),
        enabled: !!user?.companyId && !authLoading,
    });

    const { data: snapshotOverview, isLoading, error: snapshotError } = useQuery({
        queryKey: integrationSnapshotKeys.overview(user?.companyId ?? ''),
        queryFn: () => integrationSnapshotApi.getOverview(user!.companyId!),
        enabled: !!user?.companyId && !authLoading,
        staleTime: 5 * 60 * 1000,
    });
    const data = snapshotOverview?.ads;
    const snapshotMeta = snapshotOverview?.adsSnapshot;

    const saveMut = useMutation({
        mutationFn: async (id: string) => {
            await googleAdsApi.saveCustomerId(user!.companyId!, id);
            await integrationSnapshotApi.refreshGoogleAds(user!.companyId!);
        },
        onSuccess: async () => {
            await Promise.all([
                qc.invalidateQueries({ queryKey: googleAdsKeys.status(user!.companyId!) }),
                qc.invalidateQueries({
                    queryKey: integrationSnapshotKeys.overview(user!.companyId!),
                }),
            ]);
            setShowSetup(false);
            setActionError('');
        },
        onError: (error: unknown) => setActionError(
            getApiErrorMessage(error, 'Müşteri ID kaydedilemedi'),
        ),
    });

    useEffect(() => {
        if (new URLSearchParams(location.search).get('connected') !== 'true') return;
        navigate(location.pathname, { replace: true });
    }, [location.pathname, location.search, navigate]);

    const disconnectMut = useMutation({
        mutationFn: async () => {
            await googleAdsApi.disconnect(user!.companyId!);
            await integrationSnapshotApi.refreshGoogleAds(user!.companyId!);
        },
        onSuccess: async () => {
            await Promise.all([
                qc.invalidateQueries({ queryKey: googleAdsKeys.status(user!.companyId!) }),
                qc.invalidateQueries({
                    queryKey: integrationSnapshotKeys.overview(user!.companyId!),
                }),
            ]);
        },
        onError: (error: unknown) => setActionError(
            getApiErrorMessage(error, 'Google Ads bağlantısı kesilemedi'),
        ),
    });

    const refreshMut = useMutation({
        mutationFn: () => integrationSnapshotApi.refreshGoogleAds(user!.companyId!),
        onSuccess: async () => {
            await qc.invalidateQueries({
                queryKey: integrationSnapshotKeys.overview(user!.companyId!),
            });
            setActionError('');
        },
        onError: (error: unknown) => setActionError(
            getApiErrorMessage(error, 'Google Ads snapshot yenilenemedi'),
        ),
    });

    if (authLoading || statusLoading) {
        return (
            <div className="flex items-center justify-center h-40">
                <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
            </div>
        );
    }

    if (!user?.companyId) {
        return (
            <MissingCompanyState description="Google Ads ekranı şirket bilgisi olan bir müşteri hesabıyla açılmalıdır." />
        );
    }

    const customerId = status?.customerId || data?.customerId || '';
    const effectiveConnected = Boolean(status?.connected && status.hasAdsScope);
    const needsReconnect = Boolean(status && (
        !status.connected || !status.hasAdsScope || status.needsReconnect
    ));
    const loadError = statusError ?? snapshotError;
    const visibleError = callbackError
        || actionError
        || data?.errorMessage
        || (snapshotMeta?.status === 'FAILED' && !data?.connected
            ? 'Google Ads snapshot oluşturulamadı. Bağlantıyı kontrol edip tekrar deneyin.'
            : '')
        || (loadError ? getApiErrorMessage(loadError, 'Google Ads verileri yüklenemedi') : '');
    const sortedCampaigns = sortCampaigns(data?.campaigns ?? [], sortCol, sortAsc);
    const hasPerformanceData = Boolean(data && (
        data.totalSpend > 0
        || data.impressions > 0
        || data.clicks > 0
        || data.conversions > 0
        || data.campaigns.length > 0
        || data.dailyTrend.length > 0
    ));

    const handleSort = (col: typeof sortCol) => {
        if (sortCol === col) setSortAsc(v => !v);
        else { setSortCol(col); setSortAsc(false); }
    };

    const SortIcon = ({ col }: { col: typeof sortCol }) =>
        sortCol === col ? (sortAsc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />) : null;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0C0C0E] p-6">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/8 via-transparent to-violet-500/5 pointer-events-none" />
                <div className="relative flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-violet-500/20 border border-blue-500/20 flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-white">Google Ads</h1>
                            <p className="text-[12px] text-zinc-500 mt-0.5">
                                {customerId ? `Müşteri ID: ${customerId}` : 'Reklam performans raporu'}
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
                            disabled={refreshMut.isPending || !effectiveConnected || !customerId}
                            title="Google Ads snapshot'ını yenile"
                            className="p-2 rounded-xl border border-white/[0.06] text-zinc-500 hover:text-zinc-300 transition-colors disabled:opacity-40">
                            <RefreshCw className={`w-3.5 h-3.5 ${refreshMut.isPending ? 'animate-spin' : ''}`} />
                        </button>
                        {effectiveConnected && (
                            <button onClick={() => setShowSetup(v => !v)}
                                className="flex items-center gap-2 px-3 py-2 rounded-xl border border-white/[0.06] text-zinc-400 hover:text-white text-[12px] transition-colors">
                                <Link className="w-3.5 h-3.5" />
                                {customerId ? 'ID Güncelle' : 'ID Bağla'}
                            </button>
                        )}
                        {needsReconnect && status && (
                            <a href={status.authUrl}
                                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-semibold transition-colors">
                                {status.connected ? 'Yeniden Bağla' : 'Google ile Bağla'}
                            </a>
                        )}
                        {status?.connected && (
                            <button
                                onClick={() => {
                                    if (confirm('Google Ads bağlantısını kesmek istediğinizden emin misiniz?')) {
                                        disconnectMut.mutate();
                                    }
                                }}
                                disabled={disconnectMut.isPending}
                                className="flex items-center gap-2 px-3 py-2 rounded-xl border border-red-500/20 text-red-400 hover:bg-red-500/10 text-[12px] font-medium transition-colors disabled:opacity-50"
                                title="Bağlantıyı Kes"
                            >
                                {disconnectMut.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Unlink className="w-3.5 h-3.5" />}
                                Bağlantıyı Kes
                            </button>
                        )}
                    </div>
                </div>

                {/* Setup form */}
                {effectiveConnected && (showSetup || !customerId) && (
                    <div className="relative mt-4 flex items-center gap-3">
                        <input
                            value={customerIdInput}
                            onChange={e => setCustomerIdInput(e.target.value)}
                            placeholder="Google Ads Müşteri ID (örn: 123-456-7890)"
                            className="flex-1 bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-2.5 text-[12px] text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500/50"
                        />
                        <button
                            onClick={() => saveMut.mutate(customerIdInput)}
                            disabled={!customerIdInput.trim() || saveMut.isPending}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-[12px] font-semibold transition-colors"
                        >
                            {saveMut.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                            Kaydet
                        </button>
                    </div>
                )}
            </div>

            {!effectiveConnected && !visibleError && (
                <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-5 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-semibold text-white">Google Ads bağlı değil</p>
                        <p className="text-xs text-zinc-500 mt-1">Lütfen Google hesabını bağlayın.</p>
                    </div>
                </div>
            )}

            {effectiveConnected && !customerId && (
                <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-5 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-semibold text-white">Google hesabı bağlı, müşteri ID eksik</p>
                        <p className="text-xs text-zinc-500 mt-1">Raporu açmak için Google Ads müşteri ID'sini girin.</p>
                    </div>
                </div>
            )}

            {visibleError && (
                <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-5 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-semibold text-white">{visibleError}</p>
                        <p className="text-xs text-zinc-500 mt-1">Google Ads hesabını, iki adımlı doğrulamayı ve yönetici hesap erişimini kontrol edin.</p>
                    </div>
                </div>
            )}

            {data?.connected && (snapshotMeta?.status === 'FAILED' || status?.needsReconnect) && (
                <div className="flex items-start gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
                    <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
                    <div>
                        <p className="text-sm font-semibold text-amber-200">Son başarılı reklam verisi gösteriliyor</p>
                        <p className="mt-1 text-xs text-zinc-500">
                            Yeni veri alınamadı; kayıtlı snapshot korunuyor. Gerekirse Google hesabını yeniden bağlayın.
                        </p>
                    </div>
                </div>
            )}

            {isLoading && (
                <div className="flex items-center justify-center h-40">
                    <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
                </div>
            )}

            {effectiveConnected && customerId && !data?.connected && !visibleError && !isLoading && (
                <div className="rounded-2xl border border-amber-500/20 bg-[#0C0C0E] px-6 py-10 text-center">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin text-amber-400" />
                    <p className="mt-3 text-sm font-medium text-amber-200">Google Ads snapshot verileri hazırlanıyor</p>
                    <p className="mt-1 text-xs text-zinc-500">Yenile düğmesiyle ilk snapshot'ı hemen oluşturabilirsiniz.</p>
                </div>
            )}

            {effectiveConnected && data?.connected && customerId && !visibleError && !isLoading && !hasPerformanceData && (
                <div className="rounded-2xl border border-white/[0.06] bg-[#0C0C0E] px-6 py-12 text-center">
                    <Target className="mx-auto h-8 w-8 text-zinc-600" />
                    <h2 className="mt-4 text-base font-semibold text-white">Bu dönemde reklam performansı yok</h2>
                    <p className="mt-1 text-sm text-zinc-500">Aktif kampanya veya ölçümlenmiş reklam hareketi bulunamadı.</p>
                </div>
            )}

            {effectiveConnected && data?.connected && customerId && !visibleError && !isLoading && hasPerformanceData && (
                <>
                    {/* KPI cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { label: 'Toplam Harcama',  value: formatCurrency(data.totalSpend, data.currencyCode), icon: TrendingUp,        color: 'text-blue-400',    bg: 'bg-blue-500/10',    border: 'border-blue-500/20' },
                            { label: 'Tıklama',         value: formatMetric(data.clicks),       icon: MousePointerClick,  color: 'text-violet-400',  bg: 'bg-violet-500/10',  border: 'border-violet-500/20' },
                            { label: 'Gösterim',        value: formatMetric(data.impressions),  icon: Eye,                color: 'text-cyan-400',    bg: 'bg-cyan-500/10',    border: 'border-cyan-500/20' },
                            { label: 'Dönüşüm',         value: formatMetric(data.conversions),  icon: Target,             color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
                        ].map(s => {
                            const Icon = s.icon;
                            return (
                                <div key={s.label} className={`${s.bg} border ${s.border} rounded-2xl p-4`}>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Icon className={`w-4 h-4 ${s.color}`} />
                                        <span className="text-[11px] text-zinc-400">{s.label}</span>
                                    </div>
                                    <p className="text-xl font-bold text-white">{s.value}</p>
                                </div>
                            );
                        })}
                    </div>

                    {/* Secondary metrics */}
                    <div className="grid grid-cols-3 gap-4">
                        {[
                            { label: 'CPC (Tıklama Başı Maliyet)', value: formatCurrency(data.cpc, data.currencyCode) },
                            { label: 'CTR (Tıklama Oranı)',         value: data.ctr.toFixed(2) + '%' },
                            { label: 'Dönüşüm Oranı',               value: data.conversionRate.toFixed(2) + '%' },
                        ].map(m => (
                            <div key={m.label} className="bg-[#0C0C0E] border border-white/[0.06] rounded-2xl p-4">
                                <p className="text-[10px] text-zinc-500 mb-1">{m.label}</p>
                                <p className="text-lg font-bold text-white">{m.value}</p>
                            </div>
                        ))}
                    </div>

                    {/* Daily chart */}
                    {data.dailyTrend.length > 0 && (
                        <div className="bg-[#0C0C0E] border border-white/[0.06] rounded-2xl p-5">
                            <h3 className="text-[11px] text-zinc-500 uppercase tracking-widest mb-4">Günlük Harcama</h3>
                            <ResponsiveContainer width="100%" height={200}>
                                <AreaChart data={data.dailyTrend}>
                                    <defs>
                                        <linearGradient id="gadsGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#52525b' }} tickLine={false} axisLine={false}
                                        tickFormatter={v => v.slice(5)} />
                                    <YAxis tick={{ fontSize: 10, fill: '#52525b' }} tickLine={false} axisLine={false}
                                        tickFormatter={v => '₺' + v} />
                                    <Tooltip
                                        contentStyle={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12 }}
                                        labelStyle={{ color: '#a1a1aa', fontSize: 11 }}
                                        itemStyle={{ color: '#3b82f6', fontSize: 12 }}
                                        formatter={(v) => [formatCurrency(Number(v ?? 0), data.currencyCode), 'Harcama']}
                                    />
                                    <Area type="monotone" dataKey="spend" stroke="#3b82f6" strokeWidth={2} fill="url(#gadsGrad)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    )}

                    {/* Campaigns table */}
                    {sortedCampaigns.length > 0 && (
                        <div className="bg-[#0C0C0E] border border-white/[0.06] rounded-2xl overflow-hidden">
                            <div className="px-5 py-4 border-b border-white/[0.06]">
                                <h3 className="text-[11px] text-zinc-500 uppercase tracking-widest">Kampanyalar</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-white/[0.04]">
                                            <th className="text-left px-5 py-3 text-[10px] text-zinc-600 uppercase tracking-wider font-medium">Kampanya</th>
                                            {(['spend', 'clicks', 'impressions', 'conversions'] as const).map(col => (
                                                <th key={col} onClick={() => handleSort(col)}
                                                    className="text-right px-4 py-3 text-[10px] text-zinc-600 uppercase tracking-wider font-medium cursor-pointer hover:text-zinc-400 select-none">
                                                    <span className="flex items-center justify-end gap-1">
                                                        {col === 'spend' ? 'Harcama' : col === 'clicks' ? 'Tıklama' : col === 'impressions' ? 'Gösterim' : 'Dönüşüm'}
                                                        <SortIcon col={col} />
                                                    </span>
                                                </th>
                                            ))}
                                            <th className="text-right px-5 py-3 text-[10px] text-zinc-600 uppercase tracking-wider font-medium">CTR</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sortedCampaigns.map(c => (
                                            <tr key={c.campaignId} className="border-b border-white/[0.03] hover:bg-white/[0.01] transition-colors">
                                                <td className="px-5 py-3">
                                                    <p className="text-[12px] text-white font-medium">{c.campaignName}</p>
                                                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${campaignStatusTone(c.status)}`}>{c.status}</span>
                                                </td>
                                                <td className="px-4 py-3 text-right text-[12px] font-semibold text-blue-400">{formatCurrency(c.spend, data.currencyCode)}</td>
                                                <td className="px-4 py-3 text-right text-[12px] text-zinc-300">{formatMetric(c.clicks)}</td>
                                                <td className="px-4 py-3 text-right text-[12px] text-zinc-300">{formatMetric(c.impressions)}</td>
                                                <td className="px-4 py-3 text-right text-[12px] text-zinc-300">{formatMetric(c.conversions)}</td>
                                                <td className="px-5 py-3 text-right text-[12px] text-zinc-400">{c.ctr.toFixed(2)}%</td>
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
