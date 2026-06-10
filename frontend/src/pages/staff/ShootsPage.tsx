import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    AlertTriangle,
    Calendar,
    Camera,
    CheckCircle2,
    Plus,
    X,
    XCircle,
} from 'lucide-react';
import {
    groupShoots,
    ShootCard,
    ShootDetailPanel,
    ShootForm,
    useDeleteShoot,
    useStaffShoots,
    useUpdateShootStatus,
    type ShootDisplayStatus,
    type ShootResponse,
} from '../../features/shoots';
import { useAuth } from '../../store/AuthContext';

const tabs: { key: ShootDisplayStatus; label: string; icon: typeof Camera }[] = [
    { key: 'PLANNED', label: 'Planlanan', icon: Calendar },
    { key: 'OVERDUE', label: 'Gecikmiş', icon: AlertTriangle },
    { key: 'COMPLETED', label: 'Tamamlanan', icon: CheckCircle2 },
    { key: 'CANCELLED', label: 'İptal', icon: XCircle },
];

export default function ShootsPage() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<ShootDisplayStatus>('PLANNED');
    const [selected, setSelected] = useState<ShootResponse | null>(null);
    const [showCreate, setShowCreate] = useState(false);
    const { data, isLoading } = useStaffShoots(0, 100);
    const updateStatus = useUpdateShootStatus();
    const deleteShoot = useDeleteShoot();
    const grouped = useMemo(() => groupShoots(data?.content ?? []), [data]);
    const shoots = grouped[activeTab];

    const removeSelected = async () => {
        if (!selected || !window.confirm('Bu çekimi silmek istediğinizden emin misiniz?')) return;
        await deleteShoot.mutateAsync(selected.id);
        setSelected(null);
    };

    return (
        <div className="space-y-6">
            <header className="flex items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-black text-white tracking-tight">Çekim Takvimi</h1>
                    <p className="text-zinc-600 text-sm mt-1">Planlanan fotoğraf ve video çekimleri</p>
                </div>
                <button onClick={() => setShowCreate(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-violet-500 text-white rounded-xl text-sm font-semibold hover:bg-violet-600">
                    <Plus className="w-4 h-4" /> Yeni Çekim
                </button>
            </header>

            <div className="flex gap-2 overflow-x-auto pb-1">
                {tabs.map(tab => {
                    const Icon = tab.icon;
                    const active = activeTab === tab.key;
                    return (
                        <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium ${
                                active
                                    ? 'bg-violet-500/10 border-violet-500/30 text-violet-400'
                                    : 'bg-white/[0.02] border-white/[0.06] text-zinc-500 hover:text-zinc-300'
                            }`}>
                            <Icon className="w-4 h-4" /> {tab.label}
                            <span className="text-[10px] px-1.5 py-0.5 bg-white/[0.05] rounded-full">
                                {grouped[tab.key].length}
                            </span>
                        </button>
                    );
                })}
            </div>

            {isLoading ? (
                <div className="h-40 flex items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-400 border-t-transparent" />
                </div>
            ) : shoots.length === 0 ? (
                <div className="bg-[#0C0C0E] border border-white/[0.06] rounded-2xl p-12 text-center">
                    <Camera className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-white">Bu kategoride çekim yok</h3>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {shoots.map(shoot => (
                        <ShootCard key={shoot.id} shoot={shoot} onClick={() => setSelected(shoot)} />
                    ))}
                </div>
            )}

            <ShootDetailPanel
                shoot={selected}
                scope="staff"
                canManage
                canDelete={user?.globalRole === 'ADMIN' || selected?.createdById === user?.id}
                onClose={() => setSelected(null)}
                onStatusChange={status => selected && updateStatus.mutate(
                    { id: selected.id, status },
                    { onSuccess: setSelected },
                )}
                onDelete={removeSelected}
            />

            <AnimatePresence>
                {showCreate && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm p-4 flex items-center justify-center"
                        onClick={() => setShowCreate(false)}>
                        <motion.div initial={{ scale: 0.96 }} animate={{ scale: 1 }} exit={{ scale: 0.96 }}
                            className="w-full max-w-xl max-h-[90vh] overflow-y-auto bg-[#0C0C0E] border border-white/[0.08] rounded-2xl"
                            onClick={event => event.stopPropagation()}>
                            <div className="sticky top-0 z-10 flex items-center justify-between p-5 bg-[#0C0C0E] border-b border-white/[0.06]">
                                <h2 className="text-lg font-bold text-white">Yeni Çekim</h2>
                                <button onClick={() => setShowCreate(false)} className="text-zinc-500 hover:text-white">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="p-5">
                                <ShootForm onSuccess={() => setShowCreate(false)} />
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
