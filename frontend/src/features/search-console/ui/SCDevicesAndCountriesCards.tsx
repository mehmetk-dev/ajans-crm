import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { MapPin, Monitor } from 'lucide-react';
import { ChartTooltip, SectionHeader } from './SearchConsoleCards';
import type { SearchConsolePieEntry, SearchConsoleBarEntry, ScNamedMetric } from '../searchConsole.types';

interface SCDevicesCardProps {
    data: SearchConsolePieEntry[];
}

export function SCDevicesCard({ data }: SCDevicesCardProps) {
    if (data.length === 0) {
        return (
            <div className="bg-[#0C0C0E] border border-white/[0.06] rounded-2xl p-6">
                <SectionHeader icon={Monitor} title="Cihaz Dağılımı" color="bg-[#C8697A]/20" />
                <div className="flex items-center justify-center h-40 text-zinc-600 text-sm">Veri yok</div>
            </div>
        );
    }

    const totalClicks = data.reduce((a, b) => a + b.value, 0);

    return (
        <div className="bg-[#0C0C0E] border border-white/[0.06] rounded-2xl p-6">
            <SectionHeader icon={Monitor} title="Cihaz Dağılımı" color="bg-[#C8697A]/20" />
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie data={data} dataKey="value" nameKey="name"
                            cx="50%" cy="50%" innerRadius={55} outerRadius={90}
                            paddingAngle={3} strokeWidth={0}>
                            {data.map((entry, i) => (
                                <Cell key={i} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip content={<ChartTooltip />} />
                        <Legend verticalAlign="bottom" height={36}
                            formatter={(v: string) => <span className="text-xs text-zinc-400">{v}</span>} />
                    </PieChart>
                </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
                {data.map((d) => (
                    <div key={d.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                            <span className="text-sm text-zinc-300">{d.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-semibold text-white">{d.value.toLocaleString('tr-TR')}</span>
                            <span className="text-xs text-zinc-500 w-12 text-right">
                                %{totalClicks > 0 ? ((d.value / totalClicks) * 100).toFixed(1) : '0'}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

interface SCCountriesCardProps {
    data: SearchConsoleBarEntry[];
    countries: ScNamedMetric[];
}

export function SCCountriesCard({ data, countries }: SCCountriesCardProps) {
    if (data.length === 0) {
        return (
            <div className="bg-[#0C0C0E] border border-white/[0.06] rounded-2xl p-6">
                <SectionHeader icon={MapPin} title="Ülkelere Göre Tıklamalar" color="bg-purple-500/20" />
                <div className="flex items-center justify-center h-40 text-zinc-600 text-sm">Veri yok</div>
            </div>
        );
    }

    const totalC = countries.reduce((a, b) => a + b.clicks, 0);

    return (
        <div className="bg-[#0C0C0E] border border-white/[0.06] rounded-2xl p-6">
            <SectionHeader icon={MapPin} title="Ülkelere Göre Tıklamalar" color="bg-purple-500/20" />
            <div className="mt-4 space-y-2">
                {countries.map((c) => (
                    <div key={c.name} className="flex items-center justify-between text-sm">
                        <span className="text-zinc-300">{c.name}</span>
                        <div className="flex items-center gap-3">
                            <span className="font-semibold text-white">{c.clicks.toLocaleString('tr-TR')} tıklama</span>
                            <span className="text-xs text-zinc-500">
                                %{totalC > 0 ? ((c.clicks / totalC) * 100).toFixed(1) : '0'}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
