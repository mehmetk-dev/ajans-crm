import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    Building2, Users, ListTodo, CheckCircle2, Clock, TrendingUp,
    Activity, Target, Zap, BarChart3, AlertTriangle, Timer
} from 'lucide-react';
import {
    StatCard, AreaChartCard, BarChartCard, DonutChartCard, ProgressListCard
} from '../../components/analytics';
import { adminApi, type AdminAnalyticsResponse, type StaffAnalyticsResponse } from '../../api/admin';
import { companyApi, type StaffResponse } from '../../features/company';
import { UserAvatar } from '../../components/UserAvatar';

const CATEGORY_LABELS: Record<string, string> = {
    REELS: 'Reels', BLOG: 'Blog', PAYLASIM: 'Paylaşım', SEO: 'SEO',
    TASARIM: 'Tasarım', TOPLANTI: 'Toplantı', OTHER: 'Diğer',
};

export default function AdminAnalyticsPage() {
    const { data, isLoading, isError } = useQuery<AdminAnalyticsResponse>({
        queryKey: ['admin-analytics'],
        queryFn: () => adminApi.getAnalytics(),
    });

    const [selectedStaffId, setSelectedStaffId] = useState<string>('');

    const { data: staffList = [] } = useQuery<StaffResponse[]>({
        queryKey: ['admin-staff-list'],
        queryFn: () => companyApi.listStaff(),
    });

    const { data: staffAnalytics, isLoading: staffLoading } = useQuery<StaffAnalyticsResponse>({
        queryKey: ['admin-staff-analytics', selectedStaffId],
        queryFn: () => adminApi.getStaffAnalytics(selectedStaffId),
        enabled: Boolean(selectedStaffId),
    });

    if (isError) {
        return (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                Analitik verileri yüklenemedi.
            </div>
        );
    }

    if (isLoading || !data) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="animate-spin h-8 w-8 border-2 border-orange-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    const totalDist = data.taskDistribution.reduce((a, b) => a + b.value, 0);

    const stats = [
        { label: 'Toplam Şirket', value: data.totalCompanies, icon: Building2, color: 'text-blue-400', bgColor: 'bg-blue-500/10' },
        { label: 'Aktif Çalışan', value: data.totalStaff, icon: Users, color: 'text-pink-400', bgColor: 'bg-pink-500/10' },
        { label: 'Aylık Görev', value: data.monthlyTasks, icon: ListTodo, color: 'text-amber-400', bgColor: 'bg-amber-500/10' },
        { label: 'Tamamlanma Oranı', value: `%${data.completionRate}`, icon: CheckCircle2, color: 'text-green-400', bgColor: 'bg-green-500/10' },
        { label: 'Ortalama Süre', value: `${data.avgCompletionDays}g`, icon: Clock, color: 'text-cyan-400', bgColor: 'bg-cyan-500/10' },
        { label: 'Verimlilik', value: `%${data.efficiency}`, icon: Zap, color: 'text-orange-400', bgColor: 'bg-orange-500/10' },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Analitik</h1>
                    <p className="text-zinc-500 text-[13px] mt-1">Ajans performansı ve iş analitiği</p>
                </div>
                <div className="flex items-center gap-2 bg-[#0C0C0E] border border-white/[0.06] rounded-xl px-3 py-2">
                    <Activity className="w-4 h-4 text-orange-400" />
                    <span className="text-xs text-zinc-400">Güncel Veriler</span>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {stats.map((stat, i) => (
                    <StatCard key={stat.label} {...stat} delay={i} />
                ))}
            </div>

            {/* Main Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2">
                    <AreaChartCard
                        title="Aylık Görev Trendleri"
                        icon={TrendingUp}
                        iconColor="text-orange-400"
                        data={data.monthlyTrend}
                        dataKey="görevler"
                        secondaryDataKey="tamamlanan"
                        color="#3b82f6"
                        secondaryColor="#10b981"
                        gradientId="adminArea"
                    />
                </div>
                <DonutChartCard
                    title="Görev Dağılımı"
                    icon={Target}
                    iconColor="text-purple-400"
                    data={data.taskDistribution.map(d => ({
                        name: CATEGORY_LABELS[d.name] ?? d.name,
                        value: d.value,
                        color: d.color,
                    }))}
                    centerLabel="Toplam"
                    centerValue={totalDist}
                />
            </div>

            {/* Secondary Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <BarChartCard
                    title="Şirket Performansı"
                    icon={BarChart3}
                    iconColor="text-emerald-400"
                    data={data.companyPerformance}
                    dataKey="tamamlanan"
                    secondaryDataKey="görevler"
                    color="#10b981"
                    secondaryColor="rgba(59,130,246,0.4)"
                />
                {data.staffPerformance.length > 0 ? (
                    <ProgressListCard
                        title="Çalışan Performansı"
                        icon={Users}
                        iconColor="text-pink-400"
                        items={data.staffPerformance}
                    />
                ) : (
                    <div className="bg-[#0C0C0E] border border-white/[0.06] rounded-2xl p-6 flex flex-col items-center justify-center">
                        <Users className="w-8 h-8 text-zinc-700 mb-2" />
                        <p className="text-sm text-zinc-500">Henüz çalışan performans verisi yok</p>
                    </div>
                )}
            </div>

            {/* Staff Analytics Picker */}
            <StaffAnalyticsSection
                staffList={staffList}
                selectedStaffId={selectedStaffId}
                onSelect={setSelectedStaffId}
                data={staffAnalytics}
                loading={staffLoading}
            />
        </div>
    );
}

interface StaffAnalyticsSectionProps {
    staffList: StaffResponse[];
    selectedStaffId: string;
    onSelect: (id: string) => void;
    data?: StaffAnalyticsResponse;
    loading: boolean;
}

function StaffAnalyticsSection({ staffList, selectedStaffId, onSelect, data, loading }: StaffAnalyticsSectionProps) {
    const selectedStaff = staffList.find(s => s.id === selectedStaffId);

    return (
        <div className="space-y-4">
            <div className="bg-[#0C0C0E] border border-white/[0.06] rounded-2xl p-5">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-pink-400" />
                        <h2 className="text-base font-semibold text-white">Çalışan Analitiği</h2>
                    </div>
                    <select
                        value={selectedStaffId}
                        onChange={e => onSelect(e.target.value)}
                        className="px-4 py-2.5 bg-white/[0.04] border border-white/[0.06] rounded-xl text-sm text-white outline-none focus:border-orange-500/50 transition-colors min-w-[220px]"
                    >
                        <option value="">Çalışan seçiniz...</option>
                        {staffList.map(s => (
                            <option key={s.id} value={s.id}>{s.fullName}</option>
                        ))}
                    </select>
                </div>
            </div>

            {!selectedStaffId ? (
                <div className="bg-[#0C0C0E] border border-white/[0.06] rounded-2xl p-12 flex flex-col items-center justify-center text-center">
                    <Users className="w-10 h-10 text-zinc-700 mb-3" />
                    <p className="text-zinc-500 text-sm">Detaylı analitik için bir çalışan seçin</p>
                </div>
            ) : loading || !data ? (
                <div className="flex items-center justify-center py-16">
                    <div className="animate-spin h-7 w-7 border-2 border-pink-400 border-t-transparent rounded-full" />
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="flex items-center gap-3 bg-[#0C0C0E] border border-white/[0.06] rounded-2xl p-4">
                        {selectedStaff && (
                            <UserAvatar
                                name={selectedStaff.fullName}
                                avatarUrl={selectedStaff.avatarUrl}
                                className="h-10 w-10 rounded-xl text-xs"
                                fallbackClassName="bg-pink-500/10 text-pink-400"
                            />
                        )}
                        <div>
                            <p className="text-white font-semibold text-sm">{selectedStaff?.fullName}</p>
                            <p className="text-zinc-500 text-xs">{selectedStaff?.position || selectedStaff?.email}</p>
                        </div>
                    </div>

                    <StaffStatsGrid data={data} />

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        <div className="lg:col-span-2">
                            <AreaChartCard
                                title="Haftalık Görev Akışı"
                                icon={TrendingUp}
                                iconColor="text-pink-400"
                                data={data.weeklyFlow}
                                dataKey="tamamlanan"
                                secondaryDataKey="yeni"
                                color="#10b981"
                                secondaryColor="#3b82f6"
                                gradientId="adminStaffWeekly"
                            />
                        </div>
                        {data.companyTasks.length > 0 ? (
                            <ProgressListCard
                                title="Şirket Bazlı Görevler"
                                icon={Target}
                                iconColor="text-purple-400"
                                items={data.companyTasks}
                            />
                        ) : (
                            <div className="bg-[#0C0C0E] border border-white/[0.06] rounded-2xl p-6 flex flex-col items-center justify-center">
                                <Target className="w-8 h-8 text-zinc-700 mb-2" />
                                <p className="text-sm text-zinc-500">Şirket bazlı görev yok</p>
                            </div>
                        )}
                    </div>

                    <BarChartCard
                        title="Aylık Çalışma Saatleri"
                        icon={BarChart3}
                        iconColor="text-cyan-400"
                        data={data.monthlyHours}
                        dataKey="saat"
                        color="#06b6d4"
                    />
                </div>
            )}
        </div>
    );
}

function StaffStatsGrid({ data }: { data: StaffAnalyticsResponse }) {
    const hours = Math.floor(data.totalMinutesThisMonth / 60);
    const mins = data.totalMinutesThisMonth % 60;
    const items = [
        { label: 'Aktif Görevler', value: data.activeTasks, icon: ListTodo, color: 'text-blue-400', bgColor: 'bg-blue-500/10' },
        { label: 'Bu Hafta Tamamlanan', value: data.completedThisWeek, icon: CheckCircle2, color: 'text-pink-400', bgColor: 'bg-pink-500/10' },
        { label: 'Bekleyen', value: data.pendingTasks, icon: Clock, color: 'text-amber-400', bgColor: 'bg-amber-500/10' },
        { label: 'Tamamlanma Oranı', value: `%${data.completionRate}`, icon: TrendingUp, color: 'text-green-400', bgColor: 'bg-green-500/10' },
        { label: 'Bu Ay Çalışma', value: `${hours}s ${mins}d`, icon: Timer, color: 'text-cyan-400', bgColor: 'bg-cyan-500/10' },
        { label: 'Geciken', value: data.overdueTasks, icon: AlertTriangle, color: 'text-red-400', bgColor: 'bg-red-500/10' },
    ];
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {items.map((stat, i) => (
                <StatCard key={stat.label} {...stat} delay={i} />
            ))}
        </div>
    );
}
