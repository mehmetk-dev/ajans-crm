import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, CalendarDays, CheckCircle2, Clock3, Loader2, Send } from 'lucide-react';
import {
    approvalApi,
    type ApprovalRequestResponse,
    type ApprovalStatus,
} from '../../features/content-plans';
import { SERVICE_CATALOG, type ServiceCategory } from '../../features/serviceCatalog';
import { useActiveServices } from '../../hooks/useActiveServices';
import { getApiErrorMessage } from '../../lib/apiError';
import { useAuth } from '../../store/AuthContext';

type RequestedService = {
    id: string;
    name: string;
};

const services = Object.values(SERVICE_CATALOG);

const statusMeta: Record<ApprovalStatus, { label: string; className: string }> = {
    PENDING: {
        label: 'Bekliyor',
        className: 'border-amber-500/20 bg-amber-500/10 text-amber-300',
    },
    APPROVED: {
        label: 'Onaylandı',
        className: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300',
    },
    REJECTED: {
        label: 'Reddedildi',
        className: 'border-red-500/20 bg-red-500/10 text-red-300',
    },
};

function parseRequestedServices(metadata: string | null | undefined): RequestedService[] {
    if (!metadata) return [];
    try {
        const parsed = JSON.parse(metadata) as { services?: unknown };
        if (!Array.isArray(parsed.services)) return [];
        return parsed.services.filter((service): service is RequestedService => (
            typeof service === 'object'
            && service !== null
            && typeof (service as RequestedService).id === 'string'
            && typeof (service as RequestedService).name === 'string'
        ));
    } catch {
        return [];
    }
}

function formatRequestDate(value: string) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

export default function ServicesPage() {
    const { user } = useAuth();
    const { activeServices } = useActiveServices();
    const [selected, setSelected] = useState<ServiceCategory[]>([]);
    const [note, setNote] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [requests, setRequests] = useState<ApprovalRequestResponse[]>([]);
    const [isHistoryLoading, setIsHistoryLoading] = useState(false);
    const [historyError, setHistoryError] = useState('');

    useEffect(() => {
        if (!user?.companyId) return;

        let cancelled = false;
        setIsHistoryLoading(true);
        setHistoryError('');
        approvalApi.listAdditionalServices(user.companyId)
            .then(data => {
                if (!cancelled) setRequests(data);
            })
            .catch(error => {
                if (!cancelled) {
                    setHistoryError(getApiErrorMessage(error, 'Hizmet talepleri yüklenemedi.'));
                }
            })
            .finally(() => {
                if (!cancelled) setIsHistoryLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [user?.companyId]);

    const pendingServices = useMemo(() => new Set(
        requests
            .filter(request => request.status === 'PENDING')
            .flatMap(request => parseRequestedServices(request.metadata))
            .map(service => service.id),
    ), [requests]);

    const submitRequest = async () => {
        if (!user?.companyId) {
            setSubmitError('Şirket bilgisi bulunamadı. Lütfen hesabınızı kontrol edin.');
            return;
        }

        setIsSubmitting(true);
        setSubmitError('');
        try {
            const selectedServices = selected.map(category => ({
                id: category,
                name: SERVICE_CATALOG[category].label,
            }));
            const created = await approvalApi.create({
                type: 'GENERAL',
                companyId: user.companyId,
                title: 'Ek Hizmet Talebi',
                description: note.trim() || undefined,
                metadata: JSON.stringify({
                    kind: 'ADDITIONAL_SERVICE',
                    services: selectedServices,
                }),
            });
            setRequests(current => [created, ...current.filter(request => request.id !== created.id)]);
            setSubmitted(true);
        } catch (error) {
            setSubmitError(getApiErrorMessage(error, 'Ek hizmet talebi gönderilemedi. Lütfen tekrar deneyin.'));
        } finally {
            setIsSubmitting(false);
        }
    };

    if (submitted) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <div className="space-y-4 text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-pink-500/10">
                        <CheckCircle2 className="h-8 w-8 text-pink-400" />
                    </div>
                    <h2 className="text-xl font-bold text-white">Talebiniz Alındı!</h2>
                    <p className="mx-auto max-w-md text-sm text-zinc-500">
                        Ek hizmet talebiniz ajans ekibine iletildi. Durumunu bu sayfadaki Taleplerim alanından takip edebilirsiniz.
                    </p>
                    <button
                        type="button"
                        onClick={() => {
                            setSubmitted(false);
                            setSelected([]);
                            setNote('');
                            setSubmitError('');
                        }}
                        className="rounded-lg bg-[#C8697A]/10 px-4 py-2 text-sm font-medium text-[#F5BEC8] transition-colors hover:bg-[#C8697A]/20"
                    >
                        Taleplerime Dön
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white">Ek Hizmetler</h1>
                <p className="mt-1 text-sm text-zinc-500">Paketinize eklemek istediğiniz hizmetleri seçip ajans ekibine iletin.</p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {services.map(service => {
                    const isActive = activeServices.includes(service.category);
                    const isPending = pendingServices.has(service.category);
                    const isSelected = selected.includes(service.category);
                    const isUnavailable = isActive || isPending;
                    const stateLabel = isActive
                        ? 'Aktif'
                        : isPending
                            ? 'Talep bekliyor'
                            : isSelected
                                ? 'Seçildi'
                                : 'Kullanılabilir';
                    const Icon = service.icon;

                    return (
                        <button
                            key={service.category}
                            type="button"
                            aria-label={`${service.label} — ${stateLabel}`}
                            aria-pressed={isSelected}
                            disabled={isUnavailable}
                            onClick={() => setSelected(current => (
                                isSelected
                                    ? current.filter(category => category !== service.category)
                                    : [...current, service.category]
                            ))}
                            className={`h-full w-full touch-manipulation rounded-xl border p-4 text-left transition-all [&>*]:pointer-events-none ${isUnavailable
                                ? 'cursor-not-allowed border-white/[0.05] bg-white/[0.02] opacity-65'
                                : isSelected
                                    ? 'cursor-pointer border-[#C8697A]/40 bg-[#C8697A]/10 ring-1 ring-[#C8697A]/30'
                                    : 'cursor-pointer border-white/[0.06] bg-[#0C0C0E] hover:bg-white/[0.02]'
                            }`}
                        >
                            <span className="flex items-start justify-between gap-3">
                                <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.03]">
                                    <Icon className={`h-5 w-5 ${isSelected ? 'text-[#F5BEC8]' : 'text-zinc-400'}`} />
                                </span>
                                <span className={`rounded-full border px-2 py-1 text-[10px] font-semibold ${isActive
                                    ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300'
                                    : isPending
                                        ? 'border-amber-500/20 bg-amber-500/10 text-amber-300'
                                        : isSelected
                                            ? 'border-[#C8697A]/30 bg-[#C8697A]/10 text-[#F5BEC8]'
                                            : 'border-white/[0.06] bg-white/[0.03] text-zinc-500'
                                }`}
                                >
                                    {stateLabel}
                                </span>
                            </span>
                            <h3 className={`mt-3 text-sm font-semibold ${isSelected ? 'text-[#F5BEC8]' : 'text-white'}`}>
                                {service.label}
                            </h3>
                            <p className="mt-1 text-xs leading-relaxed text-zinc-500">{service.description}</p>
                        </button>
                    );
                })}
            </div>

            {selected.length > 0 && (
                <div className="space-y-4 rounded-2xl border border-white/[0.06] bg-[#0C0C0E] p-5">
                    <textarea
                        value={note}
                        onChange={event => setNote(event.target.value)}
                        maxLength={2000}
                        placeholder="Ek notlarınız veya detaylar..."
                        rows={3}
                        className="w-full resize-none rounded-xl border border-white/[0.06] bg-[#18181b]/60 px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:border-[#C8697A]/40 focus:outline-none"
                    />
                    {submitError && (
                        <div role="alert" className="flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/8 px-3 py-2.5 text-xs text-red-300">
                            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                            <span>{submitError}</span>
                        </div>
                    )}
                    <div className="flex items-center justify-between gap-3">
                        <p className="text-sm text-zinc-500">{selected.length} hizmet seçildi</p>
                        <button
                            type="button"
                            onClick={submitRequest}
                            disabled={isSubmitting}
                            className="flex items-center gap-2 rounded-xl bg-[#C8697A] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#C8697A]/25 transition-colors hover:bg-[#B5556A] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                            {isSubmitting ? 'Gönderiliyor...' : 'Talep Gönder'}
                        </button>
                    </div>
                </div>
            )}

            <section className="rounded-2xl border border-white/[0.06] bg-[#0C0C0E] p-5" aria-labelledby="service-request-history">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <h2 id="service-request-history" className="text-base font-semibold text-white">Taleplerim</h2>
                        <p className="mt-1 text-xs text-zinc-500">Ek hizmet taleplerinizin güncel durumu</p>
                    </div>
                    <Clock3 className="h-5 w-5 text-zinc-600" />
                </div>

                {isHistoryLoading ? (
                    <div className="mt-4 flex items-center gap-2 text-xs text-zinc-500">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Talepler yükleniyor...
                    </div>
                ) : historyError ? (
                    <div role="alert" className="mt-4 flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/8 px-3 py-2.5 text-xs text-red-300">
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                        <span>{historyError}</span>
                    </div>
                ) : requests.length === 0 ? (
                    <p className="mt-4 rounded-xl border border-dashed border-white/[0.06] px-4 py-5 text-center text-xs text-zinc-600">
                        Henüz ek hizmet talebiniz bulunmuyor.
                    </p>
                ) : (
                    <div className="mt-4 space-y-3">
                        {requests.map(request => {
                            const requestStatus = statusMeta[request.status] ?? statusMeta.PENDING;
                            const requestedServices = parseRequestedServices(request.metadata);
                            return (
                                <article key={request.id} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                        <div>
                                            <p className="text-sm font-medium text-zinc-200">
                                                {requestedServices.map(service => service.name).join(', ') || 'Ek hizmet talebi'}
                                            </p>
                                            <p className="mt-1 flex items-center gap-1.5 text-[11px] text-zinc-600">
                                                <CalendarDays className="h-3 w-3" />
                                                {formatRequestDate(request.createdAt)}
                                            </p>
                                        </div>
                                        <span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold ${requestStatus.className}`}>
                                            {requestStatus.label}
                                        </span>
                                    </div>
                                    {request.reviewNote && (
                                        <p className="mt-3 border-t border-white/[0.05] pt-3 text-xs leading-relaxed text-zinc-500">
                                            Ajans notu: {request.reviewNote}
                                        </p>
                                    )}
                                </article>
                            );
                        })}
                    </div>
                )}
            </section>
        </div>
    );
}
