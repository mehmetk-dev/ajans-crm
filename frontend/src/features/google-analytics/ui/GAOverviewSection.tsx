import { motion } from 'framer-motion';
import { CheckCircle2, Clock, Eye, FileText, MousePointerClick, TrendingUp, Users } from 'lucide-react';
import { BigMetricCard, SectionHeader } from './GoogleAnalyticsCards';
import { formatNum, formatDuration } from '../model/googleAnalytics.utils';

interface GAOverviewSectionProps {
    sessions: number;
    totalUsers: number;
    newUsers: number;
    pageViews: number;
    currentRangeDesc: string;
    engagementRate: string;
    sessionsPerUser: string;
}

export function GAOverviewSection({
    sessions,
    totalUsers,
    newUsers,
    pageViews,
    currentRangeDesc,
    engagementRate,
    sessionsPerUser,
}: GAOverviewSectionProps) {
    return (
        <section>
            <SectionHeader icon={TrendingUp} title="Genel Bakış" color="bg-[#C8697A]/20">
                <span className="text-[11px] text-zinc-500">
                    {currentRangeDesc} özet veriler
                </span>
            </SectionHeader>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <BigMetricCard
                    label="Toplam Oturum"
                    value={formatNum(sessions)}
                    icon={TrendingUp}
                    color="text-[#F5BEC8]"
                    bgColor="bg-[#C8697A]/10"
                />
                <BigMetricCard
                    label="Toplam Kullanıcı"
                    value={formatNum(totalUsers)}
                    icon={Users}
                    color="text-pink-400"
                    bgColor="bg-pink-500/10"
                />
                <BigMetricCard
                    label="Yeni Kullanıcı"
                    value={formatNum(newUsers)}
                    icon={Users}
                    color="text-cyan-400"
                    bgColor="bg-cyan-500/10"
                    sub={
                        totalUsers > 0
                            ? `%${((newUsers / totalUsers) * 100).toFixed(1)} yeni`
                            : undefined
                    }
                    trend="up"
                />
                <BigMetricCard
                    label="Sayfa Görüntüleme"
                    value={formatNum(pageViews)}
                    icon={Eye}
                    color="text-amber-400"
                    bgColor="bg-amber-500/10"
                />
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-3">
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#0C0C0E] border border-white/[0.06] rounded-2xl p-5"
                >
                    <div className="flex items-center gap-2 mb-3">
                        <MousePointerClick className="w-4 h-4 text-rose-400" />
                        <span className="text-xs text-zinc-500">Hemen Çıkma Oranı</span>
                    </div>
                    <p className="text-2xl font-bold text-white">%{sessions === 0 ? 0 : Math.min((pageViews / Math.max(sessions, 1)) * 50, 100).toFixed(0)}</p>
                    <div className="mt-3 h-2 bg-zinc-800 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-pink-500 to-rose-500 rounded-full transition-all"
                            style={{ width: `${Math.min((pageViews / Math.max(sessions, 1)) * 50, 100)}%` }}
                        />
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#0C0C0E] border border-white/[0.06] rounded-2xl p-5"
                >
                    <div className="flex items-center gap-2 mb-3">
                        <CheckCircle2 className="w-4 h-4 text-pink-400" />
                        <span className="text-xs text-zinc-500">Etkileşim Oranı</span>
                    </div>
                    <p className="text-2xl font-bold text-white">%{engagementRate}</p>
                    <div className="mt-3 h-2 bg-zinc-800 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-pink-500 to-pink-400 rounded-full transition-all"
                            style={{ width: `${Math.min(parseFloat(engagementRate), 100)}%` }}
                        />
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#0C0C0E] border border-white/[0.06] rounded-2xl p-5"
                >
                    <div className="flex items-center gap-2 mb-3">
                        <Clock className="w-4 h-4 text-purple-400" />
                        <span className="text-xs text-zinc-500">
                            Ortalama Oturum Süresi
                        </span>
                    </div>
                    <p className="text-2xl font-bold text-white">
                        {formatDuration(0)}
                    </p>
                    <p className="text-[11px] text-zinc-600 mt-2">
                        Kullanıcı başına {sessionsPerUser} oturum
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#0C0C0E] border border-white/[0.06] rounded-2xl p-5"
                >
                    <div className="flex items-center gap-2 mb-3">
                        <FileText className="w-4 h-4 text-amber-400" />
                        <span className="text-xs text-zinc-500">Sayfa / Oturum</span>
                    </div>
                    <p className="text-2xl font-bold text-white">
                        {sessions > 0
                            ? (pageViews / sessions).toFixed(2)
                            : '0'}
                    </p>
                    <p className="text-[11px] text-zinc-600 mt-2">
                        Oturum başına görüntülenen sayfa
                    </p>
                </motion.div>
            </div>
        </section>
    );
}
