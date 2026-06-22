import { Camera, ListTodo, Clock, MapPin, ChevronRight } from 'lucide-react';
import type { ShootResponse } from '../../shoots/api/shoot.types';
import type { TaskResponse } from '../../tasks/api/task.types';
import { UserAvatar } from '../../../components/UserAvatar';

interface ScheduleTabProps {
    upcomingShoots: (ShootResponse & { shootDate: string })[];
    activeTasks: TaskResponse[];
    navigate: (path: string) => void;
}

const TASK_STATUS_MAP: Record<string, { label: string; cls: string }> = {
    IN_PROGRESS: { label: 'Devam Ediyor', cls: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    PENDING: { label: 'Bekliyor', cls: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
    IN_REVIEW: { label: 'İncelemede', cls: 'bg-violet-500/10 text-violet-400 border-violet-500/20' },
};

export function ScheduleTab({ upcomingShoots, activeTasks, navigate }: ScheduleTabProps) {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-[#0C0C0E] border border-white/[0.06] rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Camera className="w-4 h-4 text-violet-400" />
                            <h3 className="text-sm font-semibold text-white">Yaklaşan Çekimler</h3>
                        </div>
                        <button onClick={() => navigate('/client/shoots')} className="text-[11px] text-zinc-500 hover:text-zinc-300 flex items-center gap-1">
                            Tümü <ChevronRight className="w-3 h-3" />
                        </button>
                    </div>
                    {upcomingShoots.length > 0 ? (
                        <div className="space-y-3">
                            {upcomingShoots.map((s) => {
                                const d = new Date(s.shootDate);
                                return (
                                    <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-violet-500/20 transition-all">
                                        <div className="shrink-0 w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex flex-col items-center justify-center">
                                            <span className="text-[9px] font-bold text-violet-400 uppercase">{d.toLocaleDateString('tr-TR', { month: 'short' }).replace('.', '')}</span>
                                            <span className="text-lg font-bold text-white leading-none">{d.getDate()}</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[13px] font-semibold text-white truncate">{s.title}</p>
                                            <div className="flex items-center gap-3 mt-1">
                                                {s.shootTime && <span className="text-[11px] text-zinc-500 flex items-center gap-1"><Clock className="w-3 h-3" />{s.shootTime.slice(0, 5)}</span>}
                                                {s.location && <span className="text-[11px] text-zinc-500 flex items-center gap-1 truncate"><MapPin className="w-3 h-3" />{s.location}</span>}
                                            </div>
                                        </div>
                                        <span className="shrink-0 text-[10px] font-semibold px-2.5 py-1 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20">Planlandı</span>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-[12px] text-zinc-600 text-center py-8">Yaklaşan çekim bulunmuyor</p>
                    )}
                </div>

                <div className="bg-[#0C0C0E] border border-white/[0.06] rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <ListTodo className="w-4 h-4 text-amber-400" />
                            <h3 className="text-sm font-semibold text-white">Aktif Görevler</h3>
                        </div>
                        <button onClick={() => navigate('/client/tasks')} className="text-[11px] text-zinc-500 hover:text-zinc-300 flex items-center gap-1">
                            Tümü <ChevronRight className="w-3 h-3" />
                        </button>
                    </div>
                    {activeTasks.length > 0 ? (
                        <div className="space-y-2.5">
                            {activeTasks.map((t) => {
                                const s = TASK_STATUS_MAP[t.status] || TASK_STATUS_MAP.PENDING;
                                return (
                                    <div key={t.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                                        <div className="shrink-0 w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                                            <ListTodo className="w-4 h-4 text-amber-400" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[13px] font-medium text-white truncate">{t.title}</p>
                                            {t.assignedToName && (
                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                    <UserAvatar name={t.assignedToName} avatarUrl={t.assignedToAvatarUrl} className="h-4 w-4 rounded text-[8px]" />
                                                    <p className="text-[10px] text-zinc-500 truncate">{t.assignedToName}</p>
                                                </div>
                                            )}
                                        </div>
                                        <span className={`shrink-0 text-[10px] font-semibold px-2.5 py-1 rounded-full border ${s.cls}`}>{s.label}</span>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-[12px] text-zinc-600 text-center py-8">Aktif görev bulunmuyor</p>
                    )}
                </div>
            </div>
        </div>
    );
}
