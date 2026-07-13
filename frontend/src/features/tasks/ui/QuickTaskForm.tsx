import { useState, useId, useRef } from 'react';
import type { CompanyResponse } from '../../company';
import { taskApi } from '../api/taskApi';
import type { AssignableUser, TaskCategory } from '../api/task.types';
import { TASK_CATEGORY_LABELS } from '../model/task.constants';

interface Props {
    companies: CompanyResponse[];
    users: AssignableUser[];
    companyId: string;
    setCompanyId: (value: string) => void;
    loading: boolean;
    setLoading: (value: boolean) => void;
    onDone: () => void;
}

const inputClass = 'w-full mt-1 px-4 py-2.5 bg-[#18181b]/60 border border-white/[0.06] rounded-xl text-sm text-white outline-none focus:border-pink-500/50 transition-colors';
const labelClass = 'text-[10px] font-bold text-zinc-500 uppercase tracking-widest';

export function QuickTaskForm({
    companies,
    users,
    companyId,
    setCompanyId,
    loading,
    setLoading,
    onDone,
}: Props) {
    const fid = useId();
    const submittingRef = useRef(false);
    const [form, setForm] = useState({
        assignedToId: '',
        title: '',
        description: '',
        category: 'OTHER' as TaskCategory,
        startDate: '',
        startTime: '',
        endDate: '',
        endTime: '',
    });

    async function submit(event: React.FormEvent) {
        event.preventDefault();
        if (submittingRef.current || !form.assignedToId || !form.title.trim()) return;
        submittingRef.current = true;
        setLoading(true);
        try {
            await taskApi.create({
                ...form,
                companyId: companyId || undefined,
                startDate: form.startDate ? new Date(form.startDate).toISOString() : undefined,
                startTime: form.startTime || undefined,
                endDate: form.endDate ? new Date(form.endDate).toISOString() : undefined,
                endTime: form.endTime || undefined,
            });
            onDone();
            window.location.reload();
        } catch {
            // Keep the form open so the user can retry.
        } finally {
            submittingRef.current = false;
            setLoading(false);
        }
    }

    return (
        <form onSubmit={submit} className="space-y-4">
            <Field label="Görev Başlığı *" fieldId={`${fid}-qtitle`}>
                <input id={`${fid}-qtitle`} value={form.title}
                    onChange={event => setForm(current => ({ ...current, title: event.target.value }))}
                    className={inputClass} required />
            </Field>
            <Field label="Atanan Kişi *" fieldId={`${fid}-qassignee`}>
                <select id={`${fid}-qassignee`} value={form.assignedToId}
                    onChange={event => setForm(current => ({ ...current, assignedToId: event.target.value }))}
                    className={inputClass} required>
                    <option value="">Kişi seçiniz</option>
                    {users.map(user => <option key={user.id} value={user.id}>{user.fullName}</option>)}
                </select>
            </Field>
            <Field label="Şirket" fieldId={`${fid}-qcompany`}>
                <select id={`${fid}-qcompany`} value={companyId} onChange={event => setCompanyId(event.target.value)} className={inputClass}>
                    <option value="">Ajans İçi</option>
                    {companies.map(company => <option key={company.id} value={company.id}>{company.name}</option>)}
                </select>
            </Field>
            <Field label="Açıklama" fieldId={`${fid}-qdesc`}>
                <textarea id={`${fid}-qdesc`} value={form.description}
                    onChange={event => setForm(current => ({ ...current, description: event.target.value }))}
                    className={`${inputClass} resize-none`} rows={3} />
            </Field>
            <Field label="Kategori" fieldId={`${fid}-qcat`}>
                <select id={`${fid}-qcat`} value={form.category}
                    onChange={event => setForm(current => ({
                        ...current,
                        category: event.target.value as TaskCategory,
                    }))}
                    className={inputClass}>
                    {Object.entries(TASK_CATEGORY_LABELS).map(([value, label]) =>
                        <option key={value} value={value}>{label}</option>)}
                </select>
            </Field>
            <div className="grid grid-cols-2 gap-4">
                <Input type="date" label="Başlangıç Tarihi" fieldId={`${fid}-qsdate`} value={form.startDate}
                    onChange={value => setForm(current => ({ ...current, startDate: value }))} />
                <Input type="time" label="Başlangıç Saati" fieldId={`${fid}-qstime`} value={form.startTime}
                    onChange={value => setForm(current => ({ ...current, startTime: value }))} />
                <Input type="date" label="Bitiş Tarihi" fieldId={`${fid}-qedate`} value={form.endDate}
                    onChange={value => setForm(current => ({ ...current, endDate: value }))} />
                <Input type="time" label="Bitiş Saati" fieldId={`${fid}-qetime`} value={form.endTime}
                    onChange={value => setForm(current => ({ ...current, endTime: value }))} />
            </div>
            <button type="submit" disabled={loading}
                className="w-full py-3 bg-pink-600 hover:bg-pink-500 text-white rounded-xl text-sm font-bold disabled:opacity-50">
                {loading ? 'Oluşturuluyor...' : 'Görev Oluştur'}
            </button>
        </form>
    );
}

function Field({ label, fieldId, children }: { label: string; fieldId?: string; children: React.ReactNode }) {
    return (
        <div>
            <label htmlFor={fieldId} className={labelClass}>{label}</label>
            {children}
        </div>
    );
}

function Input({
    type,
    label,
    fieldId,
    value,
    onChange,
}: {
    type: 'date' | 'time';
    label: string;
    fieldId?: string;
    value: string;
    onChange: (value: string) => void;
}) {
    return (
        <Field label={label} fieldId={fieldId}>
            <input id={fieldId} type={type} value={value}
                onChange={event => onChange(event.target.value)} className={inputClass} />
        </Field>
    );
}
