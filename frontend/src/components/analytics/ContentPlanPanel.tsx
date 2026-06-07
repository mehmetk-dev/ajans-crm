import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FileText, Plus, X, ChevronDown, Instagram, Youtube,
    Globe, Linkedin, Twitter, Monitor, Smartphone, Loader2,
    Calendar, Edit3, Trash2,
    CheckCircle2, Clock, RotateCcw, Sparkles, Camera, MapPin
} from 'lucide-react';
import {
    contentPlanApi, clientContentPlanApi,
    type ContentPlanResponse, type CreateContentPlanRequest, type UpdateContentPlanRequest, type ApproveContentPlanRequest
} from '../../api/contentPlan';
import type { PageResponse, ShootResponse } from '../../api/staff';
import { clientApi } from '../../api/clientPanel';
import { staffApi } from '../../api/staff';

interface Props {
    companyId: string;
    readOnly?: boolean;
    limit?: number;
}

const PLATFORMS = [
    { value: 'INSTAGRAM', label: 'Instagram', icon: Instagram, color: 'text-pink-400', bg: 'bg-pink-500/10' },
    { value: 'TIKTOK', label: 'TikTok', icon: Smartphone, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
    { value: 'YOUTUBE', label: 'YouTube', icon: Youtube, color: 'text-red-400', bg: 'bg-red-500/10' },
    { value: 'FACEBOOK', label: 'Facebook', icon: Globe, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { value: 'LINKEDIN', label: 'LinkedIn', icon: Linkedin, color: 'text-sky-400', bg: 'bg-sky-500/10' },
    { value: 'TWITTER', label: 'Twitter', icon: Twitter, color: 'text-zinc-300', bg: 'bg-zinc-500/10' },
    { value: 'WEBSITE', label: 'Web Sitesi', icon: Monitor, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
];

const STATUSES: Record<string, { label: string; color: string; bg: string; icon: typeof Clock }> = {
    DRAFT: { label: 'Taslak', color: 'text-zinc-400', bg: 'bg-zinc-500/10', icon: FileText },
    WAITING_APPROVAL: { label: 'Onay Bekliyor', color: 'text-amber-400', bg: 'bg-amber-500/10', icon: Clock },
    REVISION: { label: 'Revize', color: 'text-orange-400', bg: 'bg-orange-500/10', icon: RotateCcw },
    APPROVED: { label: 'Onaylandı', color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: CheckCircle2 },
    PUBLISHED: { label: 'Yayınlandı', color: 'text-pink-400', bg: 'bg-pink-500/10', icon: Sparkles },
};

const SIZES = [
    '1080x1080', '1080x1350', '1080x1920', '1920x1080',
    '1200x628', '820x312', '500x500', 'Diğer'
];

function getPlatform(val: string) {
    return PLATFORMS.find(p => p.value === val) ?? PLATFORMS[0];
}

function getStatus(val: string) {
    return STATUSES[val] ?? STATUSES.DRAFT;
}

export default function ContentPlanPanel({ companyId, readOnly = false, limit }: Props) {
    const qc = useQueryClient();
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [filterStatus, setFilterStatus] = useState<string>('');
    const [showAll, setShowAll] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<ContentPlanResponse | null>(null);
    const [approveModal, setApproveModal] = useState<string | null>(null);
    const [shootDetailId, setShootDetailId] = useState<string | null>(null);

    const queryKey = ['content-plans', companyId, filterStatus];

    const { data, isLoading } = useQuery<PageResponse<ContentPlanResponse>>({
        queryKey,
        queryFn: () => readOnly
            ? clientContentPlanApi.getByCompany(companyId, filterStatus || undefined, 0, 50)
            : contentPlanApi.getByCompany(companyId, filterStatus || undefined, 0, 50),
    });

    const plans = data?.content ?? [];

    const createMut = useMutation({
        mutationFn: (d: CreateContentPlanRequest) => contentPlanApi.create(d),
        onSuccess: () => { qc.invalidateQueries({ queryKey }); setShowForm(false); },
    });

    const updateMut = useMutation({
        mutationFn: ({ id, data: d }: { id: string; data: UpdateContentPlanRequest }) => contentPlanApi.update(id, d),
        onSuccess: (updated) => {
            qc.invalidateQueries({ queryKey });
            setEditingId(null);
            if (selectedPlan?.id === updated.id) setSelectedPlan(updated);
        },
    });

    const deleteMut = useMutation({
        mutationFn: (id: string) => contentPlanApi.delete(id),
        onSuccess: () => { qc.invalidateQueries({ queryKey }); setSelectedPlan(null); },
    });

    const approveWithShootMut = useMutation({
        mutationFn: ({ id, data }: { id: string; data: ApproveContentPlanRequest }) => {
            const metadata = [
                data.shootTitle || '',
                data.shootDescription || '',
                data.shootDate || '',
                data.shootTime || '',
                data.location || '',
                '',
            ].join('||');
            return clientApi.createApprovalRequest({
                type: 'CONTENT_APPROVAL',
                referenceId: id,
                companyId,
                title: `İçerik Onayı: ${data.shootTitle}`,
                description: `Yeni çekim oluşturulması talep edildi`,
                metadata,
            });
        },
        onSuccess: () => { qc.invalidateQueries({ queryKey }); setApproveModal(null); alert('İsteğiniz yöneticiye iletildi!'); },
    });

    const approveExistingMut = useMutation({
        mutationFn: ({ id, shootId }: { id: string; shootId: string }) => {
            const metadata = ['', '', '', '', '', shootId].join('||');
            return clientApi.createApprovalRequest({
                type: 'CONTENT_APPROVAL',
                referenceId: id,
                companyId,
                title: `İçerik Onayı: Mevcut çekime bağlama`,
                description: `Mevcut bir çekime bağlanması talep edildi`,
                metadata,
            });
        },
        onSuccess: () => { qc.invalidateQueries({ queryKey }); setApproveModal(null); alert('İsteğiniz yöneticiye iletildi!'); },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: companyShootsData } = useQuery<any>({
        queryKey: ['company-shoots-for-content', companyId],
        queryFn: () => readOnly
            ? clientApi.getMyShoots(0, 50)
            : staffApi.getShootsByCompany(companyId, 0, 50),
        enabled: !!approveModal,
    });

    const existingShoots: ShootResponse[] = (companyShootsData?.content ?? []).filter((s: ShootResponse) => s.status === 'PLANNED');

    return (
        <>
        <div className="bg-[#0C0C0E] border border-white/[0.06] rounded-2xl p-5">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500/20 to-pink-500/20 flex items-center justify-center">
                        <FileText className="w-4 h-4 text-violet-400" />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-white">İçerik Planı</h3>
                        <p className="text-[11px] text-zinc-500">{plans.length} içerik</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <select
                            value={filterStatus}
                            onChange={e => setFilterStatus(e.target.value)}
                            className="appearance-none bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-1.5 pr-7 text-[11px] text-zinc-300 focus:outline-none focus:border-violet-500/50 cursor-pointer"
                        >
                            <option value="">Tümü</option>
                            {Object.entries(STATUSES).map(([k, v]) => (
                                <option key={k} value={k}>{v.label}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-500 pointer-events-none" />
                    </div>
                    {!readOnly && (
                        <button
                            onClick={() => { setShowForm(true); setEditingId(null); }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-400 text-[11px] font-medium hover:bg-violet-500/20 transition-all"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            Yeni
                        </button>
                    )}
                </div>
            </div>

            {/* Create Form */}
            <AnimatePresence>
                {showForm && !readOnly && (
                    <ContentForm
                        companyId={companyId}
                        onSubmit={d => createMut.mutate(d)}
                        onCancel={() => setShowForm(false)}
                        isLoading={createMut.isPending}
                    />
                )}
            </AnimatePresence>

            {isLoading && (
                <div className="flex items-center justify-center py-10">
                    <Loader2 className="w-5 h-5 text-violet-400 animate-spin" />
                </div>
            )}

            {!isLoading && plans.length === 0 && (
                <div className="text-center py-10">
                    <FileText className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
                    <p className="text-sm text-zinc-500">Henüz içerik planı eklenmemiş</p>
                    {!readOnly && (
                        <button onClick={() => setShowForm(true)} className="mt-3 text-[12px] text-violet-400 hover:text-violet-300 font-medium">
                            İlk içeriği ekle →
                        </button>
                    )}
                </div>
            )}

            {/* Compact Content List */}
            {(() => {
                const visiblePlans = limit && !showAll ? plans.slice(0, limit) : plans;
                const hiddenCount = limit ? plans.length - limit : 0;
                return (
                    <>
                        <div className="divide-y divide-white/[0.04]">
                            {visiblePlans.map(plan => {
                                const platform = getPlatform(plan.platform);
                                const status = getStatus(plan.status);
                                const StatusIcon = status.icon;
                                const PlatformIcon = platform.icon;

                                return (
                                    <button
                                        key={plan.id}
                                        onClick={() => setSelectedPlan(plan)}
                                        className="w-full flex items-center gap-3 py-2.5 px-1 text-left hover:bg-white/[0.02] rounded-lg transition-colors group"
                                    >
                                        <div className={`shrink-0 h-8 w-8 rounded-lg ${platform.bg} flex items-center justify-center`}>
                                            <PlatformIcon className={`w-3.5 h-3.5 ${platform.color}`} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[12px] font-medium text-white truncate group-hover:text-zinc-100">{plan.title}</p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-[10px] text-zinc-600">{plan.authorName}</span>
                                                {plan.plannedDate && (
                                                    <>
                                                        <span className="text-zinc-700">·</span>
                                                        <span className="text-[10px] text-zinc-600 flex items-center gap-0.5">
                                                            <Calendar className="w-2.5 h-2.5" />
                                                            {new Date(plan.plannedDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                                                        </span>
                                                    </>
                                                )}
                                                {plan.shootId && plan.status === 'APPROVED' && (
                                                    <>
                                                        <span className="text-zinc-700">·</span>
                                                        <span className="text-[10px] text-emerald-500 flex items-center gap-0.5">
                                                            <Camera className="w-2.5 h-2.5" />
                                                            Çekim var
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        <div className={`shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-full ${status.bg}`}>
                                            <StatusIcon className={`w-2.5 h-2.5 ${status.color}`} />
                                            <span className={`text-[9px] font-semibold ${status.color}`}>{status.label}</span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                        {limit && hiddenCount > 0 && (
                            <button
                                onClick={() => setShowAll(v => !v)}
                                className="mt-2 w-full text-center text-[11px] text-zinc-500 hover:text-zinc-300 py-1.5 border-t border-white/[0.04] transition-colors"
                            >
                                {showAll ? 'Daha az göster ↑' : `${hiddenCount} içerik daha göster ↓`}
                            </button>
                        )}
                    </>
                );
            })()}
        </div>

        {/* Detail Modal */}
        <AnimatePresence>
            {selectedPlan && (
                <ContentPlanDetailModal
                    plan={selectedPlan}
                    readOnly={readOnly}
                    companyId={companyId}
                    onClose={() => { setSelectedPlan(null); setEditingId(null); }}
                    onEdit={() => { setEditingId(selectedPlan.id); setSelectedPlan(null); }}
                    onDelete={() => deleteMut.mutate(selectedPlan.id)}
                    onStatusChange={(status, note) => updateMut.mutate({ id: selectedPlan.id, data: { status, revisionNote: note } })}
                    onApprove={() => setApproveModal(selectedPlan.id)}
                    onShootDetail={(id) => setShootDetailId(id)}
                    isUpdating={updateMut.isPending}
                    isDeleting={deleteMut.isPending}
                />
            )}
        </AnimatePresence>

        {/* Edit Form Modal */}
        <AnimatePresence>
            {editingId && !readOnly && (
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    onClick={() => setEditingId(null)}
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                        className="bg-[#0C0C0E] border border-white/[0.08] rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="p-5">
                            {plans.filter(p => p.id === editingId).map(plan => (
                                <ContentForm
                                    key={plan.id}
                                    companyId={companyId}
                                    initial={plan}
                                    onSubmit={d => updateMut.mutate({ id: plan.id, data: d })}
                                    onCancel={() => setEditingId(null)}
                                    isLoading={updateMut.isPending}
                                    isEdit
                                />
                            ))}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>

        {/* Shoot Detail Modal */}
        <AnimatePresence>
            {shootDetailId && (
                <ShootDetailModal
                    shootId={shootDetailId}
                    readOnly={readOnly}
                    onClose={() => setShootDetailId(null)}
                />
            )}
        </AnimatePresence>

        {/* Approve with Shoot Modal */}
        <AnimatePresence>
            {approveModal && (
                <ApproveWithShootModal
                    companyId={companyId}
                    existingShoots={existingShoots}
                    onClose={() => setApproveModal(null)}
                    onApprove={(reqData) => approveWithShootMut.mutate({ id: approveModal, data: reqData })}
                    onApproveExisting={(shootId) => approveExistingMut.mutate({ id: approveModal, shootId })}
                    isLoading={approveWithShootMut.isPending || approveExistingMut.isPending}
                />
            )}
        </AnimatePresence>
        </>
    );
}

/* ─── Content Plan Detail Modal ──────────────────────────── */

function ContentPlanDetailModal({
    plan, readOnly, onClose, onEdit, onDelete, onStatusChange, onApprove, onShootDetail, isUpdating, isDeleting,
}: {
    plan: ContentPlanResponse;
    readOnly: boolean;
    companyId: string;
    onClose: () => void;
    onEdit: () => void;
    onDelete: () => void;
    onStatusChange: (status: string, note?: string) => void;
    onApprove: () => void;
    onShootDetail: (id: string) => void;
    isUpdating: boolean;
    isDeleting: boolean;
}) {
    const platform = getPlatform(plan.platform);
    const status = getStatus(plan.status);
    const StatusIcon = status.icon;
    const PlatformIcon = platform.icon;

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
                transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                className="bg-[#0C0C0E] border border-white/[0.08] rounded-t-2xl sm:rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="sticky top-0 bg-[#0C0C0E]/95 backdrop-blur-sm border-b border-white/[0.06] px-5 py-4 z-10 flex items-start gap-3">
                    <div className={`shrink-0 h-10 w-10 rounded-xl ${platform.bg} flex items-center justify-center`}>
                        <PlatformIcon className={`w-5 h-5 ${platform.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h2 className="text-sm font-semibold text-white leading-snug">{plan.title}</h2>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${status.bg} ${status.color}`}>
                                <StatusIcon className="w-2.5 h-2.5" />
                                {status.label}
                            </span>
                            <span className={`text-[10px] ${platform.color}`}>{platform.label}</span>
                            {plan.contentSize && <span className="text-[10px] text-zinc-600">{plan.contentSize}</span>}
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-white/[0.06] transition-colors shrink-0">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="px-5 py-4 space-y-4">
                    {/* Meta grid */}
                    <div className="grid grid-cols-2 gap-2">
                        <div className="bg-white/[0.02] rounded-xl p-3">
                            <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mb-1">Yazar</p>
                            <p className="text-[12px] text-white font-medium">{plan.authorName}</p>
                        </div>
                        <div className="bg-white/[0.02] rounded-xl p-3">
                            <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mb-1">Platform</p>
                            <p className={`text-[12px] font-medium ${platform.color}`}>{platform.label}</p>
                        </div>
                        {plan.contentSize && (
                            <div className="bg-white/[0.02] rounded-xl p-3">
                                <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mb-1">Boyut</p>
                                <p className="text-[12px] text-white font-medium">{plan.contentSize}</p>
                            </div>
                        )}
                        {plan.plannedDate && (
                            <div className="bg-white/[0.02] rounded-xl p-3">
                                <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mb-1">Önerilen Çekim</p>
                                <p className="text-[12px] text-white font-medium">{new Date(plan.plannedDate).toLocaleDateString('tr-TR')}</p>
                            </div>
                        )}
                        {plan.speakerModel && (
                            <div className="bg-white/[0.02] rounded-xl p-3">
                                <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mb-1">Konuşmacı/Manken</p>
                                <p className="text-[12px] text-white font-medium">{plan.speakerModel}</p>
                            </div>
                        )}
                        {plan.companyName && (
                            <div className="bg-white/[0.02] rounded-xl p-3">
                                <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mb-1">Şirket</p>
                                <p className="text-[12px] text-white font-medium">{plan.companyName}</p>
                            </div>
                        )}
                    </div>

                    {/* Direction / Brief */}
                    {plan.direction && (
                        <div className="bg-white/[0.02] rounded-xl p-3">
                            <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mb-1.5">Yönlendirme / Brief</p>
                            <p className="text-[12px] text-zinc-300 leading-relaxed">{plan.direction}</p>
                        </div>
                    )}

                    {/* Description */}
                    {plan.description && (
                        <div className="bg-white/[0.02] rounded-xl p-3">
                            <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mb-1.5">Açıklama</p>
                            <p className="text-[12px] text-zinc-300 leading-relaxed">{plan.description}</p>
                        </div>
                    )}

                    {/* Revision note */}
                    {plan.revisionNote && (
                        <div className="bg-orange-500/5 border border-orange-500/15 rounded-xl p-3">
                            <p className="text-[9px] font-bold text-orange-400 uppercase tracking-widest mb-1.5">Revize Notu</p>
                            <p className="text-[12px] text-zinc-300 leading-relaxed">{plan.revisionNote}</p>
                        </div>
                    )}

                    {/* Linked shoot */}
                    {plan.shootId && plan.status !== 'WAITING_APPROVAL' && plan.status !== 'DRAFT' && plan.status !== 'REVISION' && (
                        <button
                            onClick={() => onShootDetail(plan.shootId!)}
                            className="w-full flex items-center gap-3 bg-emerald-500/5 border border-emerald-500/15 rounded-xl p-3 hover:bg-emerald-500/10 transition-colors text-left"
                        >
                            <Camera className="w-4 h-4 text-emerald-400 shrink-0" />
                            <div>
                                <p className="text-[9px] font-bold text-emerald-500/70 uppercase tracking-widest">Bağlı Çekim</p>
                                <p className="text-[12px] text-white font-medium mt-0.5">
                                    {plan.shootTitle || 'Çekim detayları'}
                                    {plan.shootDate && <span className="text-zinc-500 ml-2">· {new Date(plan.shootDate).toLocaleDateString('tr-TR')}</span>}
                                </p>
                            </div>
                            <ChevronDown className="-rotate-90 w-4 h-4 text-zinc-500 ml-auto" />
                        </button>
                    )}

                    {/* Meta footer */}
                    <p className="text-[9px] text-zinc-700">
                        {plan.createdByName && <>Oluşturan: {plan.createdByName} · </>}
                        {plan.createdAt && new Date(plan.createdAt).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>

                    {/* Actions */}
                    <div className="border-t border-white/[0.06] pt-4 space-y-2">
                        {/* Staff actions */}
                        {!readOnly && (
                            <div className="flex flex-wrap items-center gap-2">
                                {plan.status === 'DRAFT' && (
                                    <StatusButton label="Onaya Gönder" color="amber" onClick={() => onStatusChange('WAITING_APPROVAL')} />
                                )}
                                {plan.status === 'WAITING_APPROVAL' && (
                                    <>
                                        <StatusButton label="Onayla" color="emerald" onClick={() => onStatusChange('APPROVED')} />
                                        <StatusButton label="Revize Et" color="orange" onClick={() => {
                                            const note = prompt('Revize notu:');
                                            if (note) onStatusChange('REVISION', note);
                                        }} />
                                    </>
                                )}
                                {plan.status === 'REVISION' && (
                                    <StatusButton label="Tekrar Onaya Gönder" color="amber" onClick={() => onStatusChange('WAITING_APPROVAL')} />
                                )}
                                {plan.status === 'APPROVED' && (
                                    <StatusButton label="Yayınlandı İşaretle" color="pink" onClick={() => onStatusChange('PUBLISHED')} />
                                )}
                                <div className="flex-1" />
                                <button onClick={onEdit} className="p-1.5 rounded-lg hover:bg-white/[0.05] text-zinc-500 hover:text-violet-400 transition-colors" title="Düzenle">
                                    <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                    onClick={() => { if (confirm('Bu içerik planını silmek istediğinize emin misiniz?')) onDelete(); }}
                                    disabled={isDeleting}
                                    className="p-1.5 rounded-lg hover:bg-red-500/10 text-zinc-500 hover:text-red-400 transition-colors" title="Sil"
                                >
                                    {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                                </button>
                            </div>
                        )}

                        {/* Client actions */}
                        {readOnly && plan.status === 'WAITING_APPROVAL' && (
                            <div className="flex flex-wrap gap-2">
                                <StatusButton label="Onayla + Çekim Planla" color="emerald" onClick={onApprove} />
                                <StatusButton label="Revize İste" color="orange" onClick={() => {
                                    const note = prompt('Revize notu:');
                                    if (note) onStatusChange('REVISION', note);
                                }} />
                            </div>
                        )}

                        {isUpdating && (
                            <div className="flex items-center gap-2 text-[11px] text-zinc-500">
                                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Kaydediliyor...
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}


function StatusButton({ label, color, onClick }: { label: string; color: string; onClick: () => void }) {
    const colorMap: Record<string, string> = {
        amber: 'bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/20',
        emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20',
        orange: 'bg-orange-500/10 border-orange-500/20 text-orange-400 hover:bg-orange-500/20',
        pink: 'bg-pink-500/10 border-pink-500/20 text-pink-400 hover:bg-pink-500/20',
    };
    return (
        <button
            onClick={onClick}
            className={`px-3 py-1.5 rounded-lg border text-[11px] font-medium transition-all ${colorMap[color] ?? colorMap.amber}`}
        >
            {label}
        </button>
    );
}

/* ─── Content Form ────────────────────────────────────────── */

function ContentForm({
    companyId,
    initial,
    onSubmit,
    onCancel,
    isLoading,
    isEdit = false,
}: {
    companyId: string;
    initial?: ContentPlanResponse;
    onSubmit: (data: any) => void;
    onCancel: () => void;
    isLoading: boolean;
    isEdit?: boolean;
}) {
    const [title, setTitle] = useState(initial?.title ?? '');
    const [description, setDescription] = useState(initial?.description ?? '');
    const [authorName, setAuthorName] = useState(initial?.authorName ?? '');
    const [platform, setPlatform] = useState(initial?.platform ?? 'INSTAGRAM');
    const [contentSize, setContentSize] = useState(initial?.contentSize ?? '1080x1920');
    const [direction, setDirection] = useState(initial?.direction ?? '');
    const [speakerModel, setSpeakerModel] = useState(initial?.speakerModel ?? '');
    const [plannedDate, setPlannedDate] = useState(initial?.plannedDate ?? '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEdit) {
            onSubmit({ title, description, authorName, platform, contentSize, direction, speakerModel, plannedDate: plannedDate || undefined } as UpdateContentPlanRequest);
        } else {
            onSubmit({ companyId, title, description, authorName, platform, contentSize, direction, speakerModel, plannedDate: plannedDate || undefined } as CreateContentPlanRequest);
        }
    };

    return (
        <motion.form
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onSubmit={handleSubmit}
            className="mb-4 p-4 bg-[#111114] border border-violet-500/20 rounded-xl space-y-3"
        >
            <div className="flex items-center justify-between mb-1">
                <h4 className="text-[13px] font-semibold text-white">
                    {isEdit ? 'İçerik Düzenle' : 'Yeni İçerik Ekle'}
                </h4>
                <button type="button" onClick={onCancel} className="p-1 hover:bg-white/[0.05] rounded-lg text-zinc-500">
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* Title */}
            <div>
                <label className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1 block">İçerik Başlığı *</label>
                <input
                    required
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="Örn: Mayıs ayı tanıtım reels'i"
                    className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2 text-[12px] text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500/50"
                />
            </div>

            {/* Author + Platform */}
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1 block">Yazar *</label>
                    <input
                        required
                        value={authorName}
                        onChange={e => setAuthorName(e.target.value)}
                        placeholder="İçeriği hazırlayan"
                        className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2 text-[12px] text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500/50"
                    />
                </div>
                <div>
                    <label className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1 block">Platform *</label>
                    <select
                        value={platform}
                        onChange={e => setPlatform(e.target.value)}
                        className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2 text-[12px] text-white focus:outline-none focus:border-violet-500/50"
                    >
                        {PLATFORMS.map(p => (
                            <option key={p.value} value={p.value}>{p.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Size + Date */}
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1 block">Boyut</label>
                    <select
                        value={contentSize}
                        onChange={e => setContentSize(e.target.value)}
                        className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2 text-[12px] text-white focus:outline-none focus:border-violet-500/50"
                    >
                        {SIZES.map(s => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1 block">Önerilen Çekim Tarihi</label>
                    <input
                        type="date"
                        value={plannedDate}
                        onChange={e => setPlannedDate(e.target.value)}
                        className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2 text-[12px] text-white focus:outline-none focus:border-violet-500/50"
                    />
                </div>
            </div>

            {/* Direction */}
            <div>
                <label className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1 block">Yönlendirme / Brief</label>
                <textarea
                    value={direction}
                    onChange={e => setDirection(e.target.value)}
                    rows={2}
                    placeholder="İçerik yönlendirmesi / brief notları..."
                    className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2 text-[12px] text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500/50 resize-none"
                />
            </div>

            {/* Speaker / Model */}
            <div>
                <label className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1 block">Konuşmacı / Manken</label>
                <input
                    value={speakerModel}
                    onChange={e => setSpeakerModel(e.target.value)}
                    placeholder="İçerikte yer alacak kişi"
                    className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2 text-[12px] text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500/50"
                />
            </div>

            {/* Description */}
            <div>
                <label className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1 block">Açıklama</label>
                <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    rows={2}
                    placeholder="Detaylı açıklama..."
                    className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2 text-[12px] text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500/50 resize-none"
                />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-1">
                <button
                    type="submit"
                    disabled={isLoading || !title.trim() || !authorName.trim()}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-violet-500 text-white text-[12px] font-medium hover:bg-violet-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                    {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                    {isEdit ? 'Güncelle' : 'Ekle'}
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 rounded-lg border border-white/[0.08] text-[12px] text-zinc-400 hover:text-white hover:border-white/[0.15] transition-colors"
                >
                    İptal
                </button>
            </div>
        </motion.form>
    );
}

/* ─── Shoot Detail Modal ────────────────────────────────── */

function ShootDetailModal({ shootId, readOnly, onClose }: { shootId: string; readOnly: boolean; onClose: () => void }) {
    const { data: shoot, isLoading: shootLoading } = useQuery({
        queryKey: ['shoot-detail', shootId],
        queryFn: () => readOnly
            ? clientApi.getShootById(shootId)
            : staffApi.getShootById(shootId),
    });

    const { data: linkedContent } = useQuery<ContentPlanResponse[]>({
        queryKey: ['shoot-content', shootId],
        queryFn: () => contentPlanApi.getByShoot(shootId),
        enabled: !readOnly,
    });

    const formatDate = (d: string | null | undefined) => {
        if (!d) return '-';
        try { return new Date(d).toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' }); } catch { return '-'; }
    };

    const STATUS_MAP: Record<string, { label: string; cls: string }> = {
        PLANNED: { label: 'Planlandı', cls: 'bg-violet-500/10 text-violet-400' },
        COMPLETED: { label: 'Tamamlandı', cls: 'bg-emerald-500/10 text-emerald-400' },
        CANCELLED: { label: 'İptal', cls: 'bg-red-500/10 text-red-400' },
    };

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                transition={{ type: 'spring', duration: 0.3 }}
                className="bg-[#0C0C0E] border border-white/[0.08] rounded-2xl w-full max-w-lg shadow-2xl max-h-[85vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
            >
                {shootLoading || !shoot ? (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 className="w-6 h-6 text-violet-400 animate-spin" />
                    </div>
                ) : (
                    <>
                        {/* Header */}
                        <div className="sticky top-0 bg-[#0c0c0e]/95 backdrop-blur-sm border-b border-white/[0.06] p-5 z-10">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
                                        <Camera className="w-5 h-5 text-violet-400" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-white">{shoot.title}</h2>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${STATUS_MAP[shoot.status]?.cls ?? 'bg-zinc-500/10 text-zinc-400'}`}>
                                            {STATUS_MAP[shoot.status]?.label ?? shoot.status}
                                        </span>
                                    </div>
                                </div>
                                <button onClick={onClose} className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-white/5 transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="p-5 space-y-4">
                            {/* Info Grid */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-[#111114] rounded-xl p-3 border border-white/[0.04]">
                                    <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mb-1">Şirket</p>
                                    <p className="text-sm text-white font-medium">{shoot.companyName}</p>
                                </div>
                                {shoot.shootDate && (
                                    <div className="bg-[#111114] rounded-xl p-3 border border-white/[0.04]">
                                        <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mb-1">Tarih</p>
                                        <p className="text-sm text-white font-medium">{formatDate(shoot.shootDate)}</p>
                                    </div>
                                )}
                                {shoot.shootTime && (
                                    <div className="bg-[#111114] rounded-xl p-3 border border-white/[0.04]">
                                        <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mb-1">Saat</p>
                                        <p className="text-sm text-white font-medium">{shoot.shootTime}</p>
                                    </div>
                                )}
                                {shoot.location && (
                                    <div className="bg-[#111114] rounded-xl p-3 border border-white/[0.04]">
                                        <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mb-1">Lokasyon</p>
                                        <p className="text-sm text-white font-medium">{shoot.location}</p>
                                    </div>
                                )}
                                {shoot.photographerName && (
                                    <div className="bg-[#111114] rounded-xl p-3 border border-white/[0.04]">
                                        <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mb-1">Çekimci</p>
                                        <p className="text-sm text-white font-medium">{shoot.photographerName}</p>
                                    </div>
                                )}
                            </div>

                            {shoot.description && (
                                <div className="bg-[#111114] rounded-xl p-3 border border-white/[0.04]">
                                    <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mb-1">Açıklama</p>
                                    <p className="text-sm text-zinc-300">{shoot.description}</p>
                                </div>
                            )}

                            {/* Participants */}
                            {shoot.participants && shoot.participants.length > 0 && (
                                <div className="border-t border-white/[0.06] pt-4">
                                    <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mb-2">Katılımcılar</p>
                                    <div className="flex flex-wrap gap-2">
                                        {shoot.participants.map((p: { userId: string; fullName: string; roleInShoot: string | null }) => (
                                            <span key={p.userId} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#111114] border border-white/[0.04] rounded-lg text-xs text-zinc-300">
                                                <div className="h-5 w-5 rounded-full bg-violet-500/10 flex items-center justify-center text-[10px] font-bold text-violet-400">
                                                    {p.fullName.charAt(0)}
                                                </div>
                                                {p.fullName}{p.roleInShoot ? ` — ${p.roleInShoot}` : ''}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Equipment */}
                            {shoot.equipment && shoot.equipment.length > 0 && (
                                <div className="border-t border-white/[0.06] pt-4">
                                    <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mb-2">Ekipman</p>
                                    <div className="space-y-1">
                                        {shoot.equipment.map((eq: { id: string; name: string; quantity: number; notes: string | null }) => (
                                            <div key={eq.id} className="flex items-center justify-between bg-[#111114] rounded-lg px-3 py-2 border border-white/[0.04]">
                                                <span className="text-xs text-white">{eq.name}</span>
                                                <span className="text-[10px] text-zinc-500 font-mono">x{eq.quantity}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Linked Content */}
                            {linkedContent && linkedContent.length > 0 && (
                                <div className="border-t border-white/[0.06] pt-4">
                                    <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                        <FileText className="w-3.5 h-3.5" /> Çekimdeki İçerikler ({linkedContent.length})
                                    </p>
                                    <div className="space-y-2">
                                        {linkedContent.map(cp => {
                                            const pInfo = PLATFORMS.find(p => p.value === cp.platform);
                                            const PIcon = pInfo?.icon ?? Globe;
                                            return (
                                                <div key={cp.id} className="bg-[#111114] rounded-xl p-3 border border-white/[0.06]">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <PIcon className={`w-3.5 h-3.5 ${pInfo?.color ?? 'text-zinc-400'}`} />
                                                            <p className="text-[13px] text-white font-medium">{cp.title}</p>
                                                        </div>
                                                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                                                            cp.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400' :
                                                            cp.status === 'PUBLISHED' ? 'bg-pink-500/10 text-pink-400' :
                                                            cp.status === 'WAITING_APPROVAL' ? 'bg-amber-500/10 text-amber-400' :
                                                            'bg-zinc-500/10 text-zinc-400'
                                                        }`}>
                                                            {getStatus(cp.status).label}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-3 mt-1.5 text-[10px] text-zinc-500">
                                                        {cp.authorName && <span>{cp.authorName}</span>}
                                                        {cp.contentSize && <span>{cp.contentSize}</span>}
                                                        {cp.direction && <span className="truncate max-w-[200px]">{cp.direction}</span>}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </motion.div>
        </motion.div>
    );
}

/* ─── Approve with Shoot Modal ───────────────────────────── */

function ApproveWithShootModal({
    companyId,
    existingShoots,
    onClose,
    onApprove,
    onApproveExisting,
    isLoading,
}: {
    companyId: string;
    existingShoots: ShootResponse[];
    onClose: () => void;
    onApprove: (data: ApproveContentPlanRequest) => void;
    onApproveExisting: (shootId: string) => void;
    isLoading: boolean;
}) {
    const [mode, setMode] = useState<'existing' | 'new'>(existingShoots.length > 0 ? 'existing' : 'new');
    const [selectedShootId, setSelectedShootId] = useState('');
    const [shootTitle, setShootTitle] = useState('');
    const [shootDescription, setShootDescription] = useState('');
    const [shootDate, setShootDate] = useState('');
    const [shootTime, setShootTime] = useState('');
    const [location, setLocation] = useState('');

    const handleSubmitNew = (e: React.FormEvent) => {
        e.preventDefault();
        if (!shootTitle.trim()) return;
        onApprove({
            companyId,
            shootTitle: shootTitle.trim(),
            shootDescription: shootDescription.trim() || undefined,
            shootDate: shootDate || undefined,
            shootTime: shootTime || undefined,
            location: location.trim() || undefined,
        });
    };

    const handleSubmitExisting = () => {
        if (!selectedShootId) return;
        onApproveExisting(selectedShootId);
    };

    const formatDate = (d: string | null) => {
        if (!d) return '';
        try { return new Date(d).toLocaleDateString('tr-TR'); } catch { return ''; }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ type: "spring", duration: 0.3 }}
                className="bg-[#0C0C0E] border border-white/[0.08] rounded-2xl p-6 w-full max-w-md shadow-2xl max-h-[85vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-5">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                            <Camera className="w-4 h-4 text-emerald-400" />
                        </div>
                        Onayla ve Çekim Seç
                    </h3>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/[0.05] text-zinc-500 hover:text-white transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <p className="text-[12px] text-zinc-500 mb-4">
                    İçeriği onaylamak için mevcut bir çekime ekleyin veya yeni çekim oluşturun.
                </p>

                {/* Mode Toggle */}
                <div className="flex gap-2 mb-4">
                    <button
                        onClick={() => setMode('existing')}
                        className={`flex-1 py-2 rounded-lg text-[12px] font-medium transition-all border ${
                            mode === 'existing'
                                ? 'bg-violet-500/10 border-violet-500/30 text-violet-400'
                                : 'border-white/[0.06] text-zinc-500 hover:text-zinc-300'
                        }`}
                    >
                        Mevcut Çekime Ekle
                    </button>
                    <button
                        onClick={() => setMode('new')}
                        className={`flex-1 py-2 rounded-lg text-[12px] font-medium transition-all border ${
                            mode === 'new'
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                : 'border-white/[0.06] text-zinc-500 hover:text-zinc-300'
                        }`}
                    >
                        Yeni Çekim Oluştur
                    </button>
                </div>

                {mode === 'existing' ? (
                    <div className="space-y-3">
                        {existingShoots.length === 0 ? (
                            <div className="text-center py-6">
                                <Camera className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
                                <p className="text-sm text-zinc-500">Planlanan çekim yok</p>
                                <button onClick={() => setMode('new')} className="text-xs text-violet-400 mt-2 hover:underline">
                                    Yeni çekim oluştur
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="space-y-2 max-h-60 overflow-y-auto">
                                    {existingShoots.map(s => (
                                        <button
                                            key={s.id}
                                            onClick={() => setSelectedShootId(s.id)}
                                            className={`w-full text-left p-3 rounded-xl border transition-all ${
                                                selectedShootId === s.id
                                                    ? 'border-violet-500/40 bg-violet-500/10'
                                                    : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12]'
                                            }`}
                                        >
                                            <p className="text-[13px] font-medium text-white">{s.title}</p>
                                            <div className="flex items-center gap-3 mt-1 text-[10px] text-zinc-500">
                                                {s.shootDate && (
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" /> {formatDate(s.shootDate)}
                                                    </span>
                                                )}
                                                {s.shootTime && (
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="w-3 h-3" /> {s.shootTime}
                                                    </span>
                                                )}
                                                {s.location && (
                                                    <span className="flex items-center gap-1">
                                                        <MapPin className="w-3 h-3" /> {s.location}
                                                    </span>
                                                )}
                                            </div>
                                            {s.linkedContentCount > 0 && (
                                                <span className="text-[9px] text-violet-400 mt-1 inline-block">
                                                    {s.linkedContentCount} içerik bağlı
                                                </span>
                                            )}
                                        </button>
                                    ))}
                                </div>

                                <div className="flex items-center gap-2 pt-2">
                                    <button
                                        onClick={handleSubmitExisting}
                                        disabled={!selectedShootId || isLoading}
                                        className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-violet-500 text-white text-[12px] font-medium hover:bg-violet-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                    >
                                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                        Onaya Gönder
                                    </button>
                                    <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-lg border border-white/[0.08] text-[12px] text-zinc-400 hover:text-white transition-colors">
                                        İptal
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                ) : (
                    <form onSubmit={handleSubmitNew} className="space-y-3">
                        <div>
                            <label className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1 block">Çekim Başlığı *</label>
                            <input required value={shootTitle} onChange={e => setShootTitle(e.target.value)} placeholder="Örn: Instagram reels çekimi"
                                className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2 text-[12px] text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500/50" />
                        </div>
                        <div>
                            <label className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1 block">Açıklama</label>
                            <textarea value={shootDescription} onChange={e => setShootDescription(e.target.value)} rows={2} placeholder="Çekim detayları..."
                                className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2 text-[12px] text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500/50 resize-none" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1 block">Çekim Tarihi</label>
                                <input type="date" value={shootDate} onChange={e => setShootDate(e.target.value)}
                                    className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2 text-[12px] text-white focus:outline-none focus:border-violet-500/50" />
                            </div>
                            <div>
                                <label className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1 block">Saat</label>
                                <input type="time" value={shootTime} onChange={e => setShootTime(e.target.value)}
                                    className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2 text-[12px] text-white focus:outline-none focus:border-violet-500/50" />
                            </div>
                        </div>
                        <div>
                            <label className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1 block">Lokasyon</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600" />
                                <input value={location} onChange={e => setLocation(e.target.value)} placeholder="Örn: FOG Istanbul Stüdyo"
                                    className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg pl-9 pr-3 py-2 text-[12px] text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500/50" />
                            </div>
                        </div>
                        <div className="flex items-center gap-2 pt-2">
                            <button type="submit" disabled={!shootTitle.trim() || isLoading}
                                className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-emerald-500 text-white text-[12px] font-medium hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                                Onaya Gönder
                            </button>
                            <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-lg border border-white/[0.08] text-[12px] text-zinc-400 hover:text-white transition-colors">
                                İptal
                            </button>
                        </div>
                    </form>
                )}
            </motion.div>
        </motion.div>
    );
}
