import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import {
    TrendingUp, MousePointerClick, Eye, Target, AlertTriangle,
    Loader2, Link, Check, RefreshCw, ChevronUp, ChevronDown
} from 'lucide-react';
import {
    campaignStatusTone,
    formatCurrency,
    formatMetric,
    googleAdsApi,
    googleAdsKeys,
    sortCampaigns,
    type GoogleAdsSortColumn,
} from '../../features/google-ads';
import { useAuth } from '../../store/AuthContext';

export default function GoogleAdsDetailPage() {
    const { user } = useAuth();
    const qc = useQueryClient();
    const [customerIdInput, setCustomerIdInput] = useState('');
    const [showSetup, setShowSetup] = useState(false);
    const [sortCol, setSortCol] = useState<GoogleAdsSortColumn>('spend');
    const [sortAsc, setSortAsc] = useState(false);

    const { data: status } = useQuery({
        queryKey: googleAdsKeys.status(user?.companyId ?? ''),
        queryFn: () => googleAdsApi.getStatus(user!.companyId!),
        enabled: !!user?.companyId,
    });

    const { data, isLoading } = useQuery({
        queryKey: googleAdsKeys.overview(user?.companyId ?? ''),
        queryFn: () => googleAdsApi.getOverview(user!.companyId!),
        enabled: !!user?.companyId,
        staleTime: 5 * 60 * 1000,
    });

    const saveMut = useMutation({
        mutationFn: (id: string) => googleAdsApi.saveCustomerId(user!.companyId!, id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: googleAdsKeys.all });
            setShowSetup(false);
        },
    });

    if (!user?.companyId) return null;

    const sortedCampaigns = sortCampaigns(data?.campaigns ?? [], sortCol, sortAsc);

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
                <div className="relative flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-violet-500/20 border border-blue-500/20 flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-white">Google Ads</h1>
                            <p className="text-[12px] text-zinc-500 mt-0.5">
                                {data?.customerId ? `Müşteri ID: ${data.customerId}` : 'Reklam performans raporu'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => qc.invalidateQueries({ queryKey: googleAdsKeys.overview(user.companyId!) })}
                            className="p-2 rounded-xl border border-white/[0.06] text-zinc-500 hover:text-zinc-300 transition-colors">
                            <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => setShowSetup(v => !v)}
                            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-white/[0.06] text-zinc-400 hover:text-white text-[12px] transition-colors">
                            <Link className="w-3.5 h-3.5" />
                            {data?.customerId ? 'ID Güncelle' : 'ID Bağla'}
                        </button>
                        {status && !status.connected && (
                            <a href={status.authUrl}
                                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-semibold transition-colors">
                                Google ile Bağla
                            </a>
                        )}
                        {status?.connected && !status.hasAdsScope && (
                            <a href={status.authUrl}
                                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-[12px] font-semibold transition-colors">
                                Yetki Güncelle
                            </a>
                        )}
                    </div>
                </div>

                {/* Setup form */}
                {showSetup && (
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

            {/* Error / not connected */}
            {(data?.errorMessage || !data?.connected) && (
                <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-5 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-semibold text-white">{data?.errorMessage ?? 'Google Ads bağlı değil'}</p>
                        <p className="text-xs text-zinc-500 mt-1">Lütfen Google hesabını bağlayın ve müşteri ID'sini girin.</p>
                    </div>
                </div>
            )}

            {isLoading && (
                <div className="flex items-center justify-center h-40">
                    <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
                </div>
            )}

            {data?.connected && !data.errorMessage && !isLoading && (
                <>
                    {/* KPI cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { label: 'Toplam Harcama',  value: formatCurrency(data.totalSpend), icon: TrendingUp,        color: 'text-blue-400',    bg: 'bg-blue-500/10',    border: 'border-blue-500/20' },
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
                            { label: 'CPC (Tıklama Başı Maliyet)', value: formatCurrency(data.cpc) },
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
                                        formatter={(v) => [formatCurrency(Number(v ?? 0)), 'Harcama']}
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
                                                <td className="px-4 py-3 text-right text-[12px] font-semibold text-blue-400">{formatCurrency(c.spend)}</td>
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
