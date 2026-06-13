import { motion } from 'framer-motion';
import { BarChart3, FileText } from 'lucide-react';
import { SectionHeader } from './GoogleAnalyticsCards';
import { formatNum } from '../model/googleAnalytics.utils';
import type { GaNamedMetric } from '../googleAnalytics.types';

interface GATopPagesSectionProps {
    pages: GaNamedMetric[];
    totalPages: number;
    maxPageViews: number;
}

export function GATopPagesSection({ pages, totalPages, maxPageViews }: GATopPagesSectionProps) {
    return (
        <section>
            <SectionHeader
                icon={FileText}
                title="En Çok Ziyaret Edilen Sayfalar"
                color="bg-amber-500/20"
            >
                <span className="text-[11px] text-zinc-500">
                    Toplam {totalPages.toLocaleString('tr-TR')} sayfa görüntüleme
                </span>
            </SectionHeader>
            <div className="bg-[#0C0C0E] border border-white/[0.06] rounded-2xl p-6">
                {pages.length > 0 ? (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between px-1 text-[11px] text-zinc-500 uppercase tracking-wider">
                            <span>Sayfa Yolu</span>
                            <span>Görüntüleme</span>
                        </div>
                        {pages.map((page, i) => {
                            const pct = (page.value / Math.max(maxPageViews, 1)) * 100;
                            return (
                                <motion.div
                                    key={page.name}
                                    initial={{ opacity: 0, x: -8 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="relative"
                                >
                                    <div className="absolute inset-0 rounded-xl overflow-hidden">
                                        <div
                                            className="h-full bg-[#C8697A]/[0.10] rounded-xl transition-all duration-500"
                                            style={{ width: `${pct}%` }}
                                        />
                                    </div>
                                    <div className="relative flex items-center justify-between px-4 py-3">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <span className="text-zinc-600 text-xs font-mono w-5 flex-shrink-0">
                                                {i + 1}
                                            </span>
                                            <span
                                                className="text-sm text-zinc-200 truncate"
                                                title={page.name}
                                            >
                                                {page.name}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3 flex-shrink-0">
                                            <span className="text-sm font-semibold text-white">
                                                {page.value.toLocaleString('tr-TR')}
                                            </span>
                                            <span className="text-[11px] text-zinc-500 w-12 text-right">
                                                %
                                                {totalPages > 0
                                                    ? ((page.value / totalPages) * 100).toFixed(1)
                                                    : '0'}
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="h-32 flex items-center justify-center text-zinc-500 text-sm">
                        Sayfa verisi bulunamadı
                    </div>
                )}
            </div>
        </section>
    );
}

interface GASummarySectionProps {
    totalUsers: number;
    newUsers: number;
    sessions: number;
    pageViews: number;
    sourceCount: number;
    countryCount: number;
    pageCount: number;
    engagementRate: string;
    sessionsPerUser: string;
}

export function GASummarySection({
    totalUsers,
    newUsers,
    sessions,
    pageViews,
    sourceCount,
    countryCount,
    pageCount,
    engagementRate,
    sessionsPerUser,
}: GASummarySectionProps) {
    const returningUsers = totalUsers - newUsers;
    const returningPct = totalUsers > 0 ? (returningUsers / totalUsers) * 100 : 0;
    const newPct = totalUsers > 0 ? (newUsers / totalUsers) * 100 : 0;
    const pagesPerSession = sessions > 0 ? (pageViews / sessions).toFixed(2) : '0';

    return (
        <section>
            <SectionHeader
                icon={BarChart3}
                title="Performans Özeti"
                color="bg-pink-500/20"
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#0C0C0E] border border-white/[0.06] rounded-2xl p-5">
                    <h4 className="text-xs text-zinc-500 uppercase tracking-wider mb-4">
                        Kullanıcı Dağılımı
                    </h4>
                    <div className="space-y-3">
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-zinc-400">Mevcut Kullanıcı</span>
                                <span className="text-white font-semibold">
                                    {formatNum(returningUsers)}
                                </span>
                            </div>
                            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-[#C8697A] rounded-full"
                                    style={{ width: `${returningPct}%` }}
                                />
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-zinc-400">Yeni Kullanıcı</span>
                                <span className="text-white font-semibold">
                                    {formatNum(newUsers)}
                                </span>
                            </div>
                            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-pink-500 rounded-full"
                                    style={{ width: `${newPct}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-[#0C0C0E] border border-white/[0.06] rounded-2xl p-5 flex flex-col items-center justify-center">
                    <h4 className="text-xs text-zinc-500 uppercase tracking-wider mb-4">
                        Etkileşim Skoru
                    </h4>
                    <div className="relative w-32 h-32">
                        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                            <circle
                                cx="50"
                                cy="50"
                                r="42"
                                fill="none"
                                stroke="#27272a"
                                strokeWidth="8"
                            />
                            <circle
                                cx="50"
                                cy="50"
                                r="42"
                                fill="none"
                                stroke="#10b981"
                                strokeWidth="8"
                                strokeLinecap="round"
                                strokeDasharray={`${parseFloat(engagementRate) * 2.64} 264`}
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-2xl font-bold text-white">
                                %{engagementRate}
                            </span>
                            <span className="text-[10px] text-zinc-500">Etkileşim</span>
                        </div>
                    </div>
                </div>

                <div className="bg-[#0C0C0E] border border-white/[0.06] rounded-2xl p-5">
                    <h4 className="text-xs text-zinc-500 uppercase tracking-wider mb-4">
                        Hızlı İstatistikler
                    </h4>
                    <div className="space-y-4">
                        <SummaryRow label="Sayfa / Oturum" value={pagesPerSession} />
                        <SummaryRow label="Oturum / Kullanıcı" value={sessionsPerUser} />
                        <SummaryRow label="Trafik Kaynağı Sayısı" value={String(sourceCount)} />
                        <SummaryRow label="Ülke Sayısı" value={String(countryCount)} />
                        <SummaryRow label="İzlenen Sayfa" value={String(pageCount)} />
                    </div>
                </div>
            </div>
        </section>
    );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-400">{label}</span>
            <span className="text-sm font-semibold text-white">{value}</span>
        </div>
    );
}
