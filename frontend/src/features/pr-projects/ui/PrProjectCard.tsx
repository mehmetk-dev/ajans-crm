import { Calendar, CheckCircle2, Clock, Rocket, User } from 'lucide-react';
import { motion } from 'framer-motion';
import type { PrProjectResponse } from '../api/prProject.types';
import { prProjectStatusMeta } from '../model/prProject.constants';
import { formatPrProjectDate } from '../model/prProject.utils';
import { UserAvatar } from '../../../components/UserAvatar';

interface PrProjectCardProps {
    project: PrProjectResponse;
    index: number;
    onClick: () => void;
}

export function PrProjectCard({ project, index, onClick }: PrProjectCardProps) {
    const status = prProjectStatusMeta[project.status];
    const completedCount = project.phases.filter(phase => phase.isCompleted).length;

    return (
        <motion.button
            type="button"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={onClick}
            className="text-left bg-[#0C0C0E] border border-white/[0.06] rounded-2xl p-6 hover:border-orange-500/20 transition-colors"
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="h-10 w-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 shrink-0">
                        <Rocket className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                        <h3 className="text-white font-bold truncate">{project.name}</h3>
                        <div className="flex items-center gap-2 mt-0.5">
                            {project.companyName && (
                                <span className="text-zinc-500 text-xs truncate">
                                    {project.companyName}
                                </span>
                            )}
                            {project.responsibleName && (
                                <span className="text-zinc-600 text-xs flex items-center gap-1 truncate">
                                    {project.responsibleAvatarUrl ? (
                                        <UserAvatar name={project.responsibleName} avatarUrl={project.responsibleAvatarUrl} className="h-4 w-4 rounded text-[8px]" />
                                    ) : (
                                        <User className="w-3 h-3" />
                                    )}
                                    {project.responsibleName}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                <span className={`px-2 py-1 rounded-lg text-[10px] font-bold shrink-0 ${status.className}`}>
                    {status.label}
                </span>
            </div>

            {project.purpose && (
                <p className="text-zinc-600 text-xs mt-3 line-clamp-2">
                    {project.purpose}
                </p>
            )}

            {(project.startDate || project.endDate) && (
                <div className="mt-2 flex items-center gap-2 text-[10px] text-zinc-600">
                    <Calendar className="w-3 h-3" />
                    {formatPrProjectDate(project.startDate)} -{' '}
                    {formatPrProjectDate(project.endDate) || '?'}
                </div>
            )}

            <div className="mt-4 space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                    <span>İlerleme {Number(project.progressPercent).toFixed(0)}%</span>
                    <span>{completedCount}/{project.phases.length} faz</span>
                </div>
                <div className="h-1.5 w-full bg-[#18181b] rounded-full overflow-hidden">
                    <div
                        className={`h-full ${project.status === 'COMPLETED' ? 'bg-pink-500' : 'bg-orange-500'}`}
                        style={{ width: `${project.progressPercent}%` }}
                    />
                </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-1.5">
                {project.phases.map(phase => (
                    <span
                        key={phase.id}
                        className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium ${
                            phase.isCompleted
                                ? 'bg-pink-500/10 text-pink-400'
                                : 'bg-[#18181b] text-zinc-500'
                        }`}
                    >
                        {phase.isCompleted
                            ? <CheckCircle2 className="w-2.5 h-2.5" />
                            : <Clock className="w-2.5 h-2.5" />}
                        {phase.name}
                    </span>
                ))}
            </div>
        </motion.button>
    );
}
