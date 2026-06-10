import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
    AlertTriangle,
    Calendar,
    Camera,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    XCircle,
} from 'lucide-react';
import {
    groupShoots,
    ShootCard,
    ShootDetailPanel,
    useClientShoots,
    type ShootDisplayStatus,
    type ShootResponse,
} from '../../features/shoots';

const tabs: { key: ShootDisplayStatus; label: string; icon: typeof Camera }[] = [
    { key: 'PLANNED', label: 'Planlanan', icon: Calendar },
    { key: 'OVERDUE', label: 'Gecikmiş', icon: AlertTriangle },
    { key: 'COMPLETED', label: 'Tamamlanan', icon: CheckCircle2 },
    { key: 'CANCELLED', label: 'İptal', icon: XCircle },
];

export default function ClientShootsPage() {
    const [params, setParams] = useSearchParams();
    const page = Math.max(0, Number(params.get('page') ?? 0));
    const requestedTab = params.get('tab') as ShootDisplayStatus | null;
    const activeTab = tabs.some(tab => tab.key === requestedTab) ? requestedTab! : 'PLANNED';
    const [selected, setSelected] = useState<ShootResponse | null>(null);
    const { data, isLoading } = useClientShoots(page, 50);
    const grouped = useMemo(() => groupShoots(data?.content ?? []), [data]);
    const shoots = grouped[activeTab];

    const setTab = (tab: ShootDisplayStatus) => setParams({ tab, page: '0' });
    const setPage = (nextPage: number) => setParams({ tab: activeTab, page: String(nextPage) });

    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-2xl font-black text-white tracking-tight">Çekimler</h1>
                <p className="text-zinc-600 text-sm mt-1">Şirketiniz için planlanan çekimler</p>
            </header>

            <div className="flex gap-2 overflow-x-auto pb-1">
                {tabs.map(tab => {
                    const Icon = tab.icon;
                    const active = tab.key === activeTab;
                    return (
                        <button key={tab.key} onClick={() => setTab(tab.key)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm ${
                                active
                                    ? 'bg-[#C8697A]/10 border-[#C8697A]/30 text-[#F5BEC8]'
                                    : 'border-white/[0.06] text-zinc-500 hover:text-zinc-300'
                            }`}>
                            <Icon className="w-4 h-4" />{tab.label}
                            <span className="text-[10px]">{grouped[tab.key].length}</span>
                        </button>
                    );
                })}
            </div>

            {isLoading ? (
                <div className="h-40 flex items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#C8697A] border-t-transparent" />
                </div>
            ) : shoots.length === 0 ? (
                <div className="bg-[#0C0C0E] border border-white/[0.06] rounded-2xl p-12 text-center">
                    <Camera className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
                    <p className="text-zinc-500">Bu kategoride çekim bulunmuyor.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {shoots.map(shoot => (
                        <ShootCard key={shoot.id} shoot={shoot} onClick={() => setSelected(shoot)} />
                    ))}
                </div>
            )}

            {(data?.totalPages ?? 0) > 1 && (
                <div className="flex justify-center items-center gap-3">
                    <button disabled={page === 0} onClick={() => setPage(page - 1)}
                        className="p-2 rounded-lg bg-white/[0.04] text-zinc-400 disabled:opacity-30">
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-xs text-zinc-500">{page + 1} / {data?.totalPages}</span>
                    <button disabled={page + 1 >= (data?.totalPages ?? 0)} onClick={() => setPage(page + 1)}
                        className="p-2 rounded-lg bg-white/[0.04] text-zinc-400 disabled:opacity-30">
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            )}

            <ShootDetailPanel shoot={selected} scope="client" onClose={() => setSelected(null)} />
        </div>
    );
}
