import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

// ─── ChartTooltip ─────────────────────────────────────────────────────────────

export function ChartTooltip({ active, payload, label }: {
    active?: boolean;
    payload?: Array<{ name: string; value: number; color: string }>;
    label?: string;
}) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-[#1e1e22] border border-white/[0.08] rounded-xl px-4 py-3 shadow-xl">
            <p className="text-xs text-zinc-400 mb-1.5">{label}</p>
            {payload.map((entry, i) => (
                <p key={i} className="text-sm font-semibold text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
                    {entry.name}: {entry.value?.toLocaleString('tr-TR')}
                </p>
            ))}
        </div>
    );
}

// ─── BigMetricCard ────────────────────────────────────────────────────────────

export function BigMetricCard({ label, value, icon: Icon, color, bgColor, sub, trend }: {
    label: string;
    value: string | number;
    icon: React.ElementType;
    color: string;
    bgColor: string;
    sub?: string;
    trend?: 'up' | 'down' | 'neutral';
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#0C0C0E] border border-white/[0.06] rounded-2xl p-5 hover:border-white/[0.1] transition-colors"
        >
            <div className="flex items-center justify-between mb-4">
                <div className={`h-10 w-10 rounded-xl ${bgColor} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${color}`} />
                </div>
                {trend && (
                    <div className={`flex items-center gap-1 text-xs font-medium ${
                        trend === 'up' ? 'text-pink-400' : trend === 'down' ? 'text-rose-400' : 'text-zinc-500'
                    }`}>
                        {trend === 'up' ? <ArrowUpRight className="w-3.5 h-3.5" /> :
                         trend === 'down' ? <ArrowDownRight className="w-3.5 h-3.5" /> : null}
                        {sub}
                    </div>
                )}
            </div>
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className="text-zinc-500 text-[13px] mt-1">{label}</p>
        </motion.div>
    );
}

// ─── MetricCard ───────────────────────────────────────────────────────────────

export function MetricCard({ label, value, icon: Icon, color, bgColor, sub }: {
    label: string;
    value: string | number;
    icon: React.ElementType;
    color: string;
    bgColor: string;
    sub?: string;
}) {
    return (
        <div className="bg-[#16161a] border border-white/[0.06] rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
                <div className={`h-8 w-8 rounded-lg ${bgColor} flex items-center justify-center`}>
                    <Icon className={`w-4 h-4 ${color}`} />
                </div>
                {sub && <span className="text-[11px] text-zinc-500">{sub}</span>}
            </div>
            <p className="text-xl font-bold text-white">{value}</p>
            <p className="text-zinc-500 text-[12px] mt-0.5">{label}</p>
        </div>
    );
}

// ─── SectionHeader ────────────────────────────────────────────────────────────

export function SectionHeader({ icon: Icon, title, color, children }: {
    icon: React.ElementType;
    title: string;
    color: string;
    children?: React.ReactNode;
}) {
    return (
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
                <div className={`h-8 w-8 rounded-lg ${color} flex items-center justify-center`}>
                    <Icon className="w-4 h-4 text-white/80" />
                </div>
                <h3 className="text-sm font-semibold text-white">{title}</h3>
            </div>
            {children}
        </div>
    );
}
