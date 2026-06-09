import { useState } from 'react';
import {
    effectiveTaskStatus,
    TaskCreateDialog,
    TaskDetailPanel,
    useDeleteTask,
    useStaffTasks,
    useUpdateTask,
    type TaskResponse,
    type TaskStatus,
} from '../../features/tasks';
import { useStaffCompanies } from '../../features/company';
import { motion } from 'framer-motion';
import { Plus, ListTodo, Filter, Clock, Trash2, ArrowUpDown, Building2, User, Calendar } from 'lucide-react';

const statusBadge: Record<string, { bg: string; text: string; label: string }> = {
    TODO: { bg: 'bg-zinc-800', text: 'text-zinc-400', label: 'Bekliyor' },
    IN_PROGRESS: { bg: 'bg-blue-900/30', text: 'text-blue-400', label: 'Devam Ediyor' },
    DONE: { bg: 'bg-pink-900/30', text: 'text-pink-400', label: 'Tamamlandı' },
    OVERDUE: { bg: 'bg-red-900/30', text: 'text-red-400', label: 'Gecikmiş' },
};


const categoryLabels: Record<string, string> = {
    REELS: 'Reels', BLOG: 'Blog', PAYLASIM: 'Paylaşım', SEO: 'SEO',
    TASARIM: 'Tasarım', TOPLANTI: 'Toplantı', OTHER: 'Diğer',
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

export default function TasksPage() {
    const [showForm, setShowForm] = useState(false);
    const [statusFilter, setStatusFilter] = useState<string>('ACTIVE');
    const [sortBy, setSortBy] = useState<'time' | 'company'>('time');
    const [showSortMenu, setShowSortMenu] = useState(false);
    const [companyFilter, setCompanyFilter] = useState<string>('ALL');
    const [selectedTask, setSelectedTask] = useState<TaskResponse | null>(null);
    const { data: taskPage, isLoading: tasksLoading } = useStaffTasks('all');
    const { data: companies = [], isLoading: companiesLoading } = useStaffCompanies();
    const updateTask = useUpdateTask();
    const deleteTask = useDeleteTask();
    const tasks = taskPage?.content ?? [];
    const loading = tasksLoading || companiesLoading;

    const handleStatusChange = async (taskId: string, status: TaskStatus) => {
        const updated = await updateTask.mutateAsync({ id: taskId, input: { status } });
        if (selectedTask?.id === taskId) setSelectedTask(updated);
    };

    const handleDelete = async (taskId: string) => {
        if (!confirm('Bu görevi silmek istediğinize emin misiniz?')) return;
        await deleteTask.mutateAsync(taskId);
        if (selectedTask?.id === taskId) setSelectedTask(null);
    };

    const filteredTasks = tasks
        .filter(t => {
            const eff = effectiveTaskStatus(t);
            if (statusFilter === 'ACTIVE' && eff === 'DONE') return false;
            if (statusFilter !== 'ALL' && statusFilter !== 'ACTIVE' && eff !== statusFilter) return false;
            if (companyFilter !== 'ALL' && (t.companyId || '') !== companyFilter) return false;
            return true;
        })
        .sort((a, b) => {
            if (sortBy === 'company') {
                return (a.companyName || 'zzz').localeCompare(b.companyName || 'zzz', 'tr');
            }
            // time: nearest deadline first, DONE tasks at bottom
            const getEndMs = (t: TaskResponse) => {
                if (t.status === 'DONE') return Infinity;
                if (!t.endDate) return Infinity;
                const datePart = t.endDate.slice(0, 10);
                const time = t.endTime && t.endTime.length > 5 ? t.endTime : (t.endTime || '23:59') + ':00';
                const d = new Date(datePart + 'T' + time);
                return isNaN(d.getTime()) ? Infinity : d.getTime();
            };
            const ea = getEndMs(a);
            const eb = getEndMs(b);
            return ea - eb;
        });

    const formatDate = (d: string | null) => d ? new Date(d).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }) : null;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-white tracking-tight">Görevler</h1>
                    <p className="text-zinc-600 text-sm mt-1">Tüm görevleri yönetin</p>
                </div>
                <button onClick={() => setShowForm(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-pink-600 hover:bg-pink-500 text-white rounded-xl text-sm font-semibold transition-colors">
                    <Plus className="w-4 h-4" /> Yeni Görev
                </button>
            </div>

            <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                    <Filter className="w-4 h-4 text-zinc-600" />
                    {['ACTIVE', 'TODO', 'IN_PROGRESS', 'DONE', 'OVERDUE', 'ALL'].map(s => (
                        <button key={s} onClick={() => setStatusFilter(s)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${statusFilter === s ? 'bg-pink-500/20 text-pink-400' : 'bg-[#0C0C0E] text-zinc-500 hover:text-zinc-300'}`}>
                            {s === 'ACTIVE' ? 'Görevlerim' : s === 'ALL' ? 'Tümü' : (statusBadge[s]?.label || s)}
                        </button>
                    ))}
                    <div className="w-px h-5 bg-white/[0.06] mx-1" />
                    <div className="relative">
                        <button onClick={() => setShowSortMenu(!showSortMenu)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#0C0C0E] text-zinc-400 hover:text-zinc-300 transition-all">
                            <ArrowUpDown className="w-3.5 h-3.5" />
                            {sortBy === 'time' ? 'Zamana Göre' : 'Şirkete Göre'}
                        </button>
                        {showSortMenu && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setShowSortMenu(false)} />
                                <div className="absolute top-full left-0 mt-1 z-20 bg-[#18181b] border border-white/[0.08] rounded-xl shadow-xl overflow-hidden min-w-[150px]">
                                    {([['time', 'Zamana Göre'], ['company', 'Şirkete Göre']] as const).map(([val, label]) => (
                                        <button key={val} onClick={() => { setSortBy(val); setShowSortMenu(false); }}
                                            className={`w-full text-left px-4 py-2.5 text-xs font-semibold transition-colors ${sortBy === val ? 'bg-blue-500/20 text-blue-400' : 'text-zinc-400 hover:bg-white/[0.04] hover:text-white'}`}>
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>
                <select value={companyFilter} onChange={e => setCompanyFilter(e.target.value)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#0C0C0E] border border-white/[0.06] text-zinc-400 outline-none focus:border-pink-500/50 transition-colors">
                    <option value="ALL">Tüm Şirketler</option>
                    <option value="">Ajans İçi</option>
                    {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
            </div>

            {loading ? (
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
                            <motion.div key={task.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                                className="bg-[#0C0C0E] border border-white/[0.06] rounded-xl p-4 hover:border-pink-500/20 transition-colors group cursor-pointer"
                                onClick={() => setSelectedTask(task)}>
                                <div className="flex items-start gap-4">
                                    <div className={`w-1 h-14 rounded-full bg-gradient-to-b from-pink-500 to-pink-700`} />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="text-white font-medium text-sm">{task.title}</p>
                                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-500 uppercase font-bold">
                                                {categoryLabels[task.category] || task.category}
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
                                                <User className="w-3 h-3" /> {task.assignedToName}
                                            </span>
                                            {(task.startDate || task.endDate) && (
                                                <span className="text-zinc-600 text-[11px] flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {formatDate(task.startDate)}{task.startDate && task.endDate && ' → '}{formatDate(task.endDate)}
                                                </span>
                                            )}
                                            {(task.startTime || task.endTime) && (
                                                <span className="text-zinc-600 text-[11px] flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {task.startTime?.slice(0,5)}{task.startTime && task.endTime && ' - '}{task.endTime?.slice(0,5)}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                                        <select value={task.status} onChange={e => handleStatusChange(task.id, e.target.value as TaskStatus)}
                                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border-0 cursor-pointer ${sBadge.bg} ${sBadge.text}`}>
                                            <option value="TODO">Bekliyor</option>
                                            <option value="IN_PROGRESS">Devam Ediyor</option>
                                            <option value="DONE">Tamamlandı</option>
                                        </select>
                                        <button onClick={() => handleDelete(task.id)}
                                            className="p-1.5 rounded-lg text-zinc-700 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all">
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
