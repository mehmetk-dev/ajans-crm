import { motion } from 'framer-motion';
import { Clock, Camera, Calendar, MapPin } from 'lucide-react';
import type { TaskResponse } from '../../tasks';
import type { ShootResponse } from '../../shoots';
import { STATUS_BADGE, isToday, isOverdue, formatDateShort, formatTime } from '../model/kanban.utils';

export function TaskMiniCard({ task, onClick }: { task: TaskResponse; onClick?: () => void }) {
    const badge = STATUS_BADGE[task.status] || STATUS_BADGE.TODO;
    const overdue = isOverdue(task);

    return (
        <div onClick={onClick} className={`flex items-center gap-3 bg-[#0C0C0E] border rounded-xl px-4 py-3 transition-colors cursor-pointer ${overdue ? 'border-red-500/20 hover:border-red-500/30' : 'border-white/[0.06] hover:border-pink-500/20'}`}>
            <div className={`w-1 h-8 rounded-full bg-gradient-to-b from-pink-500 to-pink-700`} />
            <div className="flex-1 min-w-0">
                <p className="text-sm text-white font-medium truncate">{task.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                    {task.companyName && <span className="text-[10px] text-zinc-600">{task.companyName}</span>}
                    {task.endDate && (
                        <span className={`text-[10px] flex items-center gap-0.5 ${overdue ? 'text-red-400' : 'text-zinc-600'}`}>
                            <Clock className="w-2.5 h-2.5" />
                            {formatDateShort(task.endDate)}
                        </span>
                    )}
                </div>
            </div>
            <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider ${badge.bg} ${badge.text}`}>
                {badge.label}
            </span>
        </div>
    );
}

export function ShootMiniCard({ shoot }: { shoot: ShootResponse }) {
    const isShootToday = isToday(shoot.shootDate);
    return (
        <div className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-colors ${isShootToday ? 'bg-blue-500/[0.06] border border-blue-500/20' : 'bg-white/[0.02] border border-white/[0.06]'}`}>
            <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${isShootToday ? 'bg-blue-500/15' : 'bg-white/[0.04]'}`}>
                <Camera className={`w-3.5 h-3.5 ${isShootToday ? 'text-blue-400' : 'text-zinc-500'}`} />
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                    <span className="text-sm text-white font-medium truncate">{shoot.title}</span>
                    {isShootToday && <span className="text-[9px] font-bold text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded-md">BUGÜN</span>}
                </div>
                <div className="flex items-center gap-2 mt-0.5 text-[10px] text-zinc-500">
                    <span className="flex items-center gap-0.5"><Calendar className="w-2.5 h-2.5" />{formatDateShort(shoot.shootDate)}{shoot.shootTime && ` · ${formatTime(shoot.shootTime)}`}</span>
                    {shoot.location && <span className="flex items-center gap-0.5"><MapPin className="w-2.5 h-2.5" />{shoot.location}</span>}
                </div>
            </div>
            <span className="text-[10px] text-zinc-600">{shoot.companyName}</span>
        </div>
    );
}

export function QuickStat({ icon, label, value, accent, delay = 0 }: {
    icon: React.ReactNode; label: string; value: string | number; accent: string; delay?: number;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            className="bg-[#0C0C0E] border border-white/[0.06] rounded-2xl p-5 hover:border-white/[0.10] transition-all duration-300"
        >
            <div className="flex items-center gap-3 mb-3">
                <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${accent}`}>
                    {icon}
                </div>
                <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">{label}</span>
            </div>
            <p className="text-2xl font-black text-white">{value}</p>
        </motion.div>
    );
}