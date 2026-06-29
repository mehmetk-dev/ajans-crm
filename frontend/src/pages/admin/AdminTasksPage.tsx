import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ListTodo, CheckCircle2, Clock, Plus, Building2, User, Calendar, Trash2,
} from 'lucide-react';
import {
    effectiveTaskStatus,
    TaskCreateDialog,
    TaskDetailPanel,
    useDeleteTask,
    useStaffTasks,
    useUpdateTask,
    TASK_CATEGORY_LABELS,
    type TaskResponse,
    type TaskStatus,
} from '../../features/tasks';
import { useStaffCompanies } from '../../features/company';
import { UserAvatar } from '../../components/UserAvatar';

const statusBadge: Record<string, { bg: string; text: string; label: string }> = {
    TODO: { bg: 'bg-zinc-800', text: 'text-zinc-400', label: 'Bekliyor' },
    IN_PROGRESS: { bg: 'bg-blue-900/30', text: 'text-blue-400', label: 'Devam Ediyor' },
    DONE: { bg: 'bg-pink-900/30', text: 'text-pink-400', label: 'Tamamlandı' },
    OVERDUE: { bg: 'bg-red-900/30', text: 'text-red-400', label: 'Gecikmiş' },
};

function getRemainingTime(task: TaskResponse): { text: string; color: string } | null {
    if (task.status === 'DONE') return { text: 'Tamamlandı', color: 'text-pink-400' };
    const endDate = task.endDate;
    if (!endDate) return null;
    let end: Date;
    if (task.endTime) {
        const datePart = endDate.slice(0, 10);
        const timePart = task.endTime.length <= 5 ? task.endTime + ':00' : task.endTime;
        end = new Date(datePart + 'T' + timePart);
    } else {
        end = new Date(endDate);
    }
    if (isNaN(end.getTime())) return null;
    const now = new Date();
    const diffMs = end.getTime() - now.getTime();
    if (diffMs <= 0) return { text: 'Süre doldu', color: 'text-red-400' };
    const diffMin = Math.floor(diffMs / 60000);
    const diffHour = Math.floor(diffMs / 3600000);
    const diffDay = Math.floor(diffMs / 86400000);
    if (diffDay >= 1) return { text: `${diffDay} gün kaldı`, color: diffDay <= 2 ? 'text-amber-400' : 'text-zinc-400' };
    if (diffHour >= 1) return { text: `${diffHour} saat kaldı`, color: 'text-amber-400' };
    return { text: `${diffMin} dakika kaldı`, color: 'text-red-400' };
}

const formatDate = (d: string | null) => d ? new Date(d).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }) : null;

type SummaryTab = 'ALL' | 'IN_PROGRESS' | 'DONE';

export default function AdminTasksPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const initialStatus = (searchParams.get('status') as TaskStatus | null) ?? null;
    const [showForm, setShowForm] = useState(false);
    const [selectedTask, setSelectedTask] = useState<TaskResponse | null>(null);
    const [summaryTab, setSummaryTab] = useState<SummaryTab>(
        initialStatus === 'DONE' ? 'DONE' : initialStatus === 'IN_PROGRESS' ? 'IN_PROGRESS' : 'ALL'
    );
    const [companyFilter, setCompanyFilter] = useState<string>('ALL');

    const { data: taskPage, isLoading } = useStaffTasks('all');
    const { data: companies = [] } = useStaffCompanies();
    const updateTask = useUpdateTask();
    const deleteTask = useDeleteTask();
    const tasks = useMemo(() => taskPage?.content ?? [], [taskPage]);

    const counts = useMemo(() => {
        let total = 0, done = 0, inProgress = 0;
        for (const t of tasks) {
            const eff = effectiveTaskStatus(t);
            total++;
            if (eff === 'DONE') done++;
            if (eff === 'IN_PROGRESS') inProgress++;
        }
        return { total, done, inProgress };
    }, [tasks]);

    const filteredTasks = useMemo(() => {
        return tasks
            .filter(t => {
                const eff = effectiveTaskStatus(t);
                if (summaryTab === 'DONE' && eff !== 'DONE') return false;
                if (summaryTab === 'IN_PROGRESS' && eff !== 'IN_PROGRESS') return false;
                if (companyFilter !== 'ALL' && (t.companyId || '') !== companyFilter) return false;
                return true;
            })
            .sort((a, b) => {
                const getEndMs = (t: TaskResponse) => {
                    if (t.status === 'DONE') return t.completedAt ? new Date(t.completedAt).getTime() : Infinity;
                    if (!t.endDate) return Infinity;
                    const datePart = t.endDate.slice(0, 10);
                    const time = t.endTime && t.endTime.length > 5 ? t.endTime : (t.endTime || '23:59') + ':00';
                    const d = new Date(datePart + 'T' + time);
                    return isNaN(d.getTime()) ? Infinity : d.getTime();
                };
                return getEndMs(a) - getEndMs(b);
            });
    }, [tasks, summaryTab, companyFilter]);

    const handleStatusChange = async (taskId: string, status: TaskStatus) => {
        const updated = await updateTask.mutateAsync({ id: taskId, input: { status } });
        if (selectedTask?.id === taskId) setSelectedTask(updated);
    };

    const handleDelete = async (taskId: string) => {
        if (!confirm('Bu görevi silmek istediğinize emin misiniz?')) return;
        await deleteTask.mutateAsync(taskId);
        if (selectedTask?.id === taskId) setSelectedTask(null);
    };

    const summaryCards = [
        { label: 'Toplam Görev', value: counts.total, icon: ListTodo, color: 'text-amber-400', bgColor: 'bg-amber-500/10', tab: 'ALL' as const },
        { label: 'Devam Eden', value: counts.inProgress, icon: Clock, color: 'text-cyan-400', bgColor: 'bg-cyan-500/10', tab: 'IN_PROGRESS' as const },
        { label: 'Tamamlanan', value: counts.done, icon: CheckCircle2, color: 'text-green-400', bgColor: 'bg-green-500/10', tab: 'DONE' as const },
    ];

    const onSummaryClick = (tab: SummaryTab) => {
        setSummaryTab(tab);
        const statusParam = tab === 'DONE' ? 'DONE' : tab === 'IN_PROGRESS' ? 'IN_PROGRESS' : '';
        if (statusParam) setSearchParams({ status: statusParam }, { replace: true });
        else setSearchParams({}, { replace: true });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Görevler</h1>
                    <p className="text-zinc-500 text-[13px] mt-1">Tüm görevleri yönetin ve takip edin</p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 text-[13px] shadow-lg shadow-orange-500/20 transition-all"
                >
                    <Plus className="w-4 h-4" /> Yeni Görev
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {summaryCards.map((card, i) => (
                    <motion.button
                        key={card.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.06 }}
                        onClick={() => onSummaryClick(card.tab)}
                        className={`bg-[#0C0C0E] border p-5 rounded-2xl transition-all text-left ${
                            summaryTab === card.tab
                                ? 'border-orange-500/40 bg-orange-500/[0.04]'
                                : 'border-white/[0.06] hover:border-white/15'
                        }`}
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className={`h-9 w-9 rounded-xl ${card.bgColor} flex items-center justify-center`}>
                                <card.icon className={`w-[18px] h-[18px] ${card.color}`} />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-white">{card.value}</p>
                        <p className="text-zinc-500 text-[13px] mt-0.5">{card.label}</p>
                    </motion.button>
                ))}
            </div>

            {/* Filters */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
                <select
                    value={companyFilter}
                    onChange={e => setCompanyFilter(e.target.value)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#0C0C0E] border border-white/[0.06] text-zinc-400 outline-none focus:border-orange-500/50 transition-colors"
                >
                    <option value="ALL">Tüm Şirketler</option>
                    <option value="">Ajans İçi</option>
                    {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
            </div>

            {/* Task List */}
            {isLoading ? (
                <div className="text-center py-20 text-zinc-600">Yükleniyor...</div>
            ) : filteredTasks.length === 0 ? (
                <div className="text-center py-20 bg-[#0C0C0E]/80 border border-white/[0.06] rounded-2xl">
                    <ListTodo className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
                    <p className="text-zinc-500">Görev bulunamadı.</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {filteredTasks.map((task, i) => {
                        const sBadge = statusBadge[task.status] || statusBadge.TODO;
                        const remaining = getRemainingTime(task);
                        return (
                            <motion.div
                                key={task.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.03 }}
                                className="bg-[#0C0C0E] border border-white/[0.06] rounded-xl p-4 hover:border-orange-500/20 transition-colors group cursor-pointer"
                                onClick={() => setSelectedTask(task)}
                            >
                                <div className="flex items-start gap-4">
                                    <div className="w-1 h-14 rounded-full bg-gradient-to-b from-orange-500 to-amber-600" />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <p className="text-white font-medium text-sm">{task.title}</p>
                                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-500 uppercase font-bold">
                                                {TASK_CATEGORY_LABELS[task.category] || task.category}
                                            </span>
                                            {remaining && (
                                                <span className={`text-[9px] px-1.5 py-0.5 rounded bg-white/[0.04] font-bold ${remaining.color}`}>
                                                    ⏱ {remaining.text}
                                                </span>
                                            )}
                                        </div>
                                        {task.description && <p className="text-zinc-600 text-xs mt-1 line-clamp-1">{task.description}</p>}
                                        <div className="flex items-center gap-3 mt-2 flex-wrap">
                                            {task.companyName && (
                                                <span className="text-zinc-600 text-[11px] flex items-center gap-1">
                                                    <Building2 className="w-3 h-3" /> {task.companyName}
                                                </span>
                                            )}
                                            <span className="text-zinc-500 text-[11px] flex items-center gap-1">
                                                {task.assignedToAvatarUrl ? (
                                                    <UserAvatar name={task.assignedToName} avatarUrl={task.assignedToAvatarUrl} className="h-4 w-4 rounded text-[8px]" />
                                                ) : (
                                                    <User className="w-3 h-3" />
                                                )}
                                                {task.assignedToName}
                                            </span>
                                            {(task.startDate || task.endDate) && (
                                                <span className="text-zinc-600 text-[11px] flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {formatDate(task.startDate)}{task.startDate && task.endDate && ' → '}{formatDate(task.endDate)}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                                        <select
                                            value={task.status}
                                            onChange={e => handleStatusChange(task.id, e.target.value as TaskStatus)}
                                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border-0 cursor-pointer ${sBadge.bg} ${sBadge.text}`}
                                        >
                                            <option value="TODO">Bekliyor</option>
                                            <option value="IN_PROGRESS">Devam Ediyor</option>
                                            <option value="DONE">Tamamlandı</option>
                                        </select>
                                        <button
                                            onClick={() => handleDelete(task.id)}
                                            className="p-1.5 rounded-lg text-zinc-700 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            <TaskDetailPanel
                task={selectedTask}
                onClose={() => setSelectedTask(null)}
                onStatusChange={handleStatusChange}
            />

            <TaskCreateDialog
                open={showForm}
                companies={companies}
                onClose={() => setShowForm(false)}
            />
        </div>
    );
}
