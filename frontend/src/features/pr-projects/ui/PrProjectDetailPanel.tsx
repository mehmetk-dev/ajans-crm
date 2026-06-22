import { useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Building2, Calendar, Rocket, Trash2, User, X } from 'lucide-react';
import type { PrProjectResponse } from '../api/prProject.types';
import {
    useAddPrPhaseNote,
    useCompletePrPhase,
    useDeletePrProject,
} from '../hooks/usePrProjects';
import { prProjectStatusMeta } from '../model/prProject.constants';
import { formatPrProjectDate } from '../model/prProject.utils';
import { PrPhaseCard } from './PrPhaseCard';
import { UserAvatar } from '../../../components/UserAvatar';

interface PrProjectDetailPanelProps {
    project: PrProjectResponse | null;
    onChange: (project: PrProjectResponse) => void;
    onClose: () => void;
}

export function PrProjectDetailPanel({
    project,
    onChange,
    onClose,
}: PrProjectDetailPanelProps) {
    const [expandedPhase, setExpandedPhase] = useState<string | null>(null);
    const completeMutation = useCompletePrPhase();
    const noteMutation = useAddPrPhaseNote();
    const deleteMutation = useDeletePrProject();

    const close = () => {
        setExpandedPhase(null);
        onClose();
    };

    return (
        <AnimatePresence>
            {project && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-end"
                    onClick={close}
                >
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        className="w-full max-w-xl bg-[#0c0c0e] border-l border-white/[0.06] h-full overflow-y-auto"
                        onClick={event => event.stopPropagation()}
                    >
                        <div className="sticky top-0 bg-[#0c0c0e]/95 border-b border-white/[0.06] p-5 z-10">
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="h-10 w-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                                        <Rocket className="w-5 h-5 text-orange-400" />
                                    </div>
                                    <div className="min-w-0">
                                        <h2 className="text-lg font-bold text-white truncate">
                                            {project.name}
                                        </h2>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                            prProjectStatusMeta[project.status].className
                                        }`}>
                                            {prProjectStatusMeta[project.status].label}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (confirm('Bu projeyi silmek istediğinize emin misiniz?')) {
                                                deleteMutation.mutate(project.id, { onSuccess: close });
                                            }
                                        }}
                                        className="p-1.5 rounded-lg text-zinc-600 hover:text-red-400"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={close}
                                        className="p-1.5 rounded-lg text-zinc-500 hover:text-white"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="p-5 space-y-5">
                            <div className="grid grid-cols-2 gap-3">
                                {project.responsibleName && (
                                    <InfoCard
                                        icon={<User className="w-4 h-4" />}
                                        label="Sorumlu"
                                        value={project.responsibleName}
                                        avatarUrl={project.responsibleAvatarUrl}
                                    />
                                )}
                                {project.companyName && (
                                    <InfoCard
                                        icon={<Building2 className="w-4 h-4" />}
                                        label="Şirket"
                                        value={project.companyName}
                                    />
                                )}
                                {project.startDate && (
                                    <InfoCard
                                        icon={<Calendar className="w-4 h-4" />}
                                        label="Başlangıç"
                                        value={formatPrProjectDate(project.startDate) || '-'}
                                    />
                                )}
                                {project.endDate && (
                                    <InfoCard
                                        icon={<Calendar className="w-4 h-4" />}
                                        label="Bitiş"
                                        value={formatPrProjectDate(project.endDate) || '-'}
                                    />
                                )}
                            </div>

                            {project.purpose && <TextBlock label="Amaç" value={project.purpose} />}
                            {project.notes && <TextBlock label="Notlar" value={project.notes} />}

                            <div>
                                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1.5">
                                    <span>İlerleme {Number(project.progressPercent).toFixed(0)}%</span>
                                    <span>
                                        {project.phases.filter(phase => phase.isCompleted).length}/
                                        {project.phases.length}
                                    </span>
                                </div>
                                <div className="h-2 bg-[#18181b] rounded-full overflow-hidden">
                                    <div
                                        className={project.status === 'COMPLETED'
                                            ? 'h-full bg-pink-500'
                                            : 'h-full bg-orange-500'}
                                        style={{ width: `${project.progressPercent}%` }}
                                    />
                                </div>
                            </div>

                            <div className="border-t border-white/[0.06] pt-5 space-y-2">
                                <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-3">
                                    Fazlar
                                </p>
                                {project.phases.map(phase => (
                                    <PrPhaseCard
                                        key={phase.id}
                                        phase={phase}
                                        projectStatus={project.status}
                                        expanded={expandedPhase === phase.id}
                                        pending={completeMutation.isPending || noteMutation.isPending}
                                        onToggle={() => setExpandedPhase(current =>
                                            current === phase.id ? null : phase.id)}
                                        onComplete={() => completeMutation.mutate({
                                            projectId: project.id,
                                            phaseId: phase.id,
                                        }, { onSuccess: onChange })}
                                        onAddNote={content => noteMutation.mutate({
                                            projectId: project.id,
                                            phaseId: phase.id,
                                            content,
                                        }, { onSuccess: onChange })}
                                    />
                                ))}
                            </div>

                            {project.members.length > 0 && (
                                <div className="border-t border-white/[0.06] pt-5">
                                    <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-3">
                                        Ekip
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {project.members.map(member => (
                                            <span
                                                key={member.userId}
                                                className="px-3 py-1.5 bg-[#0C0C0E] border border-white/[0.04] rounded-lg text-xs text-zinc-300 inline-flex items-center gap-2"
                                            >
                                                <UserAvatar name={member.fullName} avatarUrl={member.avatarUrl} className="h-5 w-5 rounded-md text-[9px]" />
                                                {member.fullName}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

function InfoCard({ icon, label, value, avatarUrl }: {
    icon: ReactNode;
    label: string;
    value: string;
    avatarUrl?: string | null;
}) {
    return (
        <div className="bg-[#0C0C0E] rounded-xl p-3 border border-white/[0.04]">
            <div className="flex items-center gap-1.5 text-zinc-600 mb-1">
                {icon}
                <span className="text-[10px] font-bold uppercase tracking-widest">
                    {label}
                </span>
            </div>
            <div className="flex items-center gap-2 min-w-0">
                {avatarUrl && <UserAvatar name={value} avatarUrl={avatarUrl} className="h-6 w-6 rounded-lg text-[10px]" />}
                <p className="text-sm text-white font-medium truncate">{value}</p>
            </div>
        </div>
    );
}

function TextBlock({ label, value }: { label: string; value: string }) {
    return (
        <div className="bg-[#0C0C0E] rounded-xl p-3 border border-white/[0.04]">
            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-1">
                {label}
            </p>
            <p className="text-sm text-zinc-300 whitespace-pre-wrap">{value}</p>
        </div>
    );
}
