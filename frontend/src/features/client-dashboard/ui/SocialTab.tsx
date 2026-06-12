import {
    Users, Eye, TrendingUp, ExternalLink, FileText, Instagram, ChevronRight
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';
import type { IgOverviewResponse } from '../../instagram/instagram.types';
import { MetricCard, MiniStat, ChartCard, EmptyState } from './DashboardCards';
import { fmt } from '../dashboard.utils';

interface SocialTabProps {
    ig: IgOverviewResponse | undefined;
    navigate: (path: string) => void;
    igConnected: boolean;
}

export function SocialTab({ ig, navigate, igConnected }: SocialTabProps) {
    if (!igConnected) {
        return <EmptyState icon={Instagram} text="Instagram hesabınızı bağlayarak sosyal medya verilerinizi görün" action={() => navigate('/client/analytics')} actionLabel="Instagram Bağla" />;
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                <MetricCard label="Takipçi" value={fmt(ig!.followersCount)} icon={Users} color="pink" />
                <MetricCard label="Takip" value={fmt(ig!.followsCount)} icon={Users} color="violet" />
                <MetricCard label="Gönderi" value={fmt(ig!.mediaCount)} icon={FileText} color="blue" />
                <MetricCard label="Erişim" value={fmt(ig!.reach)} icon={Eye} color="emerald" />
                <MetricCard label="Gösterim" value={fmt(ig!.impressions)} icon={TrendingUp} color="amber" />
                <MetricCard label="Profil Ziyareti" value={fmt(ig!.profileViews)} icon={ExternalLink} color="cyan" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-[#0C0C0E] border border-white/[0.06] rounded-2xl p-5">
                    <h3 className="text-sm font-semibold text-white mb-4">Etkileşim Özeti</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <MiniStat label="Beğeni" value={fmt(ig!.totalLikes)} color="text-pink-400" />
                        <MiniStat label="Yorum" value={fmt(ig!.totalComments)} color="text-blue-400" />
                        <MiniStat label="Yeni Takipçi" value={`+${fmt(ig!.followersGained)}`} color="text-emerald-400" />
                        <MiniStat label="Kayıp Takipçi" value={`-${fmt(ig!.followersLost)}`} color="text-red-400" />
                        <MiniStat label="Site Tıklama" value={fmt(ig!.websiteClicks)} color="text-amber-400" />
                        <MiniStat label="Net Büyüme" value={`${ig!.followersGained - ig!.followersLost > 0 ? '+' : ''}${fmt(ig!.followersGained - ig!.followersLost)}`} color="text-violet-400" />
                    </div>
                </div>

                <ChartCard title="Günlük Takipçi & Erişim" subtitle="Son 30 gün">
                    {ig!.dailyTrend?.length > 0 ? (
                        <ResponsiveContainer width="100%" height={220}>
                            <AreaChart data={ig!.dailyTrend}>
                                <defs>
                                    <linearGradient id="igReach" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#f472b6" stopOpacity={0.3} />
                                        <stop offset="100%" stopColor="#f472b6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#52525b' }} tickFormatter={(d: string) => d.slice(5)} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 10, fill: '#52525b' }} axisLine={false} tickLine={false} width={35} />
                                <Tooltip contentStyle={{ background: '#18181b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 }} />
                                <Area type="monotone" dataKey="reach" name="Erişim" stroke="#f472b6" fill="url(#igReach)" strokeWidth={2} />
                                <Area type="monotone" dataKey="impressions" name="Gösterim" stroke="#818cf8" fill="transparent" strokeWidth={1.5} strokeDasharray="4 3" />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : <p className="text-zinc-600 text-sm text-center py-10">Günlük veri yok</p>}
                </ChartCard>
            </div>

            {ig!.recentMedia?.length > 0 && (
                <div className="bg-[#0C0C0E] border border-white/[0.06] rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-white">Son Gönderiler</h3>
                        <button onClick={() => navigate('/client/instagram')} className="text-[11px] text-zinc-500 hover:text-zinc-300 flex items-center gap-1">
                            Tümü <ChevronRight className="w-3 h-3" />
                        </button>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                        {ig!.recentMedia.slice(0, 6).map((m: { id: string; permalink: string; mediaUrl: string; likeCount: number; commentsCount: number }) => (
                            <a key={m.id} href={m.permalink} target="_blank" rel="noreferrer" className="group relative aspect-square rounded-xl overflow-hidden border border-white/[0.06] hover:border-pink-500/30 transition-all">
                                <img src={m.mediaUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <span className="text-[10px] text-white font-bold">❤️ {m.likeCount}</span>
                                    <span className="text-[10px] text-white font-bold">💬 {m.commentsCount}</span>
                                </div>
                            </a>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}