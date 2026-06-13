import { motion } from 'framer-motion';
import { BarChart3, Eye, MousePointerClick, Target, TrendingUp, Zap } from 'lucide-react';
import { BigMetricCard, SectionHeader } from './SearchConsoleCards';
import { formatNum, getPositionLabel } from '../model/searchConsole.utils';

interface SCOverviewSectionProps {
    totalClicks: number;
    totalImpressions: number;
    avgCtr: number;
    avgPosition: number;
    currentRangeDesc: string;
    clickThroughRate: string;
    topQueryCount: number;
}

export function SCOverviewSection({
    totalClicks,
    totalImpressions,
    avgCtr,
    avgPosition,
    currentRangeDesc,
    clickThroughRate,
    topQueryCount,
}: SCOverviewSectionProps) {
    return (
        <>
            <section>
                <SectionHeader icon={Zap} title="Genel Bakış" color="bg-pink-500/20">
                    <span className="text-[11px] text-zinc-500">{currentRangeDesc} özet veriler</span>
                </SectionHeader>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <BigMetricCard
                        label="Toplam Tıklama"
                        value={formatNum(totalClicks)}
                        icon={MousePointerClick}
                        color="text-[#F5BEC8]"
                        bgColor="bg-[#C8697A]/10"
                    />
                    <BigMetricCard
                        label="Toplam Gösterim"
                        value={formatNum(totalImpressions)}
                        icon={Eye}
                        color="text-pink-400"
                        bgColor="bg-pink-500/10"
                    />
                    <BigMetricCard
                        label="Ortalama TO (CTR)"
                        value={`%${avgCtr}`}
                        icon={TrendingUp}
                        color="text-amber-400"
                        bgColor="bg-amber-500/10"
                    />
                    <BigMetricCard
                        label="Ortalama Sıralama"
                        value={avgPosition}
                        icon={Target}
                        color="text-purple-400"
                        bgColor="bg-purple-500/10"
                    />
                </div>
            </section>

            <section>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                        className="bg-[#0C0C0E] border border-white/[0.06] rounded-2xl p-5">
                        <div className="flex items-center gap-2 mb-3">
                            <TrendingUp className="w-4 h-4 text-[#F5BEC8]" />
                            <span className="text-xs text-zinc-500">Tıklama Oranı (CTR)</span>
                        </div>
                        <p className="text-2xl font-bold text-white">%{avgCtr}</p>
                        <div className="mt-3 h-2 bg-zinc-800 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-[#D1181C] to-[#C8697A] rounded-full transition-all"
                                style={{ width: `${Math.min(avgCtr, 100)}%` }} />
                        </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                        className="bg-[#0C0C0E] border border-white/[0.06] rounded-2xl p-5">
                        <div className="flex items-center gap-2 mb-3">
                            <Target className="w-4 h-4 text-purple-400" />
                            <span className="text-xs text-zinc-500">Ortalama Pozisyon</span>
                        </div>
                        <p className="text-2xl font-bold text-white">{avgPosition}</p>
                        <p className="text-[11px] text-zinc-600 mt-2">
                            {getPositionLabel(avgPosition)}
                        </p>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                        className="bg-[#0C0C0E] border border-white/[0.06] rounded-2xl p-5">
                        <div className="flex items-center gap-2 mb-3">
                            <MousePointerClick className="w-4 h-4 text-amber-400" />
                            <span className="text-xs text-zinc-500">Tıklama / Gösterim</span>
                        </div>
                        <p className="text-2xl font-bold text-white">
                            {clickThroughRate}
                        </p>
                        <p className="text-[11px] text-zinc-600 mt-2">Gerçek tıklama oranı</p>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                        className="bg-[#0C0C0E] border border-white/[0.06] rounded-2xl p-5">
                        <div className="flex items-center gap-2 mb-3">
                            <BarChart3 className="w-4 h-4 text-pink-400" />
                            <span className="text-xs text-zinc-500">Sorgu Sayısı</span>
                        </div>
                        <p className="text-2xl font-bold text-white">{topQueryCount}</p>
                        <p className="text-[11px] text-zinc-600 mt-2">Üst sıralardaki sorgular</p>
                    </motion.div>
                </div>
            </section>
        </>
    );
}
