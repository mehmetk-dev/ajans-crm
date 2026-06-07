import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, MousePointerClick, Eye, Target, AlertTriangle, Loader2, ExternalLink, ChevronRight } from 'lucide-react';
import { googleAdsApi } from '../../api/googleAds';

interface Props { companyId: string; }

function fmt(n: number, digits = 0) {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
    if (n >= 1_000)     return (n / 1_000).toFixed(1) + 'K';
    return n.toFixed(digits);
}
function currency(n: number) { return '₺' + n.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

export default function GoogleAdsPanel({ companyId }: Props) {
    const navigate = useNavigate();
    const { data, isLoading } = useQuery({
        queryKey: ['google-ads-overview', companyId],
        queryFn: () => googleAdsApi.getOverview(companyId),
        staleTime: 5 * 60 * 1000,
    });

    if (isLoading) return (
        <div className="bg-[#0C0C0E] border border-white/[0.06] rounded-2xl p-8 flex items-center justify-center">
            <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
        </div>
    );

    if (!data?.connected) return (
        <div className="bg-[#0C0C0E] border border-white/[0.06] rounded-2xl p-6 text-center">
            <Target className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
            <p className="text-sm font-medium text-white">Google Ads Bağlı Değil</p>
            <p className="text-xs text-zinc-500 mt-1">Reklam verilerinizi görüntülemek için hesabı bağlayın</p>
        </div>
    );

    if (!data.hasAdsScope || (data.customerId && data.errorMessage)) return (
        <div className="bg-[#0C0C0E] border border-white/[0.06] rounded-2xl p-5">
            <div className="flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                    <p className="text-[12px] font-semibold text-white">{data.errorMessage || 'Yetki eksik'}</p>
                    <p className="text-[11px] text-zinc-500 mt-1">Google hesabını yeniden bağlayın veya Müşteri ID'yi girin.</p>
                </div>
            </div>
        </div>
    );

    if (!data.customerId) return (
        <div className="bg-[#0C0C0E] border border-white/[0.06] rounded-2xl p-6 text-center">
            <Target className="w-8 h-8 text-blue-400/50 mx-auto mb-2" />
            <p className="text-sm text-zinc-400">Google Ads Müşteri ID'si girilmemiş</p>
            <button onClick={() => navigate('/client/google-ads')}
                className="mt-3 text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1 mx-auto transition-colors">
                Şimdi ayarla <ChevronRight className="w-3 h-3" />
            </button>
        </div>
    );

    const stats = [
        { label: 'Harcama',        value: currency(data.totalSpend), icon: TrendingUp,        color: 'text-blue-400' },
        { label: 'Tıklama',        value: fmt(data.clicks),          icon: MousePointerClick,  color: 'text-violet-400' },
        { label: 'Gösterim',       value: fmt(data.impressions),     icon: Eye,                color: 'text-cyan-400' },
        { label: 'Dönüşüm',        value: fmt(data.conversions),     icon: Target,             color: 'text-emerald-400' },
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
                <span>CPC: <strong className="text-zinc-300">{currency(data.cpc)}</strong></span>
                <span>CTR: <strong className="text-zinc-300">{data.ctr.toFixed(2)}%</strong></span>
                <span>Dönüşüm Oranı: <strong className="text-zinc-300">{data.conversionRate.toFixed(2)}%</strong></span>
            </div>

            {/* Top campaigns */}
            {data.campaigns.length > 0 && (
                <div className="space-y-1.5">
                    <p className="text-[10px] text-zinc-600 uppercase tracking-widest px-1">Kampanyalar</p>
                    {data.campaigns.slice(0, 4).map(c => (
                        <div key={c.campaignId} className="flex items-center gap-3 px-1 py-1.5 rounded-lg hover:bg-white/[0.02] transition-colors">
                            <div className="flex-1 min-w-0">
                                <p className="text-[12px] font-medium text-white truncate">{c.campaignName}</p>
                                <p className="text-[10px] text-zinc-600">{c.clicks.toLocaleString()} tıklama · {c.impressions.toLocaleString()} gösterim</p>
                            </div>
                            <span className="text-[12px] font-semibold text-blue-400 shrink-0">{currency(c.spend)}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Detail link */}
            <button onClick={() => navigate('/client/google-ads')}
                className="w-full flex items-center justify-center gap-1.5 py-2 text-[11px] text-zinc-500 hover:text-zinc-300 border-t border-white/[0.04] transition-colors">
                Detaylı rapor <ExternalLink className="w-3 h-3" />
            </button>
        </div>
    );
}
