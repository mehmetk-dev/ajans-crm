import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, FileText, Loader2, Plus } from 'lucide-react';
import {
    ShootDetailPanel,
    useClientShoots,
    useShootDetail,
    useStaffShoots,
} from '../../shoots';
import type {
    ContentPlanFormValues,
    ContentPlanResponse,
    ContentStatus,
    ContentApprovalDetails,
    UpdateContentPlanInput,
} from '../api/contentPlan.types';
import {
    useContentPlans,
    useCreateContentPlan,
    useDeleteContentPlan,
    useRequestContentRevision,
    useSubmitContentApproval,
    useUpdateContentPlan,
} from '../hooks/useContentPlans';
import {
    getContentPlanHiddenCount,
    getContentPlanPageSize,
} from '../model/contentPlanPreview';
import { contentStatusMeta } from '../model/contentPlan.constants';
import { ContentApprovalDialog } from './ContentApprovalDialog';
import { ContentPlanCard } from './ContentPlanCard';
import { ContentPlanDetailPanel } from './ContentPlanDetailPanel';
import { ContentPlanForm } from './ContentPlanForm';

interface ContentPlanPanelProps {
    companyId: string;
    readOnly?: boolean;
    limit?: number;
}

export function ContentPlanPanel({
    companyId,
    readOnly = false,
    limit,
}: ContentPlanPanelProps) {
    const scope = readOnly ? 'client' : 'staff';
    const [status, setStatus] = useState<ContentStatus | undefined>();
    const [showForm, setShowForm] = useState(false);
    const [showAll, setShowAll] = useState(false);
    const [selected, setSelected] = useState<ContentPlanResponse | null>(null);
    const [editing, setEditing] = useState<ContentPlanResponse | null>(null);
    const [approving, setApproving] = useState<ContentPlanResponse | null>(null);
    const [shootId, setShootId] = useState<string>();

    const plansQuery = useContentPlans(
        scope,
        companyId,
        status,
        0,
        getContentPlanPageSize(limit, showAll),
    );
    const createPlan = useCreateContentPlan();
    const updatePlan = useUpdateContentPlan();
    const deletePlan = useDeleteContentPlan();
    const requestRevision = useRequestContentRevision();
    const submitApproval = useSubmitContentApproval();
    const staffShoots = useStaffShoots(0, 100, companyId, !readOnly && Boolean(approving));
    const clientShoots = useClientShoots(0, 100, readOnly && Boolean(approving));
    const shootDetail = useShootDetail(scope, shootId);

    const plans = plansQuery.data?.content ?? [];
    const visiblePlans = limit && !showAll ? plans.slice(0, limit) : plans;
    const hiddenPlanCount = getContentPlanHiddenCount(
        plansQuery.data?.totalElements,
        limit,
        plans.length,
    );
    const plannedShoots = useMemo(() => {
        const source = readOnly ? clientShoots.data?.content : staffShoots.data?.content;
        return (source ?? []).filter(shoot =>
            shoot.companyId === companyId && shoot.status === 'PLANNED');
    }, [clientShoots.data, companyId, readOnly, staffShoots.data]);

    const create = (values: ContentPlanFormValues) => {
        createPlan.mutate({ companyId, ...values }, {
            onSuccess: () => setShowForm(false),
        });
    };

    const update = (plan: ContentPlanResponse, input: UpdateContentPlanInput) => {
        updatePlan.mutate({ id: plan.id, input }, {
            onSuccess: updated => {
                setSelected(current => current?.id === updated.id ? updated : current);
                setEditing(null);
            },
        });
    };

    const remove = (plan: ContentPlanResponse) => {
        if (!confirm('Bu içerik planını silmek istediğinize emin misiniz?')) return;
        deletePlan.mutate(plan.id, { onSuccess: () => setSelected(null) });
    };

    const approve = (details: ContentApprovalDetails) => {
        if (!approving) return;
        submitApproval.mutate({
            planId: approving.id,
            companyId,
            planTitle: approving.title,
            details,
        }, {
            onSuccess: () => {
                setApproving(null);
                alert('İsteğiniz yöneticiye iletildi.');
            },
        });
    };

    return (
        <>
            <section className="rounded-2xl border border-white/[0.06] bg-[#0C0C0E] p-5">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10">
                            <FileText className="h-4 w-4 text-violet-400" />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-white">İçerik Planı</h3>
                            <p className="text-[11px] text-zinc-500">{plans.length} içerik</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <label className="relative">
                            <select value={status ?? ''}
                                onChange={event => setStatus(event.target.value as ContentStatus || undefined)}
                                className="appearance-none rounded-lg border border-white/[0.08] bg-white/[0.03] py-2 pl-3 pr-8 text-[11px] text-zinc-300">
                                <option value="">Tümü</option>
                                {Object.entries(contentStatusMeta).map(([value, meta]) => (
                                    <option key={value} value={value}>{meta.label}</option>
                                ))}
                            </select>
                            <ChevronDown className="pointer-events-none absolute right-2 top-2.5 h-3 w-3 text-zinc-500" />
                        </label>
                        {!readOnly && (
                            <button onClick={() => setShowForm(true)}
                                className="flex items-center gap-1 rounded-lg border border-violet-500/20 bg-violet-500/10 px-3 py-2 text-[11px] font-semibold text-violet-400">
                                <Plus className="h-3.5 w-3.5" /> Yeni
                            </button>
                        )}
                    </div>
                </div>

                {showForm && (
                    <div className="mb-4">
                        <ContentPlanForm onSubmit={create} onCancel={() => setShowForm(false)}
                            isLoading={createPlan.isPending} />
                    </div>
                )}

                {plansQuery.isLoading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="h-6 w-6 animate-spin text-violet-400" />
                    </div>
                ) : visiblePlans.length === 0 ? (
                    <div className="py-12 text-center text-sm text-zinc-500">İçerik planı bulunamadı.</div>
                ) : (
                    <div className={readOnly && !limit ? 'grid gap-3 md:grid-cols-2 xl:grid-cols-3' : 'space-y-2'}>
                        {visiblePlans.map(plan => (
                            <ContentPlanCard key={plan.id} plan={plan}
                                compact={!readOnly || Boolean(limit)} onClick={() => setSelected(plan)} />
                        ))}
                    </div>
                )}
                {limit && hiddenPlanCount > 0 && (
                    <button onClick={() => setShowAll(value => !value)}
                        className="mt-3 w-full border-t border-white/[0.04] pt-3 text-xs text-zinc-500">
                        {showAll ? 'Daha az göster' : `${hiddenPlanCount} içerik daha göster`}
                    </button>
                )}
            </section>

            <AnimatePresence>
                {selected && (
                    <ContentPlanDetailPanel plan={selected} scope={scope}
                        isWorking={updatePlan.isPending || deletePlan.isPending || requestRevision.isPending}
                        onClose={() => setSelected(null)}
                        onEdit={!readOnly ? () => { setEditing(selected); setSelected(null); } : undefined}
                        onDelete={!readOnly ? () => remove(selected) : undefined}
                        onStatusChange={!readOnly ? (next, note) => update(selected, { status: next, revisionNote: note }) : undefined}
                        onApprove={readOnly ? () => setApproving(selected) : undefined}
                        onRevision={readOnly ? note => requestRevision.mutate({ id: selected.id, note }, {
                            onSuccess: updated => setSelected(updated),
                        }) : undefined}
                        onShootOpen={setShootId} />
                )}
                {editing && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
                        onClick={() => setEditing(null)}>
                        <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto"
                            onClick={event => event.stopPropagation()}>
                            <ContentPlanForm initial={editing}
                                onSubmit={values => update(editing, values)}
                                onCancel={() => setEditing(null)}
                                isLoading={updatePlan.isPending} />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {approving && (
                <ContentApprovalDialog shoots={plannedShoots}
                    isLoading={submitApproval.isPending}
                    onClose={() => setApproving(null)} onSubmit={approve} />
            )}
            <ShootDetailPanel shoot={shootDetail.data ?? null} scope={scope}
                onClose={() => setShootId(undefined)} />
        </>
    );
}
