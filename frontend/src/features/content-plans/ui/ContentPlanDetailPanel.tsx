import { motion } from 'framer-motion';
import { Calendar, Camera, Edit3, Loader2, Trash2, X } from 'lucide-react';
import type {
    ContentPlanResponse,
    ContentPlanScope,
    ContentStatus,
} from '../api/contentPlan.types';
import { platformPresentation, statusPresentation } from './contentPlanPresentation';

interface ContentPlanDetailPanelProps {
    plan: ContentPlanResponse;
    scope: ContentPlanScope;
    isWorking?: boolean;
    onClose: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
    onStatusChange?: (status: ContentStatus, revisionNote?: string) => void;
    onApprove?: () => void;
    onRevision?: (note: string) => void;
    onShootOpen?: (shootId: string) => void;
}

export function ContentPlanDetailPanel({
    plan,
    scope,
    isWorking = false,
    onClose,
    onEdit,
    onDelete,
    onStatusChange,
    onApprove,
    onRevision,
    onShootOpen,
}: ContentPlanDetailPanelProps) {
    const platform = platformPresentation[plan.platform];
    const status = statusPresentation[plan.status];
    const PlatformIcon = platform.icon;
    const StatusIcon = status.icon;
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm" onClick={onClose}>
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                className="h-full w-full max-w-xl overflow-y-auto border-l border-white/[0.06] bg-[#0C0C0E]"
                onClick={event => event.stopPropagation()}>
                <header className="sticky top-0 z-10 flex items-start gap-3 border-b border-white/[0.06] bg-[#0C0C0E]/95 p-5">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${platform.className}`}>
                        <PlatformIcon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <h2 className="text-base font-bold text-white">{plan.title}</h2>
                        <span className={`mt-1 inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold ${status.className}`}>
                            <StatusIcon className="h-3 w-3" />{status.label}
                        </span>
                    </div>
                    <button onClick={onClose} className="text-zinc-500 hover:text-white">
                        <X className="h-5 w-5" />
                    </button>
                </header>
                <div className="space-y-4 p-5">
                    <div className="grid grid-cols-2 gap-2">
                        <Info label="Yazar" value={plan.authorName} />
                        <Info label="Platform" value={platform.label} />
                        {plan.contentSize && <Info label="Boyut" value={plan.contentSize} />}
                        {plan.plannedDate && (
                            <Info label="Önerilen Çekim"
                                value={new Date(plan.plannedDate).toLocaleDateString('tr-TR')} />
                        )}
                        {plan.speakerModel && <Info label="Konuşmacı / Manken" value={plan.speakerModel} />}
                        {plan.companyName && <Info label="Şirket" value={plan.companyName} />}
                    </div>
                    {plan.direction && <TextBlock label="Yönlendirme / Brief" value={plan.direction} />}
                    {plan.description && <TextBlock label="Açıklama" value={plan.description} />}
                    {plan.revisionNote && (
                        <div className="rounded-xl border border-orange-500/20 bg-orange-500/5 p-4">
                            <p className="text-[10px] font-bold uppercase text-orange-400">Revize Notu</p>
                            <p className="mt-1 text-sm text-zinc-300">{plan.revisionNote}</p>
                        </div>
                    )}
                    {plan.shootId && onShootOpen && (
                        <button onClick={() => onShootOpen(plan.shootId!)}
                            className="flex w-full items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-left">
                            <Camera className="h-4 w-4 text-emerald-400" />
                            <div>
                                <p className="text-[10px] uppercase text-emerald-500">Bağlı Çekim</p>
                                <p className="text-sm font-medium text-white">{plan.shootTitle ?? 'Çekim detayı'}</p>
                            </div>
                        </button>
                    )}
                    <p className="flex items-center gap-1 text-[10px] text-zinc-700">
                        <Calendar className="h-3 w-3" />
                        {new Date(plan.createdAt).toLocaleDateString('tr-TR')} · {plan.createdByName}
                    </p>
                    <div className="border-t border-white/[0.06] pt-4">
                        {scope === 'staff' ? (
                            <StaffActions plan={plan} onEdit={onEdit} onDelete={onDelete}
                                onStatusChange={onStatusChange} />
                        ) : (
                            <ClientActions plan={plan} onApprove={onApprove} onRevision={onRevision} />
                        )}
                        {isWorking && (
                            <p className="mt-3 flex items-center gap-2 text-xs text-zinc-500">
                                <Loader2 className="h-4 w-4 animate-spin" /> Kaydediliyor...
                            </p>
                        )}
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}

function StaffActions({
    plan,
    onEdit,
    onDelete,
    onStatusChange,
}: Pick<ContentPlanDetailPanelProps, 'plan' | 'onEdit' | 'onDelete' | 'onStatusChange'>) {
    return (
        <div className="flex flex-wrap items-center gap-2">
            {plan.status === 'DRAFT' && <Action label="Onaya Gönder" onClick={() => onStatusChange?.('WAITING_APPROVAL')} />}
            {plan.status === 'WAITING_APPROVAL' && (
                <>
                    <Action label="Onayla" onClick={() => onStatusChange?.('APPROVED')} />
                    <Action label="Revize Et" onClick={() => {
                        const note = prompt('Revize notu:');
                        if (note) onStatusChange?.('REVISION', note);
                    }} />
                </>
            )}
            {plan.status === 'REVISION' && <Action label="Tekrar Onaya Gönder" onClick={() => onStatusChange?.('WAITING_APPROVAL')} />}
            {plan.status === 'APPROVED' && <Action label="Yayınlandı İşaretle" onClick={() => onStatusChange?.('PUBLISHED')} />}
            <span className="flex-1" />
            {onEdit && <button onClick={onEdit} className="p-2 text-zinc-500 hover:text-violet-400"><Edit3 className="h-4 w-4" /></button>}
            {onDelete && <button onClick={onDelete} className="p-2 text-zinc-500 hover:text-red-400"><Trash2 className="h-4 w-4" /></button>}
        </div>
    );
}

function ClientActions({
    plan,
    onApprove,
    onRevision,
}: Pick<ContentPlanDetailPanelProps, 'plan' | 'onApprove' | 'onRevision'>) {
    if (plan.status !== 'WAITING_APPROVAL') return null;
    return (
        <div className="flex gap-2">
            {onApprove && <Action label="Onayla + Çekim Planla" onClick={onApprove} />}
            {onRevision && <Action label="Revize İste" onClick={() => {
                const note = prompt('Revize notu:');
                if (note) onRevision(note);
            }} />}
        </div>
    );
}

function Action({ label, onClick }: { label: string; onClick: () => void }) {
    return <button onClick={onClick} className="rounded-xl border border-violet-500/20 bg-violet-500/10 px-3 py-2 text-xs font-semibold text-violet-400">{label}</button>;
}

function Info({ label, value }: { label: string; value: string }) {
    return <div className="rounded-xl bg-white/[0.03] p-3"><p className="text-[9px] uppercase text-zinc-600">{label}</p><p className="mt-1 text-sm text-white">{value}</p></div>;
}

function TextBlock({ label, value }: { label: string; value: string }) {
    return <div className="rounded-xl bg-white/[0.03] p-4"><p className="text-[9px] uppercase text-zinc-600">{label}</p><p className="mt-2 whitespace-pre-wrap text-sm text-zinc-300">{value}</p></div>;
}
