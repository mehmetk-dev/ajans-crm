import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { ChartTooltip, SectionHeader } from './GoogleAnalyticsCards';
import type { GaDailyRow } from '../googleAnalytics.types';

interface GADailyTrendChartProps {
    data: GaDailyRow[];
}

export function GADailyTrendChart({ data }: GADailyTrendChartProps) {
    return (
        <section>
            <SectionHeader
                icon={TrendingUp}
                title="Günlük Oturum & Kullanıcı Trendi"
                color="bg-[#C8697A]/20"
            />
            <div className="bg-[#0C0C0E] border border-white/[0.06] rounded-2xl p-6">
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data}>
                            <defs>
                                <linearGradient id="detailOturum" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="detailKullanici" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                            <XAxis
                                dataKey="date"
                                stroke="#52525b"
                                tick={{ fontSize: 11, fill: '#71717a' }}
                                tickFormatter={(d: string) => {
                                    const parts = d.split('-');
                                    return parts.length === 3 ? `${parts[2]}/${parts[1]}` : d;
                                }}
                            />
                            <YAxis stroke="#52525b" tick={{ fontSize: 11, fill: '#71717a' }} />
                            <Tooltip content={<ChartTooltip />} />
                            <Legend
                                verticalAlign="top"
                                height={36}
                                formatter={(v: string) => (
                                    <span className="text-xs text-zinc-400">{v}</span>
                                )}
                            />
                            <Area
                                type="monotone"
                                dataKey="sessions"
                                name="Oturum"
                                stroke="#3b82f6"
                                fill="url(#detailOturum)"
                                strokeWidth={2}
                                dot={false}
                            />
                            <Area
                                type="monotone"
                                dataKey="users"
                                name="Kullanıcı"
                                stroke="#10b981"
                                fill="url(#detailKullanici)"
                                strokeWidth={2}
                                dot={false}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </section>
    );
}
