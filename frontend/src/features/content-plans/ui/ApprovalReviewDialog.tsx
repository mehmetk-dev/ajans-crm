import { useState } from 'react';
import { CheckCircle2, Loader2, MapPin, Plus, Trash2, X } from 'lucide-react';
import type { AssignableUser } from '../../tasks';
import type { ApprovalRequestResponse, ReviewApprovalInput } from '../api/contentPlan.types';
import { parseContentApprovalMetadata } from '../model/approvalMetadata';
import { UserAvatar } from '../../../components/UserAvatar';

interface ApprovalReviewDialogProps {
    request: ApprovalRequestResponse;
    staffMembers: AssignableUser[];
    isLoading?: boolean;
    onClose: () => void;
    onApprove: (input: ReviewApprovalInput) => void;
}

interface EquipmentRow {
    name: string;
    quantity: number;
    notes: string;
}

export function ApprovalReviewDialog({
    request,
    staffMembers,
    isLoading = false,
    onClose,
    onApprove,
}: ApprovalReviewDialogProps) {
    const metadata = parseContentApprovalMetadata(request.metadata);
    const [shootTitle, setShootTitle] = useState(metadata.shootTitle ?? '');
    const [shootDescription, setShootDescription] = useState(metadata.shootDescription ?? '');
    const [shootDate, setShootDate] = useState(metadata.shootDate ?? '');
    const [shootTime, setShootTime] = useState(metadata.shootTime ?? '');
    const [location, setLocation] = useState(metadata.location ?? '');
    const [photographerId, setPhotographerId] = useState('');
    const [notes, setNotes] = useState('');
    const [reviewNote, setReviewNote] = useState('');
    const [equipment, setEquipment] = useState<EquipmentRow[]>([]);

    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        if (request.type !== 'CONTENT_APPROVAL') {
            onApprove({ note: reviewNote.trim() || undefined });
            return;
        }
        if (metadata.existingShootId) {
            onApprove({ existingShootId: metadata.existingShootId });
            return;
        }
        onApprove({
            shootTitle,
            shootDescription: shootDescription || undefined,
            shootDate: shootDate || undefined,
            shootTime: shootTime || undefined,
            location: location || undefined,
            photographerId: photographerId || undefined,
            notes: notes || undefined,
            equipment: equipment.filter(item => item.name.trim()),
        });
    };

    const updateEquipment = (
        index: number,
        field: keyof EquipmentRow,
        value: string | number,
    ) => setEquipment(current => current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item));

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            onClick={onClose}>
            <form onSubmit={submit}
                className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/[0.08] bg-[#111113]"
                onClick={event => event.stopPropagation()}>
                <header className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
                    <div>
                        <h3 className="text-base font-bold text-white">
                            {request.type === 'CONTENT_APPROVAL' ? 'Çekim Onay Formu' : 'İsteği Onayla'}
                        </h3>
                        <div className="mt-1 flex items-center gap-1.5 text-[11px] text-zinc-500">
                            <span>{request.companyName}</span>
                            <span>·</span>
                            <UserAvatar name={request.requestedByName} avatarUrl={request.requestedByAvatarUrl} className="h-4 w-4 rounded text-[8px]" />
                            <span>{request.requestedByName}</span>
                        </div>
                    </div>
                    <button type="button" onClick={onClose} className="text-zinc-500 hover:text-white">
                        <X className="h-4 w-4" />
                    </button>
                </header>
                {request.type !== 'CONTENT_APPROVAL' ? (
                    <div className="space-y-4 p-5">
                        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                            <p className="text-sm font-semibold text-white">{request.title}</p>
                            {request.description && <p className="mt-1 text-xs text-zinc-400">{request.description}</p>}
                        </div>
                        <label>
                            <span className="mb-1 block text-[10px] uppercase text-zinc-500">Sonuç Notu</span>
                            <textarea
                                rows={3}
                                maxLength={2000}
                                value={reviewNote}
                                onChange={event => setReviewNote(event.target.value)}
                                placeholder="Müşteriye iletilecek not..."
                                className={inputClass}
                            />
                        </label>
                        <Actions isLoading={isLoading} onClose={onClose} />
                    </div>
                ) : metadata.existingShootId ? (
                    <div className="space-y-4 p-5">
                        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                            <p className="text-sm font-medium text-emerald-400">Mevcut çekime bağlanacak</p>
                            <p className="mt-1 text-xs text-zinc-500">
                                Onaylandığında içerik planı seçilen çekime bağlanır.
                            </p>
                        </div>
                        <Actions isLoading={isLoading} onClose={onClose} />
                    </div>
                ) : (
                    <div className="space-y-4 p-5">
                        <div className="grid grid-cols-2 gap-3">
                            <Field label="Çekim Başlığı *" wide>
                                <input required value={shootTitle}
                                    onChange={event => setShootTitle(event.target.value)} className={inputClass} />
                            </Field>
                            <Field label="Tarih">
                                <input type="date" value={shootDate}
                                    onChange={event => setShootDate(event.target.value)} className={inputClass} />
                            </Field>
                            <Field label="Saat">
                                <input type="time" value={shootTime}
                                    onChange={event => setShootTime(event.target.value)} className={inputClass} />
                            </Field>
                            <Field label="Konum" wide>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-500" />
                                    <input value={location} onChange={event => setLocation(event.target.value)}
                                        className={`${inputClass} pl-8`} />
                                </div>
                            </Field>
                            <Field label="Açıklama" wide>
                                <textarea rows={2} value={shootDescription}
                                    onChange={event => setShootDescription(event.target.value)} className={inputClass} />
                            </Field>
                            <Field label="Çekimci" wide>
                                <select value={photographerId}
                                    onChange={event => setPhotographerId(event.target.value)} className={inputClass}>
                                    <option value="">Seçiniz</option>
                                    {staffMembers.map(member => (
                                        <option key={member.id} value={member.id}>{member.fullName}</option>
                                    ))}
                                </select>
                            </Field>
                            <Field label="Notlar" wide>
                                <textarea rows={2} value={notes}
                                    onChange={event => setNotes(event.target.value)} className={inputClass} />
                            </Field>
                        </div>
                        <div>
                            <div className="mb-2 flex items-center justify-between">
                                <span className="text-[10px] uppercase text-zinc-500">Ekipmanlar</span>
                                <button type="button"
                                    onClick={() => setEquipment(current => [...current, { name: '', quantity: 1, notes: '' }])}
                                    className="flex items-center gap-1 text-[10px] text-violet-400">
                                    <Plus className="h-3 w-3" /> Ekle
                                </button>
                            </div>
                            <div className="space-y-2">
                                {equipment.map((item, index) => (
                                    <div key={index} className="flex gap-2">
                                        <input value={item.name}
                                            onChange={event => updateEquipment(index, 'name', event.target.value)}
                                            placeholder="Ekipman" className={`${inputClass} flex-1`} />
                                        <input type="number" min={1} value={item.quantity}
                                            onChange={event => updateEquipment(index, 'quantity', Number(event.target.value) || 1)}
                                            className={`${inputClass} w-16`} />
                                        <button type="button"
                                            onClick={() => setEquipment(current => current.filter((_, i) => i !== index))}
                                            className="text-zinc-500 hover:text-red-400">
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <Actions isLoading={isLoading} onClose={onClose} />
                    </div>
                )}
            </form>
        </div>
    );
}

const inputClass = 'w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs text-white focus:border-violet-500/50 focus:outline-none';

function Field({ label, wide = false, children }: {
    label: string;
    wide?: boolean;
    children: React.ReactNode;
}) {
    return <label className={wide ? 'col-span-2' : ''}><span className="mb-1 block text-[10px] uppercase text-zinc-500">{label}</span>{children}</label>;
}

function Actions({ isLoading, onClose }: { isLoading: boolean; onClose: () => void }) {
    return (
        <div className="flex gap-2 border-t border-white/[0.06] pt-4">
            <button disabled={isLoading}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2.5 text-xs font-semibold text-emerald-400 disabled:opacity-50">
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                Onayla
            </button>
            <button type="button" onClick={onClose}
                className="rounded-xl border border-white/[0.08] px-4 py-2.5 text-xs text-zinc-400">
                İptal
            </button>
        </div>
    );
}
