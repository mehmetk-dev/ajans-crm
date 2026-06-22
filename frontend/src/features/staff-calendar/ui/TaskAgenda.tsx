import type { TaskResponse } from '../../tasks';
import { Building2, User } from 'lucide-react';
import { UserAvatar } from '../../../components/UserAvatar';

interface TaskAgendaProps {
    tasks: TaskResponse[];
    onSelect: (task: TaskResponse) => void;
}

export function TaskAgenda({ tasks, onSelect }: TaskAgendaProps) {
    if (tasks.length === 0) return null;
    return (
        <section>
            <h4 className="text-xs font-bold text-pink-400 uppercase tracking-widest mb-2">
                Görevler ({tasks.length})
            </h4>
            <div className="space-y-2">
                {tasks.map(task => (
                    <button key={task.id} onClick={() => onSelect(task)}
                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.03] text-left">
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{task.title}</p>
                            <div className="flex flex-wrap gap-3 mt-1 text-[10px] text-zinc-500">
                                {task.companyName && <span className="flex items-center gap-1"><Building2 className="w-3 h-3" />{task.companyName}</span>}
                                <span className="flex items-center gap-1">
                                    {task.assignedToAvatarUrl ? (
                                        <UserAvatar name={task.assignedToName} avatarUrl={task.assignedToAvatarUrl} className="h-4 w-4 rounded text-[8px]" />
                                    ) : (
                                        <User className="w-3 h-3" />
                                    )}
                                    {task.assignedToName}
                                </span>
                            </div>
                        </div>
                        <span className="text-[9px] font-bold text-zinc-500">{task.status}</span>
                    </button>
                ))}
            </div>
        </section>
    );
}
