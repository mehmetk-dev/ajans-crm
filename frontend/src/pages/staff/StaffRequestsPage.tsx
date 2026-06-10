import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    AlertTriangle, Building2, Calendar, Camera, CheckCircle2, Clock,
    FileText, Inbox, Loader2, MapPin, MessageSquare, User, XCircle,
} from 'lucide-react';
import {
    ApprovalReviewDialog,
    parseContentApprovalMetadata,
    useApprovalRequests,
    useRejectApproval,
    useReviewApproval,
    type ApprovalRequestResponse,
} from '../../features/content-plans';
import { taskApi, taskKeys } from '../../features/tasks';

type Tab = 'PENDING' | 'ALL';

const typeConfig = {
    CONTENT_APPROVAL: { label: 'İçerik Onayı', icon: FileText, className: 'bg-violet-500/10 text-violet-400' },
    SHOOT_REQUEST: { label: 'Çekim Talebi', icon: Camera, className: 'bg-pink-500/10 text-pink-400' },
    TASK_REQUEST: { label: 'Görev Talebi', icon: AlertTriangle, className: 'bg-amber-500/10 text-amber-400' },
    MEETING_REQUEST: { label: 'Toplantı Talebi', icon: MessageSquare, className: 'bg-sky-500/10 text-sky-400' },
    GENERAL: { label: 'Genel İstek', icon: Inbox, className: 'bg-zinc-500/10 text-zinc-400' },
};

const statusConfig = {
    PENDING: { label: 'Bekliyor', className: 'bg-amber-500/10 text-amber-400' },
    APPROVED: { label: 'Onaylandı', className: 'bg-emerald-500/10 text-emerald-400' },
    REJECTED: { label: 'Reddedildi', className: 'bg-red-500/10 text-red-400' },
};

export default function StaffRequestsPage() {
    const [tab, setTab] = useState<Tab>('PENDING');
    const [expandedId, setExpandedId] = useState<string>();
    const [reviewing, setReviewing] = useState<ApprovalRequestResponse>();
    const requestsQuery = useApprovalRequests();
    const reviewApproval = useReviewApproval();
    const rejectApproval = useRejectApproval();
    const staffQuery = useQuery({
        queryKey: taskKeys.assignableUsers(),
        queryFn: () => taskApi.listAssignableUsers(),
        retry: false,
    });

    const allRequests = requestsQuery.data ?? [];
    const requests = tab === 'PENDING'
        ? allRequests.filter(request => request.status === 'PENDING')
        : allRequests;
    const pendingCount = allRequests.filter(request => request.status === 'PENDING').length;

    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-2xl font-bold text-white">İstekler</h1>
                <p className="mt-1 text-sm text-zinc-500">Şirketlerden gelen onay talepleri</p>
            </header>
            <div className="flex gap-2">
                <TabButton active={tab === 'PENDING'} onClick={() => setTab('PENDING')}>
                    <Clock className="h-3.5 w-3.5" /> Bekleyen ({pendingCount})
                </TabButton>
                <TabButton active={tab === 'ALL'} onClick={() => setTab('ALL')}>
                    <Inbox className="h-3.5 w-3.5" /> Tümü
                </TabButton>
            </div>
            {requestsQuery.isLoading ? (
                <div className="flex h-40 items-center justify-center">
                    <Loader2 className="h-7 w-7 animate-spin text-violet-400" />
                </div>
            ) : requests.length === 0 ? (
                <div className="rounded-2xl border border-white/[0.06] bg-[#0C0C0E] p-12 text-center text-zinc-500">
                    Bekleyen istek bulunmuyor.
                </div>
            ) : (
                <div className="space-y-3">
                    {requests.map(request => (
                        <RequestCard key={request.id} request={request}
                            expanded={expandedId === request.id}
                            onToggle={() => setExpandedId(expandedId === request.id ? undefined : request.id)}
                            onApprove={() => setReviewing(request)}
                            onReject={() => {
                                const note = prompt('Red sebebi:');
                                rejectApproval.mutate({ id: request.id, note: note || undefined });
                            }} />
                    ))}
                </div>
            )}
            {reviewing && (
                <ApprovalReviewDialog request={reviewing} staffMembers={staffQuery.data ?? []}
                    isLoading={reviewApproval.isPending} onClose={() => setReviewing(undefined)}
                    onApprove={input => reviewApproval.mutate({ id: reviewing.id, input }, {
                        onSuccess: () => setReviewing(undefined),
                    })} />
            )}
        </div>
    );
}

function RequestCard({
    request,
    expanded,
    onToggle,
    onApprove,
    onReject,
}: {
    request: ApprovalRequestResponse;
    expanded: boolean;
    onToggle: () => void;
    onApprove: () => void;
    onReject: () => void;
}) {
    const type = typeConfig[request.type];
    const status = statusConfig[request.status];
    const TypeIcon = type.icon;
    const metadata = parseContentApprovalMetadata(request.metadata);
    return (
        <article className="overflow-hidden rounded-xl border border-white/[0.06] bg-[#0C0C0E]">
            <button onClick={onToggle} className="flex w-full items-start gap-4 p-4 text-left">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${type.className}`}>
                    <TypeIcon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-white">{request.title}</span>
                        <span className={`rounded-full px-2 py-1 text-[10px] font-bold ${status.className}`}>{status.label}</span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-4 text-[11px] text-zinc-500">
                        <span className="flex items-center gap-1"><Building2 className="h-3 w-3" />{request.companyName}</span>
                        <span className="flex items-center gap-1"><User className="h-3 w-3" />{request.requestedByName}</span>
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{formatDate(request.createdAt)}</span>
                    </div>
                </div>
            </button>
            {expanded && (
                <div className="space-y-3 border-t border-white/[0.05] px-4 pb-4 pt-3">
                    {request.description && <p className="text-sm text-zinc-400">{request.description}</p>}
                    {request.type === 'CONTENT_APPROVAL' && (
                        <div className="space-y-2 rounded-xl bg-white/[0.02] p-4 text-xs text-zinc-400">
                            {metadata.shootTitle && <p className="flex gap-2"><Camera className="h-3.5 w-3.5" />{metadata.shootTitle}</p>}
                            {metadata.shootDate && <p className="flex gap-2"><Calendar className="h-3.5 w-3.5" />{metadata.shootDate} {metadata.shootTime}</p>}
                            {metadata.location && <p className="flex gap-2"><MapPin className="h-3.5 w-3.5" />{metadata.location}</p>}
                            {metadata.existingShootId && <p className="text-emerald-400">Mevcut çekime bağlanacak</p>}
                        </div>
                    )}
                    {request.reviewedByName && (
                        <p className="rounded-xl bg-white/[0.02] p-3 text-xs text-zinc-500">
                            {request.reviewedByName} tarafından sonuçlandırıldı.
                            {request.reviewNote && ` ${request.reviewNote}`}
                        </p>
                    )}
                    {request.status === 'PENDING' && (
                        <div className="flex gap-2">
                            <button onClick={onApprove} className="flex items-center gap-2 rounded-xl bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-400">
                                <CheckCircle2 className="h-3.5 w-3.5" /> Onayla
                            </button>
                            <button onClick={onReject} className="flex items-center gap-2 rounded-xl bg-red-500/10 px-4 py-2 text-xs font-semibold text-red-400">
                                <XCircle className="h-3.5 w-3.5" /> Reddet
                            </button>
                        </div>
                    )}
                </div>
            )}
        </article>
    );
}

function TabButton({ active, onClick, children }: {
    active: boolean;
    onClick: () => void;
    children: React.ReactNode;
}) {
    return <button onClick={onClick} className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-semibold ${active ? 'border-violet-500/30 bg-violet-500/10 text-violet-400' : 'border-white/[0.06] text-zinc-500'}`}>{children}</button>;
}

function formatDate(value: string) {
    return new Date(value).toLocaleDateString('tr-TR', {
        day: 'numeric', month: 'short', year: 'numeric',
    });
}
