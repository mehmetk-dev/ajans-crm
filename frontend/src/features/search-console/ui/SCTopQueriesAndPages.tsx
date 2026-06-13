import { motion } from 'framer-motion';
import { FileText, Search } from 'lucide-react';
import { SectionHeader } from './SearchConsoleCards';
import type { ScQueryRow, ScPageRow } from '../searchConsole.types';

interface SCTopQueriesTableProps {
    queries: ScQueryRow[];
}

export function SCTopQueriesTable({ queries }: SCTopQueriesTableProps) {
    return (
        <section>
            <SectionHeader icon={Search} title="En Çok Aranan Sorgular" color="bg-[#C8697A]/20" />
            <div className="bg-[#0C0C0E] border border-white/[0.06] rounded-2xl p-6">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/[0.06]">
                                <th className="text-left text-[11px] text-zinc-500 uppercase tracking-wider pb-3 pr-4">#</th>
                                <th className="text-left text-[11px] text-zinc-500 uppercase tracking-wider pb-3 pr-4">Sorgu</th>
                                <th className="text-right text-[11px] text-zinc-500 uppercase tracking-wider pb-3 pr-4">Tıklama</th>
                                <th className="text-right text-[11px] text-zinc-500 uppercase tracking-wider pb-3 pr-4">Gösterim</th>
                                <th className="text-right text-[11px] text-zinc-500 uppercase tracking-wider pb-3 pr-4">TO</th>
                                <th className="text-right text-[11px] text-zinc-500 uppercase tracking-wider pb-3">Sıra</th>
                            </tr>
                        </thead>
                        <tbody>
                            {queries.map((q, i) => (
                                <tr key={i} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                                    <td className="py-3 pr-4 text-xs text-zinc-500">{i + 1}</td>
                                    <td className="py-3 pr-4 text-sm text-zinc-200 max-w-[300px] truncate" title={q.query}>{q.query}</td>
                                    <td className="py-3 pr-4 text-sm text-[#F5BEC8] text-right font-medium">{q.clicks.toLocaleString('tr-TR')}</td>
                                    <td className="py-3 pr-4 text-sm text-zinc-400 text-right">{q.impressions.toLocaleString('tr-TR')}</td>
                                    <td className="py-3 pr-4 text-sm text-amber-400 text-right">%{(q.ctr * 100).toFixed(1)}</td>
                                    <td className="py-3 text-sm text-purple-400 text-right">{q.position}</td>
                                </tr>
                            ))}
                            {queries.length === 0 && (
                                <tr><td colSpan={6} className="py-8 text-center text-zinc-600 text-sm">Veri yok</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    );
}

interface SCTopPagesListProps {
    pages: ScPageRow[];
}

export function SCTopPagesList({ pages }: SCTopPagesListProps) {
    const maxClicks = pages[0]?.clicks || 1;
    return (
        <section>
            <SectionHeader icon={FileText} title="En Çok Trafik Alan Sayfalar" color="bg-cyan-500/20" />
            <div className="bg-[#0C0C0E] border border-white/[0.06] rounded-2xl p-6">
                <div className="space-y-3">
                    {pages.length === 0 && <p className="text-sm text-zinc-600 text-center py-6">Veri yok</p>}
                    {pages.map((p, i) => {
                        const pct = Math.round((p.clicks / maxClicks) * 100);
                        return (
                            <div key={i} className="group hover:bg-white/[0.02] rounded-xl p-3 -mx-3 transition-colors">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-zinc-200 truncate max-w-[50%]" title={p.page}>
                                        <span className="text-zinc-500 mr-2">{i + 1}.</span>
                                        {p.page}
                                    </span>
                                    <div className="flex items-center gap-4 text-xs">
                                        <span className="text-[#F5BEC8] font-medium">{p.clicks.toLocaleString('tr-TR')} tıklama</span>
                                        <span className="text-zinc-500">{p.impressions.toLocaleString('tr-TR')} gösterim</span>
                                        <span className="text-amber-400">TO: %{(p.ctr * 100).toFixed(1)}</span>
                                        <span className="text-purple-400">Sıra: {p.position}</span>
                                    </div>
                                </div>
                                <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${pct}%` }}
                                        transition={{ duration: 0.7, delay: i * 0.05 }}
                                        className="h-full rounded-full bg-cyan-500"
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
