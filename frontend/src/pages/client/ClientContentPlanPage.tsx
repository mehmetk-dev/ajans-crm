import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FileText, Camera, Calendar, Clock, RotateCcw,
    CheckCircle2, Sparkles, X, ChevronDown,
    Instagram, Youtube, Globe, Linkedin, Twitter, Monitor, Smartphone,
    Loader2, MapPin
} from 'lucide-react';
import {
    clientContentPlanApi,
    type ContentPlanResponse, type ApproveContentPlanRequest
} from '../../api/contentPlan';
import { clientApi } from '../../api/clientPanel';
import type { PageResponse, ShootResponse } from '../../api/staff';
import { useAuth } from '../../store/AuthContext';

/* ─── Constants ──────────────────────────────────────────── */

const PLATFORMS: Record<string, { label: string; icon: typeof FileText; color: string; bg: string; border: string }> = {
    INSTAGRAM: { label: 'Instagram', icon: Instagram, color: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/20' },
    TIKTOK:    { label: 'TikTok',    icon: Smartphone, color: 'text-cyan-400',  bg: 'bg-cyan-500/10',  border: 'border-cyan-500/20' },
    YOUTUBE:   { label: 'YouTube',   icon: Youtube,    color: 'text-red-400',   bg: 'bg-red-500/10',   border: 'border-red-500/20' },
    FACEBOOK:  { label: 'Facebook',  icon: Globe,      color: 'text-blue-400',  bg: 'bg-blue-500/10',  border: 'border-blue-500/20' },
    LINKEDIN:  { label: 'LinkedIn',  icon: Linkedin,   color: 'text-sky-400',   bg: 'bg-sky-500/10',   border: 'border-sky-500/20' },
    TWITTER:   { label: 'Twitter',   icon: Twitter,    color: 'text-zinc-300',  bg: 'bg-zinc-500/10',  border: 'border-zinc-500/20' },
    WEBSITE:   { label: 'Web',       icon: Monitor,    color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
};

const STATUSES: Record<string, { label: string; color: string; bg: string; border: string; icon: typeof FileText }> = {
    DRAFT:            { label: 'Taslak',        color: 'text-zinc-400',    bg: 'bg-zinc-500/10',    border: 'border-zinc-500/20',    icon: FileText },
    WAITING_APPROVAL: { label: 'Onay Bekliyor', color: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/20',   icon: Clock },
    REVISION:         { label: 'Revize',        color: 'text-orange-400',  bg: 'bg-orange-500/10',  border: 'border-orange-500/20',  icon: RotateCcw },
    APPROVED:         { label: 'Onaylandı',     color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: CheckCircle2 },
    PUBLISHED:        { label: 'Yayınlandı',    color: 'text-pink-400',    bg: 'bg-pink-500/10',    border: 'border-pink-500/20',    icon: Sparkles },
};

const STATUS_TABS = ['ALL', 'DRAFT', 'WAITING_APPROVAL', 'REVISION', 'APPROVED', 'PUBLISHED'] as const;
type StatusTab = typeof STATUS_TABS[number];

function getPlatform(val: string) { return PLATFORMS[val] ?? PLATFORMS.INSTAGRAM; }
function getStatus(val: string)   { return STATUSES[val]  ?? STATUSES.DRAFT; }
function fmtDate(d: string | null) {
    if (!d) return null;
    return new Date(d).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
}
function fmtShort(d: string | null) {
    if (!d) return null;
    return new Date(d).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
}

/* ─── Main Page ──────────────────────────────────────────── */

export default function ClientContentPlanPage() {
    const { user } = useAuth();
    const qc = useQueryClient();
    const [activeTab, setActiveTab] = useState<StatusTab>('ALL');
    const [selectedPlan, setSelectedPlan] = useState<ContentPlanResponse | null>(null);
    const [approveModal, setApproveModal] = useState<string | null>(null);
    const [shootDetailId, setShootDetailId] = useState<string | null>(null);

    const { data, isLoading } = useQuery<PageResponse<ContentPlanResponse>>({
        queryKey: ['client-content-plans-page', user?.companyId],
        queryFn: () => clientContentPlanApi.getByCompany(user!.companyId!, undefined, 0, 200),
        enabled: !!user?.companyId,
    });

    const allPlans = data?.content ?? [];

    const stats = useMemo(() => {
        const s: Record<string, number> = { DRAFT: 0, WAITING_APPROVAL: 0, REVISION: 0, APPROVED: 0, PUBLISHED: 0 };
        allPlans.forEach(p => { if (s[p.status] !== undefined) s[p.status]++; });
        return s;
    }, [allPlans]);

    const filtered = useMemo(() =>
        activeTab === 'ALL' ? allPlans : allPlans.filter(p => p.status === activeTab),
        [allPlans, activeTab]
    );

    const approveWithShootMut = useMutation({
        mutationFn: ({ id, data }: { id: string; data: ApproveContentPlanRequest }) => {
            const metadata = [data.shootTitle || '', data.shootDescription || '', data.shootDate || '', data.shootTime || '', data.location || '', ''].join('||');
            return clientApi.createApprovalRequest({
                type: 'CONTENT_APPROVAL', referenceId: id, companyId: user!.companyId!,
                title: `İçerik Onayı: ${data.shootTitle}`, description: 'Yeni çekim oluşturulması talep edildi', metadata,
            });
        },
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['client-content-plans-page'] }); setApproveModal(null); alert('İsteğiniz yöneticiye iletildi!'); },
    });

    const approveExistingMut = useMutation({
        mutationFn: ({ id, shootId }: { id: string; shootId: string }) => {
            const metadata = ['', '', '', '', '', shootId].join('||');
            return clientApi.createApprovalRequest({
                type: 'CONTENT_APPROVAL', referenceId: id, companyId: user!.companyId!,
                title: 'İçerik Onayı: Mevcut çekime bağlama', description: 'Mevcut bir çekime bağlanması talep edildi', metadata,
            });
        },
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['client-content-plans-page'] }); setApproveModal(null); alert('İsteğiniz yöneticiye iletildi!'); },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: companyShootsData } = useQuery<any>({
        queryKey: ['company-shoots-for-content-page', user?.companyId],
        queryFn: () => clientApi.getMyShoots(0, 50),
        enabled: !!approveModal,
    });
    const existingShoots: ShootResponse[] = (companyShootsData?.content ?? []).filter((s: ShootResponse) => s.status === 'PLANNED');

    if (!user?.companyId) return null;

    return (
        <div className="space-y-6">
            {/* ── Page Header ── */}
            <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0C0C0E] p-6">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/8 via-transparent to-pink-500/5 pointer-events-none" />
                <div className="relative flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-violet-500/20 to-pink-500/20 border border-violet-500/20 flex items-center justify-center shadow-lg shadow-violet-500/10">
                            <FileText className="w-5 h-5 text-violet-400" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-white">İçerik Planı</h1>
                            <p className="text-[12px] text-zinc-500 mt-0.5">
                                Şirketinize ait tüm içerik planları
                                {allPlans.length > 0 && <span className="ml-2 text-violet-400 font-medium">· {allPlans.length} içerik</span>}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Stats Row */}
                {!isLoading && allPlans.length > 0 && (
                    <div className="relative mt-5 grid grid-cols-2 sm:grid-cols-5 gap-2">
                        {Object.entries(STATUSES).map(([key, cfg]) => {
                            const Icon = cfg.icon;
                            const count = stats[key] ?? 0;
                            if (count === 0) return null;
                            return (
                                <button
                                    key={key}
                                    onClick={() => setActiveTab(key as StatusTab)}
                                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border transition-all ${
                                        activeTab === key
                                            ? `${cfg.bg} ${cfg.border} ${cfg.color}`
                                            : 'bg-white/[0.02] border-white/[0.06] text-zinc-500 hover:border-white/[0.12] hover:text-zinc-300'
                                    }`}
                                >
                                    <Icon className="w-3.5 h-3.5 shrink-0" />
                                    <div className="text-left">
                                        <p className="text-[10px] font-medium leading-none">{cfg.label}</p>
                                        <p className="text-lg font-bold leading-tight mt-0.5">{count}</p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* ── Tab Filters ── */}
            <div className="flex items-center gap-2 flex-wrap">
                {STATUS_TABS.map(tab => {
                    const count = tab === 'ALL' ? allPlans.length : (stats[tab] ?? 0);
                    const cfg = tab !== 'ALL' ? STATUSES[tab] : null;
                    const active = activeTab === tab;
                    return (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[11px] font-semibold border transition-all ${
                                active
                                    ? cfg
                                        ? `${cfg.bg} ${cfg.border} ${cfg.color}`
                                        : 'bg-violet-500/10 border-violet-500/30 text-violet-400'
                                    : 'bg-transparent border-white/[0.06] text-zinc-500 hover:border-white/[0.12] hover:text-zinc-300'
                            }`}
                        >
                            {tab === 'ALL' ? 'Tümü' : (cfg?.label ?? tab)}
                            <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${active ? 'bg-white/10' : 'bg-white/[0.04]'}`}>
                                {count}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* ── Content List ── */}
            {isLoading ? (
                <div className="flex items-center justify-center h-40">
                    <Loader2 className="w-6 h-6 text-violet-400 animate-spin" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="bg-[#0C0C0E] border border-white/[0.06] rounded-2xl p-12 text-center">
                    <FileText className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
                    <h3 className="text-base font-semibold text-white">Bu kategoride içerik yok</h3>
                    <p className="text-sm text-zinc-500 mt-1">Farklı bir filtre deneyin.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filtered.map((plan, i) => {
                        const plat = getPlatform(plan.platform);
                        const stat = getStatus(plan.status);
                        const PlatIcon = plat.icon;
                        const StatIcon = stat.icon;
                        return (
                            <motion.button
                                key={plan.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.03 }}
                                onClick={() => setSelectedPlan(plan)}
                                className="text-left bg-[#0C0C0E] border border-white/[0.06] rounded-2xl p-5 hover:border-violet-500/25 hover:bg-white/[0.01] transition-all group"
                            >
                                {/* Card Header */}
                                <div className="flex items-start justify-between gap-3 mb-3">
                                    <div className={`h-10 w-10 rounded-xl ${plat.bg} border ${plat.border} flex items-center justify-center shrink-0`}>
                                        <PlatIcon className={`w-[18px] h-[18px] ${plat.color}`} />
                                    </div>
                                    <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full ${stat.bg} border ${stat.border} shrink-0`}>
                                        <StatIcon className={`w-2.5 h-2.5 ${stat.color}`} />
                                        <span className={`text-[10px] font-semibold ${stat.color}`}>{stat.label}</span>
                                    </div>
                                </div>

                                {/* Title */}
                                <h3 className="text-[13px] font-semibold text-white leading-snug mb-1 group-hover:text-violet-200 transition-colors line-clamp-2">
                                    {plan.title}
                                </h3>

                                {/* Direction preview */}
                                {plan.direction && (
                                    <p className="text-[11px] text-zinc-500 leading-relaxed mb-3 line-clamp-2 italic">
                                        {plan.direction}
                                    </p>
                                )}

                                {/* Meta row */}
                                <div className="flex items-center gap-3 flex-wrap mt-auto pt-3 border-t border-white/[0.04]">
                                    <span className={`text-[10px] font-medium ${plat.color}`}>{plat.label}</span>
                                    {plan.contentSize && (
                                        <>
                                            <span className="text-zinc-700">·</span>
                                            <span className="text-[10px] text-zinc-600">{plan.contentSize}</span>
                                        </>
                                    )}
                                    {plan.plannedDate && (
                                        <>
                                            <span className="text-zinc-700">·</span>
                                            <span className="text-[10px] text-zinc-600 flex items-center gap-0.5">
                                                <Calendar className="w-2.5 h-2.5" />
                                                {fmtShort(plan.plannedDate)}
                                            </span>
                                        </>
                                    )}
                                    {plan.shootId && plan.status === 'APPROVED' && (
                                        <span className="ml-auto flex items-center gap-1 text-[10px] text-emerald-500 font-medium">
                                            <Camera className="w-2.5 h-2.5" /> Çekim var
                                        </span>
                                    )}
                                </div>

                                {/* Author */}
                                <p className="text-[10px] text-zinc-600 mt-2">{plan.authorName}</p>

                                {/* Revision note warning */}
                                {plan.revisionNote && (
                                    <div className="mt-3 px-3 py-2 bg-orange-500/5 border border-orange-500/15 rounded-lg flex items-start gap-2">
                                        <RotateCcw className="w-3 h-3 text-orange-400 shrink-0 mt-0.5" />
                                        <p className="text-[10px] text-orange-300 line-clamp-2">{plan.revisionNote}</p>
                                    </div>
                                )}
                            </motion.button>
                        );
                    })}
                </div>
            )}

            {/* ── Detail Modal ── */}
            <AnimatePresence>
                {selectedPlan && (
                    <DetailModal
                        plan={selectedPlan}
                        onClose={() => setSelectedPlan(null)}
                        onApprove={() => setApproveModal(selectedPlan.id)}
                        onShootDetail={setShootDetailId}
                    />
                )}
            </AnimatePresence>

            {/* ── Shoot Detail Modal ── */}
            <AnimatePresence>
                {shootDetailId && (
                    <ShootMiniModal shootId={shootDetailId} onClose={() => setShootDetailId(null)} />
                )}
            </AnimatePresence>

            {/* ── Approve Modal ── */}
            <AnimatePresence>
                {approveModal && (
                    <ApproveShootModal
                        companyId={user.companyId}
                        existingShoots={existingShoots}
                        onClose={() => setApproveModal(null)}
                        onApprove={d => approveWithShootMut.mutate({ id: approveModal, data: d })}
                        onApproveExisting={sid => approveExistingMut.mutate({ id: approveModal, shootId: sid })}
                        isLoading={approveWithShootMut.isPending || approveExistingMut.isPending}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

/* ─── Detail Modal ───────────────────────────────────────── */

function DetailModal({ plan, onClose, onApprove, onShootDetail }: {
    plan: ContentPlanResponse;
    onClose: () => void;
    onApprove: () => void;
    onShootDetail: (id: string) => void;
}) {
    const plat = getPlatform(plan.platform);
    const stat = getStatus(plan.status);
    const PlatIcon = plat.icon;
    const StatIcon = stat.icon;

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
                transition={{ type: 'spring', damping: 28, stiffness: 280 }}
                className="bg-[#0D0D0F] border border-white/[0.08] rounded-t-3xl sm:rounded-2xl w-full max-w-xl max-h-[92vh] overflow-y-auto shadow-2xl"
                onClick={e => e.stopPropagation()}
            >
                {/* Drag handle (mobile) */}
                <div className="flex justify-center pt-3 pb-1 sm:hidden">
                    <div className="w-10 h-1 rounded-full bg-white/10" />
                </div>

                {/* Header */}
                <div className="sticky top-0 bg-[#0D0D0F]/95 backdrop-blur-sm px-6 pt-5 pb-4 border-b border-white/[0.06] z-10">
                    <div className="flex items-start gap-3">
                        <div className={`h-11 w-11 rounded-2xl ${plat.bg} border ${plat.border} flex items-center justify-center shrink-0`}>
                            <PlatIcon className={`w-5 h-5 ${plat.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h2 className="text-base font-bold text-white leading-snug">{plan.title}</h2>
                            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-full ${stat.bg} border ${stat.border} ${stat.color}`}>
                                    <StatIcon className="w-2.5 h-2.5" /> {stat.label}
                                </span>
                                <span className={`text-[11px] font-medium ${plat.color}`}>{plat.label}</span>
                                {plan.contentSize && <span className="text-[10px] text-zinc-600 bg-white/[0.04] px-2 py-0.5 rounded-full">{plan.contentSize}</span>}
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 rounded-xl text-zinc-500 hover:text-white hover:bg-white/[0.06] transition-colors shrink-0">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div className="px-6 py-5 space-y-4">
                    {/* Meta grid */}
                    <div className="grid grid-cols-2 gap-2">
                        <MetaCard label="Yazar" value={plan.authorName} />
                        {plan.speakerModel && <MetaCard label="Konuşmacı / Manken" value={plan.speakerModel} />}
                        {plan.plannedDate && <MetaCard label="Önerilen Çekim" value={fmtDate(plan.plannedDate) ?? ''} />}
                        {plan.companyName && <MetaCard label="Şirket" value={plan.companyName} />}
                    </div>

                    {/* Direction */}
                    {plan.direction && (
                        <div className="bg-violet-500/5 border border-violet-500/15 rounded-2xl p-4">
                            <p className="text-[9px] font-bold text-violet-400/70 uppercase tracking-widest mb-2">Yönlendirme / Brief</p>
                            <p className="text-[13px] text-zinc-300 leading-relaxed">{plan.direction}</p>
                        </div>
                    )}

                    {/* Description */}
                    {plan.description && (
                        <div className="bg-white/[0.02] rounded-2xl p-4">
                            <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mb-2">Açıklama</p>
                            <p className="text-[13px] text-zinc-300 leading-relaxed">{plan.description}</p>
                        </div>
                    )}

                    {/* Revision note */}
                    {plan.revisionNote && (
                        <div className="bg-orange-500/5 border border-orange-500/20 rounded-2xl p-4">
                            <p className="text-[9px] font-bold text-orange-400 uppercase tracking-widest mb-2">Revize Notu</p>
                            <p className="text-[13px] text-zinc-300 leading-relaxed">{plan.revisionNote}</p>
                        </div>
                    )}

                    {/* Linked shoot */}
                    {plan.shootId && !['WAITING_APPROVAL', 'DRAFT', 'REVISION'].includes(plan.status) && (
                        <button
                            onClick={() => onShootDetail(plan.shootId!)}
                            className="w-full flex items-center gap-3 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4 hover:bg-emerald-500/10 transition-colors text-left"
                        >
                            <div className="h-9 w-9 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                                <Camera className="w-4 h-4 text-emerald-400" />
                            </div>
                            <div>
                                <p className="text-[9px] font-bold text-emerald-500/60 uppercase tracking-widest">Bağlı Çekim</p>
                                <p className="text-[13px] text-white font-medium mt-0.5">
                                    {plan.shootTitle || 'Çekim Detayları'}
                                    {plan.shootDate && <span className="text-zinc-500 ml-2 text-[11px]">· {fmtShort(plan.shootDate)}</span>}
                                </p>
                            </div>
                            <ChevronDown className="-rotate-90 w-4 h-4 text-zinc-500 ml-auto" />
                        </button>
                    )}

                    {/* Footer meta */}
                    <p className="text-[10px] text-zinc-700">
                        {plan.createdByName && <span>Oluşturan: {plan.createdByName} · </span>}
                        {fmtDate(plan.createdAt)}
                    </p>

                    {/* Client Actions */}
                    {plan.status === 'WAITING_APPROVAL' && (
                        <div className="border-t border-white/[0.06] pt-4">
                            <button
                                onClick={onApprove}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-[12px] font-semibold transition-colors"
                            >
                                <Camera className="w-4 h-4" /> Onayla + Çekim Planla
                            </button>
                        </div>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
}

function MetaCard({ label, value }: { label: string; value: string }) {
    return (
        <div className="bg-white/[0.02] rounded-xl p-3 border border-white/[0.04]">
            <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mb-1">{label}</p>
            <p className="text-[12px] text-white font-medium">{value}</p>
        </div>
    );
}

/* ─── Shoot Mini Modal ───────────────────────────────────── */

function ShootMiniModal({ shootId, onClose }: { shootId: string; onClose: () => void }) {
    const { data: shoot, isLoading } = useQuery({
        queryKey: ['shoot-mini', shootId],
        queryFn: () => clientApi.getShootById(shootId),
    });

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[60] p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                className="bg-[#0D0D0F] border border-white/[0.08] rounded-2xl w-full max-w-md shadow-2xl"
                onClick={e => e.stopPropagation()}
            >
                {isLoading || !shoot ? (
                    <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 text-violet-400 animate-spin" /></div>
                ) : (
                    <>
                        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-white/[0.06]">
                            <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-xl bg-violet-500/10 flex items-center justify-center">
                                    <Camera className="w-4 h-4 text-violet-400" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-white">{shoot.title}</h3>
                                    <span className="text-[10px] text-violet-400">Planlandı</span>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-white/[0.06] transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="p-5 grid grid-cols-2 gap-3">
                            {shoot.shootDate && (
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                                    <span className="text-[12px] text-zinc-300">{fmtDate(shoot.shootDate)}</span>
                                </div>
                            )}
                            {shoot.shootTime && (
                                <div className="flex items-center gap-2">
                                    <Clock className="w-3.5 h-3.5 text-zinc-500" />
                                    <span className="text-[12px] text-zinc-300">{shoot.shootTime.slice(0,5)}</span>
                                </div>
                            )}
                            {shoot.location && (
                                <div className="flex items-center gap-2 col-span-2">
                                    <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                                    <span className="text-[12px] text-zinc-300">{shoot.location}</span>
                                </div>
                            )}
                            {shoot.photographerName && (
                                <div className="flex items-center gap-2 col-span-2">
                                    <Camera className="w-3.5 h-3.5 text-zinc-500" />
                                    <span className="text-[12px] text-zinc-300">{shoot.photographerName}</span>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </motion.div>
        </motion.div>
    );
}

/* ─── Approve Shoot Modal ────────────────────────────────── */

function ApproveShootModal({ companyId, existingShoots, onClose, onApprove, onApproveExisting, isLoading }: {
    companyId: string;
    existingShoots: ShootResponse[];
    onClose: () => void;
    onApprove: (data: ApproveContentPlanRequest) => void;
    onApproveExisting: (shootId: string) => void;
    isLoading: boolean;
}) {
    const [mode, setMode] = useState<'new' | 'existing'>(existingShoots.length > 0 ? 'existing' : 'new');
    const [selectedShootId, setSelectedShootId] = useState('');
    const [shootTitle, setShootTitle] = useState('');
    const [shootDate, setShootDate] = useState('');
    const [shootTime, setShootTime] = useState('');
    const [location, setLocation] = useState('');

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[60] p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                className="bg-[#0D0D0F] border border-white/[0.08] rounded-2xl w-full max-w-md shadow-2xl max-h-[85vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-white/[0.06]">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <Camera className="w-4 h-4 text-emerald-400" /> Onayla + Çekim Seç
                    </h3>
                    <button onClick={onClose} className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-white/[0.06] transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    {/* Mode toggle */}
                    <div className="flex gap-2">
                        {(['existing', 'new'] as const).map(m => (
                            <button key={m} onClick={() => setMode(m)}
                                className={`flex-1 py-2.5 rounded-xl text-[12px] font-semibold border transition-all ${
                                    mode === m
                                        ? m === 'existing' ? 'bg-violet-500/10 border-violet-500/30 text-violet-400' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                        : 'border-white/[0.06] text-zinc-500 hover:text-zinc-300'
                                }`}>
                                {m === 'existing' ? 'Mevcut Çekim' : 'Yeni Çekim'}
                            </button>
                        ))}
                    </div>

                    {mode === 'existing' ? (
                        existingShoots.length === 0 ? (
                            <div className="text-center py-6">
                                <Camera className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
                                <p className="text-sm text-zinc-500">Planlanan çekim yok</p>
                                <button onClick={() => setMode('new')} className="text-xs text-violet-400 mt-2 hover:underline">Yeni çekim oluştur</button>
                            </div>
                        ) : (
                            <div className="space-y-2 max-h-56 overflow-y-auto">
                                {existingShoots.map(s => (
                                    <button key={s.id} onClick={() => setSelectedShootId(s.id)}
                                        className={`w-full text-left p-3 rounded-xl border transition-all ${
                                            selectedShootId === s.id ? 'border-violet-500/40 bg-violet-500/10' : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12]'
                                        }`}>
                                        <p className="text-[13px] font-medium text-white">{s.title}</p>
                                        <div className="flex items-center gap-3 mt-1 text-[10px] text-zinc-500">
                                            {s.shootDate && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{fmtShort(s.shootDate)}</span>}
                                            {s.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{s.location}</span>}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )
                    ) : (
                        <div className="space-y-3">
                            <input required value={shootTitle} onChange={e => setShootTitle(e.target.value)} placeholder="Çekim başlığı *"
                                className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-2.5 text-[12px] text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500/50" />
                            <div className="grid grid-cols-2 gap-3">
                                <input type="date" value={shootDate} onChange={e => setShootDate(e.target.value)}
                                    className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-2.5 text-[12px] text-white focus:outline-none focus:border-violet-500/50" />
                                <input type="time" value={shootTime} onChange={e => setShootTime(e.target.value)}
                                    className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-2.5 text-[12px] text-white focus:outline-none focus:border-violet-500/50" />
                            </div>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600" />
                                <input value={location} onChange={e => setLocation(e.target.value)} placeholder="Lokasyon"
                                    className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl pl-9 pr-4 py-2.5 text-[12px] text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500/50" />
                            </div>
                        </div>
                    )}

                    {/* Submit */}
                    <div className="flex gap-2 pt-2">
                        <button
                            onClick={() => mode === 'existing' ? onApproveExisting(selectedShootId) : onApprove({ companyId, shootTitle, shootDate: shootDate || undefined, shootTime: shootTime || undefined, location: location || undefined })}
                            disabled={isLoading || (mode === 'existing' ? !selectedShootId : !shootTitle.trim())}
                            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-[12px] font-semibold transition-colors"
                        >
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                            Onaya Gönder
                        </button>
                        <button onClick={onClose} className="px-4 py-3 rounded-xl border border-white/[0.08] text-zinc-400 text-[12px] hover:text-white transition-colors">
                            İptal
                        </button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}
