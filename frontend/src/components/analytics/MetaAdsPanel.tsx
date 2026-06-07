import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, MousePointerClick, Eye, Users, AlertTriangle, Loader2, ExternalLink, ChevronRight } from 'lucide-react';
import { metaAdsApi } from '../../api/metaAds';

interface Props { companyId: string; }

function fmt(n: number) {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
    if (n >= 1_000)     return (n / 1_000).toFixed(1) + 'K';
    return n.toString();
}
function currency(n: number) { return '₺' + n.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

export default function MetaAdsPanel({ companyId }: Props) {
    const navigate = useNavigate();
    const { data, isLoading } = useQuery({
        queryKey: ['meta-ads-overview', companyId],
        queryFn: () => metaAdsApi.getOverview(companyId),
        staleTime: 5 * 60 * 1000,
    });

    if (isLoading) return (
        <div className="bg-[#0C0C0E] border border-white/[0.06] rounded-2xl p-8 flex items-center justify-center">
            <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
        </div>
    );

    if (!data?.connected) return (
        <div className="bg-[#0C0C0E] border border-white/[0.06] rounded-2xl p-6 text-center">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 mx-auto mb-3 flex items-center justify-center opacity-30">
                <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <p className="text-sm font-medium text-white">Meta Ads Bağlı Değil</p>
            <p className="text-xs text-zinc-500 mt-1">Facebook/Instagram reklam verilerini görüntüleyin</p>
        </div>
    );

    if (!data.adAccountId || data.errorMessage) return (
        <div className="bg-[#0C0C0E] border border-white/[0.06] rounded-2xl p-5">
            <div className="flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                    <p className="text-[12px] font-semibold text-white">{data.errorMessage || 'Reklam hesabı ID\'si girilmemiş'}</p>
                    <button onClick={() => navigate('/client/meta-ads')}
                        className="text-[11px] text-blue-400 hover:text-blue-300 mt-1 flex items-center gap-1 transition-colors">
                        Hesap ID'sini gir <ChevronRight className="w-3 h-3" />
                    </button>
                </div>
            </div>
        </div>
    );

    const stats = [
        { label: 'Harcama',   value: currency(data.totalSpend), icon: TrendingUp,        color: 'text-blue-500' },
        { label: 'Tıklama',   value: fmt(data.clicks),          icon: MousePointerClick,  color: 'text-violet-400' },
        { label: 'Erişim',    value: fmt(data.reach),           icon: Users,              color: 'text-pink-400' },
        { label: 'Gösterim',  value: fmt(data.impressions),     icon: Eye,                color: 'text-cyan-400' },
    ];

    return (
        <div className="bg-[#0C0C0E] border border-white/[0.06] rounded-2xl p-5 space-y-4">
            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {stats.map(s => {
                    const Icon = s.icon;
                    return (
                        <div key={s.label} className="bg-white/[0.02] rounded-xl p-3">
                            <div className="flex items-center gap-1.5 mb-1">
                                <Icon className={`w-3 h-3 ${s.color}`} />
                                <span className="text-[10px] text-zinc-500">{s.label}</span>
                            </div>
                            <p className="text-base font-bold text-white">{s.value}</p>
                        </div>
                    );
                })}
            </div>

            {/* Secondary metrics */}
            <div className="flex items-center gap-4 px-1 text-[11px] text-zinc-500 flex-wrap">
                <span>CPM: <strong className="text-zinc-300">{currency(data.cpm)}</strong></span>
                <span>CPC: <strong className="text-zinc-300">{currency(data.cpc)}</strong></span>
                <span>CTR: <strong className="text-zinc-300">{data.ctr.toFixed(2)}%</strong></span>
            </div>

            {/* Top campaigns */}
            {data.campaigns.length > 0 && (
                <div className="space-y-1.5">
                    <p className="text-[10px] text-zinc-600 uppercase tracking-widest px-1">Kampanyalar</p>
                    {data.campaigns.slice(0, 4).map(c => (
                        <div key={c.campaignId} className="flex items-center gap-3 px-1 py-1.5 rounded-lg hover:bg-white/[0.02] transition-colors">
                            <div className="flex-1 min-w-0">
                                <p className="text-[12px] font-medium text-white truncate">{c.campaignName}</p>
                                <p className="text-[10px] text-zinc-600">{fmt(c.impressions)} gösterim · {fmt(c.reach)} erişim</p>
                            </div>
                            <span className="text-[12px] font-semibold text-blue-400 shrink-0">{currency(c.spend)}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Detail link */}
            <button onClick={() => navigate('/client/meta-ads')}
                className="w-full flex items-center justify-center gap-1.5 py-2 text-[11px] text-zinc-500 hover:text-zinc-300 border-t border-white/[0.04] transition-colors">
                Detaylı rapor <ExternalLink className="w-3 h-3" />
            </button>
        </div>
    );
}
