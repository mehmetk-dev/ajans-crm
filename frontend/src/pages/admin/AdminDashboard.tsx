import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../../api/admin';
import type { DashboardStats } from '../../api/admin';
import { motion } from 'framer-motion';
import {
    Activity,
    ArrowUpRight,
    Building2,
    CheckCircle2,
    Clock,
    Inbox,
    ListTodo,
    Plus,
    Users,
} from 'lucide-react';
import { getApiErrorMessage } from '../../lib/apiError';
import { TaskCreateDialog } from '../../features/tasks';
import { companyApi, type CompanyResponse } from '../../features/company';

export default function AdminDashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showTaskForm, setShowTaskForm] = useState(false);
    const [companies, setCompanies] = useState<CompanyResponse[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        adminApi.getStats()
            .then(setStats)
            .catch((err: unknown) => setError(getApiErrorMessage(err, 'Kontrol paneli verileri yüklenemedi')))
            .finally(() => setLoading(false));
        companyApi.listAdmin().then(setCompanies).catch((err: unknown) => console.error('Şirket listesi yüklenemedi', err));
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="h-8 w-8 border-2 border-zinc-800 border-t-orange-500 rounded-full animate-spin" />
            </div>
        );
    }

    if (error) {
        return <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>;
    }

    const totalTasks = stats?.totalTasks ?? 0;
    const doneTasks = stats?.doneTasks ?? 0;
    const inProgressTasks = stats?.inProgressTasks ?? 0;
    const todoTasks = stats?.todoTasks ?? 0;
    const completionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
    const activeCompanyRate = (stats?.totalCompanies ?? 0) > 0
        ? Math.round(((stats?.activeCompanies ?? 0) / (stats?.totalCompanies ?? 0)) * 100)
        : 0;
    const openWork = inProgressTasks + todoTasks;

    const cards = [
        {
            label: 'Toplam Şirket',
            value: stats?.totalCompanies ?? 0,
            sub: `${stats?.activeCompanies ?? 0} aktif şirket`,
            icon: Building2,
            color: 'text-sky-300',
            tint: 'from-sky-500/20 via-sky-500/5 to-transparent',
            border: 'hover:border-sky-400/30',
            to: '/admin/companies',
        },
        {
            label: 'Aktif Çalışan',
            value: stats?.totalStaff ?? 0,
            sub: 'Ajans ekibi',
            icon: Users,
            color: 'text-pink-300',
            tint: 'from-pink-500/20 via-pink-500/5 to-transparent',
            border: 'hover:border-pink-400/30',
            to: '/admin/staff',
        },
        {
            label: 'Toplam Görev',
            value: totalTasks,
            sub: `${openWork} açık iş`,
            icon: ListTodo,
            color: 'text-amber-300',
            tint: 'from-amber-500/20 via-amber-500/5 to-transparent',
            border: 'hover:border-amber-400/30',
            to: '/admin/tasks',
        },
        {
            label: 'Tamamlanan',
            value: doneTasks,
            sub: `%${completionRate} kapanış`,
            icon: CheckCircle2,
            color: 'text-emerald-300',
            tint: 'from-emerald-500/20 via-emerald-500/5 to-transparent',
            border: 'hover:border-emerald-400/30',
            to: '/admin/tasks?status=DONE',
        },
        {
            label: 'Devam Eden',
            value: inProgressTasks,
            sub: 'Aktif yürüyen işler',
            icon: Clock,
            color: 'text-cyan-300',
            tint: 'from-cyan-500/20 via-cyan-500/5 to-transparent',
            border: 'hover:border-cyan-400/30',
            to: '/admin/tasks?status=IN_PROGRESS',
        },
        {
            label: 'Beklenen İstekler',
            value: todoTasks,
            sub: 'Sıradaki aksiyonlar',
            icon: Inbox,
            color: 'text-orange-300',
            tint: 'from-orange-500/20 via-orange-500/5 to-transparent',
            border: 'hover:border-orange-400/30',
            to: '/admin/requests',
        },
    ];

    const quickActions = [
        { label: 'Yeni Şirket Ekle', icon: Building2, color: 'text-orange-400', onClick: () => navigate('/admin/companies?action=create') },
        { label: 'Yeni Çalışan Ekle', icon: Users, color: 'text-pink-400', onClick: () => navigate('/admin/staff?action=create') },
        { label: 'Görev Ekle', icon: Plus, color: 'text-amber-400', onClick: () => setShowTaskForm(true) },
        { label: 'İstekleri Gör', icon: Inbox, color: 'text-violet-400', onClick: () => navigate('/admin/requests') },
    ];

    return (
        <div className="space-y-6">
            <section className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0C0C0E]">
                <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(200,105,122,0.16),rgba(12,12,14,0)_42%),linear-gradient(180deg,rgba(255,255,255,0.055),rgba(255,255,255,0))]" />
                <div className="absolute inset-0 opacity-[0.18] [background-image:linear-gradient(rgba(255,255,255,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.08)_1px,transparent_1px)] [background-size:28px_28px]" />
                <div className="relative grid gap-6 p-6 lg:grid-cols-[1.4fr_0.9fr] lg:p-7">
                    <div className="space-y-6">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1.5">
                                    <Activity className="h-3.5 w-3.5 text-[#F5BEC8]" />
                                    <span className="text-[11px] font-medium text-zinc-400">Ajans operasyon özeti</span>
                                </div>
                                <h1 className="text-2xl font-bold tracking-tight text-white">Kontrol Paneli</h1>
                                <p className="mt-1 text-[13px] text-zinc-500">FOG İstanbul CRM genel bakış</p>
                            </div>
                            <button
                                onClick={() => navigate('/admin/analytics')}
                                className="hidden items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-[12px] font-medium text-zinc-300 transition-all hover:border-[#C8697A]/35 hover:bg-[#C8697A]/10 sm:flex"
                            >
                                Analitik
                                <ArrowUpRight className="h-3.5 w-3.5 text-[#F5BEC8]" />
                            </button>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-3">
                            <SummaryPill
                                label="Şirket aktifliği"
                                value={`%${activeCompanyRate}`}
                                width={activeCompanyRate}
                                tone="bg-sky-400"
                            />
                            <SummaryPill
                                label="Görev kapanışı"
                                value={`%${completionRate}`}
                                width={completionRate}
                                tone="bg-emerald-400"
                            />
                            <SummaryPill
                                label="Açık iş yükü"
                                value={openWork}
                                width={totalTasks > 0 ? Math.round((openWork / totalTasks) * 100) : 0}
                                tone="bg-amber-400"
                            />
                        </div>
                    </div>

                    <div className="rounded-2xl border border-white/[0.08] bg-black/20 p-4">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-sm font-semibold text-white">Hızlı İşlemler</h2>
                            <span className="rounded-full bg-white/[0.04] px-2 py-1 text-[10px] text-zinc-500">4 kısayol</span>
                        </div>
                        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
                            {quickActions.map(action => (
                                <button
                                    key={action.label}
                                    onClick={action.onClick}
                                    className="group flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-3 text-left transition-all hover:border-white/[0.14] hover:bg-white/[0.06]"
                                >
                                    <span className="flex min-w-0 items-center gap-3">
                                        <action.icon className={`h-[18px] w-[18px] shrink-0 ${action.color}`} />
                                        <span className="truncate text-[13px] text-zinc-300 group-hover:text-white">{action.label}</span>
                                    </span>
                                    <ArrowUpRight className="h-3.5 w-3.5 text-zinc-600 transition-colors group-hover:text-zinc-300" />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {cards.map((card, i) => {
                    const Icon = card.icon;
                    return (
                        <motion.button
                            key={card.label}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            onClick={() => navigate(card.to)}
                            className={`group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0C0C0E] p-5 text-left transition-all hover:-translate-y-0.5 hover:bg-white/[0.025] ${card.border}`}
                        >
                            <div className={`absolute inset-x-0 top-0 h-28 bg-gradient-to-br ${card.tint}`} />
                            <div className="relative flex items-start justify-between gap-4">
                                <div className="space-y-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.045]">
                                        <Icon className={`h-[18px] w-[18px] ${card.color}`} />
                                    </div>
                                    <div>
                                        <p className="text-3xl font-bold tracking-tight text-white">{card.value}</p>
                                        <p className="mt-1 text-[13px] font-medium text-zinc-300">{card.label}</p>
                                        <p className="mt-0.5 text-[11px] text-zinc-600">{card.sub}</p>
                                    </div>
                                </div>
                                <div className="rounded-full border border-white/[0.06] bg-black/20 p-2 text-zinc-600 transition-colors group-hover:text-zinc-300">
                                    <ArrowUpRight className="h-4 w-4" />
                                </div>
                            </div>
                        </motion.button>
                    );
                })}
            </div>

            <TaskCreateDialog
                open={showTaskForm}
                companies={companies}
                onClose={() => setShowTaskForm(false)}
            />
        </div>
    );
}

interface SummaryPillProps {
    label: string;
    value: string | number;
    width: number;
    tone: string;
}

function SummaryPill({ label, value, width, tone }: SummaryPillProps) {
    return (
        <div className="rounded-xl border border-white/[0.07] bg-white/[0.035] p-3">
            <div className="mb-2 flex items-center justify-between gap-3">
                <span className="text-[11px] text-zinc-500">{label}</span>
                <span className="text-sm font-semibold text-white">{value}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                <div
                    className={`h-full rounded-full ${tone}`}
                    style={{ width: `${Math.min(Math.max(width, 0), 100)}%` }}
                />
            </div>
        </div>
    );
}
