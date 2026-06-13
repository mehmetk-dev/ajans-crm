import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { Globe, MapPin } from 'lucide-react';
import { ChartTooltip, SectionHeader } from './GoogleAnalyticsCards';
import type { SourcePieEntry, CountryBarEntry } from '../googleAnalytics.types';

interface GATrafficSourcesCardProps {
    data: SourcePieEntry[];
    totalSources: number;
}

export function GATrafficSourcesCard({ data, totalSources }: GATrafficSourcesCardProps) {
    return (
        <div className="bg-[#0C0C0E] border border-white/[0.06] rounded-2xl p-6">
            <SectionHeader icon={Globe} title="Trafik Kaynakları" color="bg-[#C8697A]/20" />
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={90}
                            paddingAngle={3}
                            strokeWidth={0}
                        >
                            {data.map((entry, i) => (
                                <Cell key={i} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip content={<ChartTooltip />} />
                        <Legend
                            verticalAlign="bottom"
                            height={36}
                            formatter={(v: string) => (
                                <span className="text-xs text-zinc-400">{v}</span>
                            )}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
                {data.map((s) => (
                    <div key={s.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span
                                className="w-2.5 h-2.5 rounded-full"
                                style={{ background: s.color }}
                            />
                            <span className="text-sm text-zinc-300">{s.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-semibold text-white">
                                {s.value.toLocaleString('tr-TR')}
                            </span>
                            <span className="text-xs text-zinc-500 w-12 text-right">
                                %
                                {totalSources > 0
                                    ? ((s.value / totalSources) * 100).toFixed(1)
                                    : '0'}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

interface GACountriesCardProps {
    data: CountryBarEntry[];
}

export function GACountriesCard({ data }: GACountriesCardProps) {
    if (data.length === 0) {
        return (
            <div className="bg-[#0C0C0E] border border-white/[0.06] rounded-2xl p-6">
                <SectionHeader
                    icon={MapPin}
                    title="Ziyaretçi Ülkeleri"
                    color="bg-purple-500/20"
                />
                <div className="h-64 flex items-center justify-center text-zinc-500 text-sm">
                    Ülke verisi bulunamadı
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#0C0C0E] border border-white/[0.06] rounded-2xl p-6">
            <SectionHeader
                icon={MapPin}
                title="Ziyaretçi Ülkeleri"
                color="bg-purple-500/20"
            />
            <div className="mt-4 space-y-2">
                {data.map((c, i) => (
                    <div
                        key={c.name}
                        className="flex items-center justify-between"
                    >
                        <div className="flex items-center gap-2">
                            <span className="text-zinc-500 text-xs font-mono w-5">
                                #{i + 1}
                            </span>
                            <span
                                className="w-2.5 h-2.5 rounded-full"
                                style={{ background: c.fill }}
                            />
                            <span className="text-sm text-zinc-300">{c.name}</span>
                        </div>
                        <span className="text-sm font-semibold text-white">
                            {c.value.toLocaleString('tr-TR')} oturum
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
