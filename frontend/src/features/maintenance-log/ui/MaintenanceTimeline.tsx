import { motion } from 'framer-motion';
import { CheckCircle2, Clock, Loader2, Wrench } from 'lucide-react';
import { useMaintenanceLog } from '../hooks/useMaintenanceLog';
import { MAINTENANCE_CATEGORY_LABELS } from '../model/maintenanceLog.constants';
import { formatMaintenanceDate } from '../model/maintenanceLogDate';
import { UserAvatar } from '../../../components/UserAvatar';

interface Props {
    companyId?: string;
}

export function MaintenanceTimeline({ companyId }: Props) {
    const { data: entries = [], isLoading } = useMaintenanceLog(companyId);

    return (
        <div className="bg-[#0C0C0E] border border-white/[0.06] rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-[#F5BEC8]" />
                    <h3 className="text-sm font-semibold text-zinc-200">Bakım Günlüğü</h3>
                </div>
                {!isLoading && <span className="text-xs text-zinc-500">{entries.length} kayıt</span>}
            </div>
            {isLoading ? (
                <div className="flex justify-center py-8">
                    <Loader2 className="w-4 h-4 text-zinc-500 animate-spin" />
                </div>
            ) : entries.length === 0 ? (
                <p className="text-xs text-zinc-500 text-center py-8">Henüz bakım kaydı yok.</p>
            ) : (
                <div className="space-y-3">
                    {entries.map((entry, index) => (
                        <motion.div
                            key={entry.id}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.04 }}
                            className="flex gap-3 group"
                        >
                            <div className="flex flex-col items-center">
                                <div className="h-8 w-8 rounded-full bg-[#C8697A]/10 border border-[#C8697A]/20 flex items-center justify-center flex-shrink-0">
                                    <CheckCircle2 className="w-4 h-4 text-[#F5BEC8]" />
                                </div>
                                {index < entries.length - 1 && (
                                    <div className="w-px flex-1 bg-white/[0.04] mt-1" />
                                )}
                            </div>
                            <div className="flex-1 pb-3 min-w-0">
                                <div className="flex items-baseline justify-between gap-3 flex-wrap">
                                    <h4 className="text-sm font-semibold text-white">{entry.title}</h4>
                                    <span className="text-[11px] text-zinc-500 flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {formatMaintenanceDate(entry.performedAt)}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 mt-1 mb-1">
                                    <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/[0.04] text-zinc-400 border border-white/[0.04]">
                                        {MAINTENANCE_CATEGORY_LABELS[entry.category]}
                                    </span>
                                    {entry.performedByName && (
                                        <span className="text-[11px] text-zinc-500 flex items-center gap-1">
                                            <UserAvatar name={entry.performedByName} avatarUrl={entry.performedByAvatarUrl} className="h-4 w-4 rounded text-[8px]" />
                                            {entry.performedByName}
                                        </span>
                                    )}
                                </div>
                                {entry.description && (
                                    <p className="text-xs text-zinc-400 leading-relaxed">{entry.description}</p>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
