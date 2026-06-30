import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import {
    TrendingUp, MousePointerClick, Eye, Users, AlertTriangle,
    Loader2, Link, Check, RefreshCw, ChevronUp, ChevronDown
} from 'lucide-react';
import {
    formatMetaAdsCurrency,
    formatMetaAdsMetric,
    metaAdsApi,
    metaAdsKeys,
    sortMetaAdsCampaigns,
    type MetaAdsSortColumn,
} from '../../features/meta-ads';
import { MissingCompanyState } from '../../components/client/MissingCompanyState';
import { useAuth } from '../../store/AuthContext';

const currency = formatMetaAdsCurrency;
const fmt = formatMetaAdsMetric;

export default function MetaAdsDetailPage() {
    const { user, isLoading: authLoading } = useAuth();
    const qc = useQueryClient();
    const [adAccountInput, setAdAccountInput] = useState('');
    const [showSetup, setShowSetup] = useState(false);
    const [sortCol, setSortCol] = useState<MetaAdsSortColumn>('spend');
    const [sortAsc, setSortAsc] = useState(false);

    const { data: status, isLoading: statusLoading } = useQuery({
        queryKey: metaAdsKeys.status(user?.companyId ?? ''),
        queryFn: () => metaAdsApi.getStatus(user!.companyId!),
        enabled: !!user?.companyId && !authLoading,
    });

    const { data, isLoading } = useQuery({
        queryKey: metaAdsKeys.overview(user?.companyId ?? ''),
        queryFn: () => metaAdsApi.getOverview(user!.companyId!),
        enabled: !!user?.companyId && !authLoading,
        staleTime: 5 * 60 * 1000,
    });

    const saveMut = useMutation({
        mutationFn: (id: string) => metaAdsApi.saveAdAccount(user!.companyId!, id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: metaAdsKeys.all });
            setShowSetup(false);
        },
    });

    if (authLoading || statusLoading) {
        return (
            <div className="flex items-center justify-center h-40">
                <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
            </div>
        );
    }

    if (!user?.companyId) {
        return (
            <MissingCompanyState description="Meta Ads ekranı şirket bilgisi olan bir müşteri hesabıyla açılmalıdır." />
        );
    }

    const adAccountId = status?.adAccountId || data?.adAccountId || '';
    const sortedCampaigns = sortMetaAdsCampaigns(
        data?.campaigns ?? [],
        sortCol,
        sortAsc,
    );

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
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/8 via-transparent to-pink-500/5 pointer-events-none" />
                <div className="relative flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-600/20 to-pink-500/20 border border-blue-600/20 flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-white">Meta Ads</h1>
                            <p className="text-[12px] text-zinc-500 mt-0.5">
                                {data?.adAccountName ? data.adAccountName : 'Facebook & Instagram Reklam Raporu'}
                                {adAccountId && <span className="ml-2 text-zinc-600">· {adAccountId}</span>}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => qc.invalidateQueries({ queryKey: metaAdsKeys.all })}
                            className="p-2 rounded-xl border border-white/[0.06] text-zinc-500 hover:text-zinc-300 transition-colors">
                            <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => setShowSetup(v => !v)}
                            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-white/[0.06] text-zinc-400 hover:text-white text-[12px] transition-colors">
                            <Link className="w-3.5 h-3.5" />
                            {adAccountId ? 'Hesap Güncelle' : 'Hesap Bağla'}
                        </button>
                        {status && !status.connected && (
                            <a href={status.authUrl}
                                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-semibold transition-colors">
                                Meta ile Bağla
                            </a>
                        )}
                    </div>
                </div>

                {/* Setup form */}
                {(showSetup || (status?.connected && !adAccountId)) && (
                    <div className="relative mt-4 flex items-center gap-3">
                        <input
                            value={adAccountInput}
                            onChange={e => setAdAccountInput(e.target.value)}
                            placeholder="Meta Reklam Hesabı ID (örn: 123456789 veya act_123456789)"
                            className="flex-1 bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-2.5 text-[12px] text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500/50"
                        />
                        <button
                            onClick={() => saveMut.mutate(adAccountInput)}
                            disabled={!adAccountInput.trim() || saveMut.isPending}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-[12px] font-semibold transition-colors"
                        >
                            {saveMut.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                            Kaydet
                        </button>
                    </div>
                )}
            </div>

            {!status?.connected && (
                <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-5 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-semibold text-white">Meta Ads bağlı değil</p>
                        <p className="text-xs text-zinc-500 mt-1">Meta hesabınızı bağlayın.</p>
                    </div>
                </div>
            )}

            {status?.connected && !adAccountId && (
                <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-5 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-semibold text-white">Meta hesabı bağlı, reklam hesabı ID'si eksik</p>
                        <p className="text-xs text-zinc-500 mt-1">Raporu açmak için reklam hesabı ID'sini girin.</p>
                    </div>
                </div>
            )}

            {status?.connected && adAccountId && data?.errorMessage && (
                <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-5 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-semibold text-white">{data.errorMessage}</p>
                        <p className="text-xs text-zinc-500 mt-1">Bağlantı aktif görünüyor; izinleri veya reklam hesabı ID'sini kontrol edin.</p>
                    </div>
                </div>
            )}

            {isLoading && (
                <div className="flex items-center justify-center h-40">
                    <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                </div>
            )}

            {data?.connected && adAccountId && !data.errorMessage && !isLoading && (
                <>
                    {/* KPI cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { label: 'Toplam Harcama', value: currency(data.totalSpend), icon: TrendingUp,        color: 'text-blue-400',   bg: 'bg-blue-500/10',    border: 'border-blue-500/20' },
                            { label: 'Tıklama',        value: fmt(data.clicks),          icon: MousePointerClick, color: 'text-violet-400', bg: 'bg-violet-500/10',  border: 'border-violet-500/20' },
                            { label: 'Erişim',         value: fmt(data.reach),           icon: Users,             color: 'text-pink-400',   bg: 'bg-pink-500/10',    border: 'border-pink-500/20' },
                            { label: 'Gösterim',       value: fmt(data.impressions),     icon: Eye,               color: 'text-cyan-400',   bg: 'bg-cyan-500/10',    border: 'border-cyan-500/20' },
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
                            { label: 'CPM (1000 Gösterim Başı)', value: currency(data.cpm) },
                            { label: 'CPC (Tıklama Başı)',       value: currency(data.cpc) },
                            { label: 'CTR (Tıklama Oranı)',      value: data.ctr.toFixed(2) + '%' },
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
                            <h3 className="text-[11px] text-zinc-500 uppercase tracking-widest mb-4">Günlük Harcama Trendi</h3>
                            <ResponsiveContainer width="100%" height={200}>
                                <AreaChart data={data.dailyTrend}>
                                    <defs>
                                        <linearGradient id="metaGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
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
                                        itemStyle={{ color: '#2563eb', fontSize: 12 }}
                                        formatter={(v) => [currency(Number(v ?? 0)), 'Harcama']}
                                    />
                                    <Area type="monotone" dataKey="spend" stroke="#2563eb" strokeWidth={2} fill="url(#metaGrad)" />
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
                                            {(['spend', 'impressions', 'clicks', 'reach'] as const).map(col => (
                                                <th key={col} onClick={() => handleSort(col)}
                                                    className="text-right px-4 py-3 text-[10px] text-zinc-600 uppercase tracking-wider font-medium cursor-pointer hover:text-zinc-400 select-none">
                                                    <span className="flex items-center justify-end gap-1">
                                                        {col === 'spend' ? 'Harcama' : col === 'impressions' ? 'Gösterim' : col === 'clicks' ? 'Tıklama' : 'Erişim'}
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
                                                    {c.objective && <p className="text-[10px] text-zinc-600">{c.objective}</p>}
                                                </td>
                                                <td className="px-4 py-3 text-right text-[12px] font-semibold text-blue-400">{currency(c.spend)}</td>
                                                <td className="px-4 py-3 text-right text-[12px] text-zinc-300">{fmt(c.impressions)}</td>
                                                <td className="px-4 py-3 text-right text-[12px] text-zinc-300">{fmt(c.clicks)}</td>
                                                <td className="px-4 py-3 text-right text-[12px] text-zinc-300">{fmt(c.reach)}</td>
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
