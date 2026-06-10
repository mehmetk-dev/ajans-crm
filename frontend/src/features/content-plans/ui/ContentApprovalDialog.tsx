import { useState } from 'react';
import { Calendar, Camera, CheckCircle2, Clock, Loader2, MapPin, X } from 'lucide-react';
import type { ShootResponse } from '../../shoots';
import type { ContentApprovalDetails } from '../api/contentPlan.types';

interface ContentApprovalDialogProps {
    shoots: ShootResponse[];
    isLoading?: boolean;
    onClose: () => void;
    onSubmit: (details: ContentApprovalDetails) => void;
}

export function ContentApprovalDialog({
    shoots,
    isLoading = false,
    onClose,
    onSubmit,
}: ContentApprovalDialogProps) {
    const [mode, setMode] = useState<'existing' | 'new'>(shoots.length ? 'existing' : 'new');
    const [existingShootId, setExistingShootId] = useState('');
    const [shootTitle, setShootTitle] = useState('');
    const [shootDescription, setShootDescription] = useState('');
    const [shootDate, setShootDate] = useState('');
    const [shootTime, setShootTime] = useState('');
    const [location, setLocation] = useState('');

    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        if (mode === 'existing') {
            if (existingShootId) onSubmit({ existingShootId });
            return;
        }
        if (!shootTitle.trim()) return;
        onSubmit({
            shootTitle: shootTitle.trim(),
            shootDescription: shootDescription.trim() || undefined,
            shootDate: shootDate || undefined,
            shootTime: shootTime || undefined,
            location: location.trim() || undefined,
        });
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
            onClick={onClose}>
            <form onSubmit={submit}
                className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-white/[0.08] bg-[#0D0D0F] p-6"
                onClick={event => event.stopPropagation()}>
                <div className="mb-5 flex items-center justify-between">
                    <h3 className="flex items-center gap-2 text-base font-bold text-white">
                        <Camera className="h-4 w-4 text-emerald-400" /> Onayla ve Çekim Seç
                    </h3>
                    <button type="button" onClick={onClose} className="text-zinc-500 hover:text-white">
                        <X className="h-4 w-4" />
                    </button>
                </div>
                <div className="mb-4 flex gap-2">
                    <ModeButton active={mode === 'existing'} onClick={() => setMode('existing')}>
                        Mevcut Çekim
                    </ModeButton>
                    <ModeButton active={mode === 'new'} onClick={() => setMode('new')}>
                        Yeni Çekim
                    </ModeButton>
                </div>
                {mode === 'existing' ? (
                    <div className="space-y-2">
                        {shoots.length === 0 ? (
                            <button type="button" onClick={() => setMode('new')}
                                className="w-full rounded-xl border border-dashed border-white/[0.08] p-8 text-sm text-zinc-500">
                                Planlanan çekim yok. Yeni çekim oluştur.
                            </button>
                        ) : shoots.map(shoot => (
                            <button key={shoot.id} type="button" onClick={() => setExistingShootId(shoot.id)}
                                className={`w-full rounded-xl border p-3 text-left ${existingShootId === shoot.id ? 'border-violet-500/40 bg-violet-500/10' : 'border-white/[0.06] bg-white/[0.02]'}`}>
                                <p className="text-sm font-medium text-white">{shoot.title}</p>
                                <div className="mt-1 flex flex-wrap gap-3 text-[10px] text-zinc-500">
                                    {shoot.shootDate && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(shoot.shootDate).toLocaleDateString('tr-TR')}</span>}
                                    {shoot.shootTime && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{shoot.shootTime.slice(0, 5)}</span>}
                                    {shoot.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{shoot.location}</span>}
                                </div>
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-3">
                        <Field label="Çekim Başlığı *">
                            <input required value={shootTitle} onChange={event => setShootTitle(event.target.value)}
                                className={inputClass} />
                        </Field>
                        <Field label="Açıklama">
                            <textarea rows={2} value={shootDescription}
                                onChange={event => setShootDescription(event.target.value)} className={inputClass} />
                        </Field>
                        <div className="grid grid-cols-2 gap-3">
                            <Field label="Tarih">
                                <input type="date" value={shootDate}
                                    onChange={event => setShootDate(event.target.value)} className={inputClass} />
                            </Field>
                            <Field label="Saat">
                                <input type="time" value={shootTime}
                                    onChange={event => setShootTime(event.target.value)} className={inputClass} />
                            </Field>
                        </div>
                        <Field label="Lokasyon">
                            <input value={location} onChange={event => setLocation(event.target.value)}
                                className={inputClass} />
                        </Field>
                    </div>
                )}
                <div className="mt-5 flex gap-2 border-t border-white/[0.06] pt-4">
                    <button disabled={isLoading || (mode === 'existing' ? !existingShootId : !shootTitle.trim())}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-xs font-semibold text-white disabled:opacity-40">
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                        Onaya Gönder
                    </button>
                    <button type="button" onClick={onClose}
                        className="rounded-xl border border-white/[0.08] px-4 py-3 text-xs text-zinc-400">
                        İptal
                    </button>
                </div>
            </form>
        </div>
    );
}

const inputClass = 'w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-xs text-white focus:border-violet-500/50 focus:outline-none';

function ModeButton({ active, onClick, children }: {
    active: boolean;
    onClick: () => void;
    children: React.ReactNode;
}) {
    return <button type="button" onClick={onClick} className={`flex-1 rounded-xl border py-2.5 text-xs font-semibold ${active ? 'border-violet-500/30 bg-violet-500/10 text-violet-400' : 'border-white/[0.06] text-zinc-500'}`}>{children}</button>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return <label className="block"><span className="mb-1 block text-[10px] uppercase text-zinc-500">{label}</span>{children}</label>;
}
