import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { ChartTooltip, SectionHeader } from './SearchConsoleCards';
import type { ScDailyRow } from '../searchConsole.types';

interface SCDailyTrendChartProps {
    data: ScDailyRow[];
}

export function SCDailyTrendChart({ data }: SCDailyTrendChartProps) {
    return (
        <section>
            <SectionHeader icon={TrendingUp} title="Günlük Tıklama & Gösterim Trendi" color="bg-pink-500/20" />
            <div className="bg-[#0C0C0E] border border-white/[0.06] rounded-2xl p-6">
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data}>
                            <defs>
                                <linearGradient id="detailScClicks" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="detailScImpressions" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                            <XAxis dataKey="date" stroke="#52525b" tick={{ fontSize: 11, fill: '#71717a' }} />
                            <YAxis yAxisId="left" stroke="#52525b" tick={{ fontSize: 11, fill: '#71717a' }} />
                            <YAxis yAxisId="right" orientation="right" stroke="#52525b" tick={{ fontSize: 11, fill: '#71717a' }} />
                            <Tooltip content={<ChartTooltip />} />
                            <Legend verticalAlign="top" height={36}
                                formatter={(v: string) => <span className="text-xs text-zinc-400">{v}</span>} />
                            <Area yAxisId="left" type="monotone" dataKey="clicks" name="Tıklama" stroke="#3b82f6"
                                fill="url(#detailScClicks)" strokeWidth={2} dot={false} />
                            <Area yAxisId="right" type="monotone" dataKey="impressions" name="Gösterim" stroke="#10b981"
                                fill="url(#detailScImpressions)" strokeWidth={2} dot={false} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </section>
    );
}
