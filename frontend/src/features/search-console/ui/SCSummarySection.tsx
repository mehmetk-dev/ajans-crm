import { BarChart3 } from 'lucide-react';
import { formatNum } from '../model/searchConsole.utils';

interface SCSummarySectionProps {
    totalImpressions: number;
    totalClicks: number;
    avgPosition: number;
    avgCtr: number;
    topQuery: string | null;
}

export function SCSummarySection({
    totalImpressions,
    totalClicks,
    avgPosition,
    avgCtr,
    topQuery,
}: SCSummarySectionProps) {
    return (
        <section className="bg-pink-500/5 border border-pink-500/10 rounded-2xl p-6">
            <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-xl bg-pink-500/10 flex items-center justify-center flex-shrink-0">
                    <BarChart3 className="w-5 h-5 text-pink-400" />
                </div>
                <div>
                    <h3 className="text-sm font-semibold text-pink-300">Performans Özeti</h3>
                    <p className="text-xs text-zinc-500 mt-1">
                        Siteniz Google'da toplam <strong className="text-white">{formatNum(totalImpressions)}</strong> kez gösterildi
                        ve <strong className="text-white">{formatNum(totalClicks)}</strong> tıklama aldı.
                        Ortalama sıralama <strong className="text-white">{avgPosition}</strong>,
                        tıklama oranı <strong className="text-white">%{avgCtr}</strong>.
                        {topQuery && (
                            <> En çok tıklanan sorgu: <strong className="text-pink-400">"{topQuery}"</strong>.</>
                        )}
                    </p>
                </div>
            </div>
        </section>
    );
}
