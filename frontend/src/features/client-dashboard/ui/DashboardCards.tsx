import { Loader2 } from 'lucide-react';
import type { ReactNode } from 'react';

interface MetricCardProps {
    label: string;
    value: string;
    icon: React.ElementType;
    color: string;
}

const COLOR_MAP: Record<string, string> = {
    pink: 'from-pink-500/12 to-pink-500/3 border-pink-500/20 text-pink-400',
    violet: 'from-violet-500/12 to-violet-500/3 border-violet-500/20 text-violet-400',
    blue: 'from-blue-500/12 to-blue-500/3 border-blue-500/20 text-blue-400',
    emerald: 'from-emerald-500/12 to-emerald-500/3 border-emerald-500/20 text-emerald-400',
    amber: 'from-amber-500/12 to-amber-500/3 border-amber-500/20 text-amber-400',
    cyan: 'from-cyan-500/12 to-cyan-500/3 border-cyan-500/20 text-cyan-400',
};

export function MetricCard({ label, value, icon: Icon, color }: MetricCardProps) {
    const c = COLOR_MAP[color] || COLOR_MAP.violet;
    return (
        <div className={`rounded-xl border bg-gradient-to-br ${c} p-4`}>
            <Icon className="w-4 h-4 opacity-60 mb-2" />
            <p className="text-lg font-bold text-white">{value}</p>
            <p className="text-[10px] uppercase tracking-wider opacity-80 mt-0.5">{label}</p>
        </div>
    );
}

interface MiniStatProps {
    label: string;
    value: string;
    color: string;
}

export function MiniStat({ label, value, color }: MiniStatProps) {
    return (
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <p className={`text-lg font-bold ${color}`}>{value}</p>
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider mt-0.5">{label}</p>
        </div>
    );
}

interface ChartCardProps {
    title: string;
    subtitle?: string;
    children: ReactNode;
}

export function ChartCard({ title, subtitle, children }: ChartCardProps) {
    return (
        <div className="bg-[#0C0C0E] border border-white/[0.06] rounded-2xl p-5">
            <div className="mb-4">
                <h3 className="text-sm font-semibold text-white">{title}</h3>
                {subtitle && <p className="text-[11px] text-zinc-500">{subtitle}</p>}
            </div>
            {children}
        </div>
    );
}

interface ListCardProps {
    title: string;
    icon: React.ElementType;
    items?: { label: string; value: string }[];
}

export function ListCard({ title, icon: Icon, items }: ListCardProps) {
    return (
        <div className="bg-[#0C0C0E] border border-white/[0.06] rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
                <Icon className="w-4 h-4 text-zinc-500" />
                <h3 className="text-sm font-semibold text-white">{title}</h3>
            </div>
            {items && items.length > 0 ? (
                <div className="space-y-2">
                    {items.map((item, i) => (
                        <div key={i} className="flex items-center justify-between py-1.5 border-b border-white/[0.03] last:border-0">
                            <span className="text-[12px] text-zinc-400 truncate max-w-[70%]">{item.label}</span>
                            <span className="text-[12px] font-semibold text-white">{item.value}</span>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-[12px] text-zinc-600 text-center py-4">Veri yok</p>
            )}
        </div>
    );
}

interface QuickLinkProps {
    icon: React.ElementType;
    label: string;
    to: string;
    connected: boolean;
    navigate: (path: string) => void;
}

export function QuickLink({ icon: Icon, label, to, connected, navigate }: QuickLinkProps) {
    return (
        <button
            onClick={() => navigate(to)}
            aria-label={`${label} — ${connected ? 'Bağlı' : 'Bağlı değil'}`}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.12] hover:bg-white/[0.04] transition-all group"
        >
            <Icon className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors" />
            <span className="flex-1 text-left text-[12px] font-medium text-zinc-400 group-hover:text-white transition-colors">{label}</span>
            {connected ? (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
            )}
            <span className="text-zinc-600 group-hover:text-zinc-400 transition-colors">›</span>
        </button>
    );
}

interface EmptyStateProps {
    icon: React.ElementType;
    text: string;
    action?: () => void;
    actionLabel?: string;
    small?: boolean;
}

export function EmptyState({ icon: Icon, text, action, actionLabel, small }: EmptyStateProps) {
    return (
        <div className={`flex flex-col items-center justify-center ${small ? 'py-6' : 'py-12'} ${!small ? 'bg-[#0C0C0E] border border-white/[0.06] rounded-2xl' : ''}`}>
            <Icon className={`${small ? 'w-8 h-8' : 'w-10 h-10'} text-zinc-700 mb-2`} />
            <p className={`${small ? 'text-[11px]' : 'text-sm'} text-zinc-500 text-center max-w-xs`}>{text}</p>
            {action && actionLabel && (
                <button onClick={action} className="mt-3 px-4 py-2 rounded-xl text-[12px] font-semibold text-white bg-gradient-to-r from-[#D1181C] to-[#C8697A] hover:opacity-90 transition-opacity">
                    {actionLabel}
                </button>
            )}
        </div>
    );
}

interface LoadingSpinnerProps {
    className?: string;
}

export function DashboardLoader({ className }: LoadingSpinnerProps) {
    return (
        <div className={`flex items-center justify-center py-20 ${className ?? ''}`}>
            <Loader2 className="w-6 h-6 text-pink-400 animate-spin" />
        </div>
    );
}
