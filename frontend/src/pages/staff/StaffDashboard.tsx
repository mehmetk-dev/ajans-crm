import { useEffect, useState } from 'react';
import { staffApi } from '../../api/staff';
import type { TaskResponse } from '../../api/staff';
import { motion } from 'framer-motion';
import { ListTodo, Clock, CheckCircle2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import TaskDetailPanel from '../../components/TaskDetailPanel';
import { QuickNotes } from '../../features/notes';

const statusBadge: Record<string, { bg: string; text: string; label: string }> = {
    TODO: { bg: 'bg-zinc-800', text: 'text-zinc-400', label: 'Bekliyor' },
    IN_PROGRESS: { bg: 'bg-blue-900/30', text: 'text-blue-400', label: 'Devam Ediyor' },
    DONE: { bg: 'bg-pink-900/30', text: 'text-pink-400', label: 'Tamamlandı' },
    OVERDUE: { bg: 'bg-red-900/30', text: 'text-red-400', label: 'Gecikmiş' },
};

export default function StaffDashboard() {
    const [tasks, setTasks] = useState<TaskResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTask, setSelectedTask] = useState<TaskResponse | null>(null);

    const handleStatusChange = async (taskId: string, status: string) => {
        try {
            const updated = await staffApi.updateTask(taskId, { status });
            setTasks(prev => prev.map(t => t.id === taskId ? updated : t));
            if (selectedTask?.id === taskId) setSelectedTask(updated);
        } catch {
            // Existing task state remains visible when the update fails.
        }
    };

    useEffect(() => {
        staffApi.getMyTasks(0, 10)
            .then(data => setTasks(data.content))
            .catch(() => setTasks([]))
            .finally(() => setLoading(false));
    }, []);

    const todayTasks = tasks.filter(t => t.status !== 'DONE');
    const doneTasks = tasks.filter(t => t.status === 'DONE');

    const stats = [
        { icon: ListTodo, label: 'Aktif Görevler', value: todayTasks.length, color: 'from-blue-500 to-cyan-500' },
        { icon: CheckCircle2, label: 'Tamamlanan', value: doneTasks.length, color: 'from-pink-500 to-pink-500' },
        { icon: Clock, label: 'Toplam', value: tasks.length, color: 'from-violet-500 to-purple-500' },
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-white tracking-tight">Günlük Panel</h1>
                <p className="text-zinc-600 text-sm mt-1">
                    {new Date().toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-[#0C0C0E] border border-white/[0.06] rounded-2xl p-5"
                    >
                        <div className="flex items-center justify-between">
                            <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                                <stat.icon className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-2xl font-black text-white">{loading ? '—' : stat.value}</span>
                        </div>
                        <p className="text-zinc-500 text-xs font-semibold mt-3 uppercase tracking-wider">{stat.label}</p>
                    </motion.div>
                ))}
            </div>

            {/* Task List */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-white">Aktif Görevler</h2>
                    <Link to="/staff/tasks" className="text-pink-400 hover:text-pink-300 text-sm flex items-center gap-1 transition-colors">
                        Tümünü Gör <ArrowRight className="w-3 h-3" />
                    </Link>
                </div>

                {loading ? (
                    <div className="text-center py-12 text-zinc-600">Yükleniyor...</div>
                ) : todayTasks.length === 0 ? (
                    <div className="text-center py-12 bg-[#0C0C0E]/80 border border-white/[0.06] rounded-2xl">
                        <CheckCircle2 className="w-10 h-10 text-pink-500/50 mx-auto mb-3" />
                        <p className="text-zinc-500 text-sm">Aktif görev bulunmuyor.</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {todayTasks.map((task, i) => {
                            const badge = statusBadge[task.status] || statusBadge.TODO;
                            return (
                                <motion.div
                                    key={task.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    onClick={() => setSelectedTask(task)}
                                    className="bg-[#0C0C0E] border border-white/[0.06] rounded-xl p-4 flex items-center gap-4 hover:border-pink-500/20 transition-colors cursor-pointer"
                                >
                                    <div className={`w-1 h-10 rounded-full bg-gradient-to-b from-pink-500 to-pink-700`} />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white font-medium text-sm truncate">{task.title}</p>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="text-zinc-600 text-xs">{task.companyName}</span>
                                        </div>
                                    </div>
                                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${badge.bg} ${badge.text}`}>
                                        {badge.label}
                                    </span>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>

            <QuickNotes limit={20} title="Notlarim" accent="amber" />

            <TaskDetailPanel
                task={selectedTask}
                onClose={() => setSelectedTask(null)}
                onStatusChange={handleStatusChange}
            />
        </div>
    );
}
