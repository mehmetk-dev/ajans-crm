import { useState, useId, type FormEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Trash2 } from 'lucide-react';
import { companyApi, companyKeys } from '../../company';
import { taskApi, taskKeys } from '../../tasks';
import { useCreatePrProject } from '../hooks/usePrProjects';
import {
    prProjectFormSchema,
    type PrProjectFormValues,
} from '../model/prProject.schema';
import { PrProjectMemberSelector } from './PrProjectMemberSelector';

interface PrProjectFormProps {
    onSuccess?: () => void;
}

const inputClass =
    'w-full px-3 py-2 bg-[#18181b]/60 border border-white/[0.06] rounded-lg text-sm text-white outline-none focus:border-orange-500/50';
const labelClass =
    'text-[10px] font-bold text-zinc-500 uppercase tracking-widest';

function emptyPhase(index: number) {
    return {
        name: `Faz ${index}`,
        assignedToId: '',
        startDate: '',
        endDate: '',
        notes: '',
    };
}

const initialForm: PrProjectFormValues = {
    name: '',
    companyId: '',
    responsibleId: '',
    purpose: '',
    startDate: '',
    endDate: '',
    notes: '',
    memberIds: [],
    phases: [emptyPhase(1), emptyPhase(2), emptyPhase(3)],
};

export function PrProjectForm({ onSuccess }: PrProjectFormProps) {
    const id = useId();
    const [form, setForm] = useState<PrProjectFormValues>(initialForm);
    const [error, setError] = useState<string | null>(null);
    const createMutation = useCreatePrProject();
    const companyId = form.companyId || undefined;

    const { data: companies = [] } = useQuery({
        queryKey: companyKeys.staffList(),
        queryFn: companyApi.listStaffAccessible,
    });
    const { data: users = [] } = useQuery({
        queryKey: taskKeys.assignableUsers(companyId),
        queryFn: () => taskApi.listAssignableUsers(companyId),
    });

    const updatePhase = (
        index: number,
        field: keyof PrProjectFormValues['phases'][number],
        value: string,
    ) => {
        setForm(current => ({
            ...current,
            phases: current.phases.map((phase, phaseIndex) =>
                phaseIndex === index ? { ...phase, [field]: value } : phase),
        }));
    };

    const handleSubmit = (event: FormEvent) => {
        event.preventDefault();
        const result = prProjectFormSchema.safeParse(form);
        if (!result.success) {
            setError(result.error.issues[0]?.message ?? 'Formu kontrol edin');
            return;
        }
        setError(null);
        createMutation.mutate({
            ...result.data,
            totalPhases: result.data.phases.length,
        }, {
            onSuccess: () => {
                setForm(initialForm);
                onSuccess?.();
            },
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor={`${id}-name`} className={labelClass}>Proje Adı *</label>
                <input
                    id={`${id}-name`}
                    value={form.name}
                    onChange={event => setForm(current => ({
                        ...current,
                        name: event.target.value,
                    }))}
                    className={inputClass}
                    placeholder="Proje adı..."
                />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                    <label htmlFor={`${id}-company`} className={labelClass}>Şirket</label>
                    <select
                        id={`${id}-company`}
                        value={form.companyId}
                        onChange={event => setForm(current => ({
                            ...current,
                            companyId: event.target.value,
                            responsibleId: '',
                            memberIds: [],
                            phases: current.phases.map(phase => ({
                                ...phase,
                                assignedToId: '',
                            })),
                        }))}
                        className={inputClass}
                    >
                        <option value="">Ajans içi</option>
                        {companies.map(company => (
                            <option key={company.id} value={company.id}>{company.name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor={`${id}-responsible`} className={labelClass}>Sorumlu Kişi</label>
                    <select
                        id={`${id}-responsible`}
                        value={form.responsibleId}
                        onChange={event => setForm(current => ({
                            ...current,
                            responsibleId: event.target.value,
                        }))}
                        className={inputClass}
                    >
                        <option value="">Kişi seçin</option>
                        {users.map(user => (
                            <option key={user.id} value={user.id}>{user.fullName}</option>
                        ))}
                    </select>
                </div>
            </div>

            <textarea
                value={form.purpose}
                onChange={event => setForm(current => ({
                    ...current,
                    purpose: event.target.value,
                }))}
                className={`${inputClass} resize-none`}
                rows={2}
                placeholder="Amaç / açıklama"
            />

            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label htmlFor={`${id}-startdate`} className="sr-only">Başlangıç tarihi</label>
                    <input
                        id={`${id}-startdate`}
                        type="date"
                        value={form.startDate}
                        onChange={event => setForm(current => ({
                            ...current,
                            startDate: event.target.value,
                        }))}
                        className={inputClass}
                    />
                </div>
                <div>
                    <label htmlFor={`${id}-enddate`} className="sr-only">Bitiş tarihi</label>
                    <input
                        id={`${id}-enddate`}
                        type="date"
                        value={form.endDate}
                        onChange={event => setForm(current => ({
                            ...current,
                            endDate: event.target.value,
                        }))}
                        className={inputClass}
                    />
                </div>
            </div>

            <label htmlFor={`${id}-notes`} className="sr-only">Proje notları</label>
            <textarea
                id={`${id}-notes`}
                value={form.notes}
                onChange={event => setForm(current => ({
                    ...current,
                    notes: event.target.value,
                }))}
                className={`${inputClass} resize-none`}
                rows={2}
                placeholder="Proje notları"
            />

            <PrProjectMemberSelector
                users={users}
                selectedIds={form.memberIds}
                onChange={memberIds => setForm(current => ({ ...current, memberIds }))}
            />

            <div className="border-t border-white/[0.06] pt-4 space-y-3">
                <div className="flex items-center justify-between">
                    <label className={labelClass}>Proje Fazları ({form.phases.length})</label>
                    <button
                        type="button"
                        onClick={() => setForm(current => ({
                            ...current,
                            phases: [...current.phases, emptyPhase(current.phases.length + 1)],
                        }))}
                        className="text-xs text-orange-400 hover:text-orange-300"
                    >
                        + Faz ekle
                    </button>
                </div>
                {form.phases.map((phase, index) => (
                    <div
                        key={index}
                        className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-3 space-y-2"
                    >
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-orange-400">
                                Faz {index + 1}
                            </span>
                            <input
                                value={phase.name}
                                onChange={event => updatePhase(index, 'name', event.target.value)}
                                className={`${inputClass} flex-1`}
                                placeholder="Faz adı"
                            />
                            {form.phases.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => setForm(current => ({
                                        ...current,
                                        phases: current.phases.filter((_, itemIndex) =>
                                            itemIndex !== index),
                                    }))}
                                    className="text-zinc-600 hover:text-red-400"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                        <select
                            value={phase.assignedToId}
                            onChange={event =>
                                updatePhase(index, 'assignedToId', event.target.value)}
                            className={inputClass}
                        >
                            <option value="">Atanan kişi</option>
                            {users.map(user => (
                                <option key={user.id} value={user.id}>{user.fullName}</option>
                            ))}
                        </select>
                        <div className="grid grid-cols-2 gap-2">
                            <input
                                type="date"
                                value={phase.startDate}
                                onChange={event =>
                                    updatePhase(index, 'startDate', event.target.value)}
                                className={inputClass}
                            />
                            <input
                                type="date"
                                value={phase.endDate}
                                onChange={event =>
                                    updatePhase(index, 'endDate', event.target.value)}
                                className={inputClass}
                            />
                        </div>
<label htmlFor={`${id}-purpose`} className="sr-only">Amaç / açıklama</label>
            <textarea
                id={`${id}-purpose`}
                            value={phase.notes}
                            onChange={event => updatePhase(index, 'notes', event.target.value)}
                            className={`${inputClass} resize-none`}
                            rows={1}
                            placeholder="Faz notu"
                        />
                    </div>
                ))}
            </div>

            {error && <p className="text-xs text-red-400">{error}</p>}
            {createMutation.isError && (
                <p className="text-xs text-red-400">Proje oluşturulamadı.</p>
            )}
            <button
                type="submit"
                disabled={createMutation.isPending}
                className="w-full py-2.5 bg-orange-500 text-white rounded-xl text-sm font-bold hover:bg-orange-600 disabled:opacity-50"
            >
                {createMutation.isPending ? 'Oluşturuluyor...' : 'Proje Oluştur'}
            </button>
        </form>
    );
}
