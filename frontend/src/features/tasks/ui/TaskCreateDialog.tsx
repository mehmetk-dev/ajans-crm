import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import type { CompanyResponse } from '../../company';
import type { CreateTaskInput, TaskCategory, TaskResponse } from '../api/task.types';
import { useAssignableUsers, useCreateTask } from '../hooks/useTasks';
import { TASK_CATEGORY_LABELS } from '../model/task.constants';

interface Props {
    open: boolean;
    companies: CompanyResponse[];
    onClose: () => void;
    onCreated?: (task: TaskResponse) => void;
}

const emptyForm = (): CreateTaskInput => ({
    assignedToId: '',
    title: '',
    description: '',
    category: 'OTHER',
});

const inputClass = 'w-full mt-1 px-4 py-2.5 bg-[#18181b]/60 border border-white/[0.06] rounded-xl text-sm text-white outline-none focus:border-pink-500/50 transition-colors';

export function TaskCreateDialog({ open, companies, onClose, onCreated }: Props) {
    const [form, setForm] = useState<CreateTaskInput>(emptyForm);
    const { data: users = [] } = useAssignableUsers(form.companyId);
    const createTask = useCreateTask();

    function close() {
        setForm(emptyForm());
        onClose();
    }

    function submit(event: React.FormEvent) {
        event.preventDefault();
        if (!form.assignedToId || !form.title.trim()) return;
        createTask.mutate(form, {
            onSuccess: task => {
                onCreated?.(task);
                close();
            },
        });
    }

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    onClick={close}
                >
                    <motion.div
                        initial={{ scale: 0.95 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0.95 }}
                        className="bg-[#0C0C0E] border border-white/[0.08] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
                        onClick={event => event.stopPropagation()}
                    >
                        <div className="flex items-center justify-between p-6 border-b border-white/[0.06]">
                            <h3 className="text-lg font-bold text-white">Yeni Görev</h3>
                            <button onClick={close} className="text-zinc-500 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={submit} className="p-6 space-y-4">
                            <Field label="Görev Başlığı *">
                                <input
                                    value={form.title}
                                    onChange={event => setForm(current => ({ ...current, title: event.target.value }))}
                                    className={inputClass}
                                    placeholder="Görev başlığı..."
                                    required
                                />
                            </Field>
                            <Field label="Atanan Kişi *">
                                <select
                                    value={form.assignedToId}
                                    onChange={event => setForm(current => ({ ...current, assignedToId: event.target.value }))}
                                    className={inputClass}
                                    required
                                >
                                    <option value="">Kişi seçiniz</option>
                                    {users.map(user => (
                                        <option key={user.id} value={user.id}>{user.fullName}</option>
                                    ))}
                                </select>
                            </Field>
                            <Field label="Şirket">
                                <select
                                    value={form.companyId ?? ''}
                                    onChange={event => setForm(current => ({
                                        ...current,
                                        companyId: event.target.value || undefined,
                                        assignedToId: '',
                                    }))}
                                    className={inputClass}
                                >
                                    <option value="">Ajans İçi</option>
                                    {companies.map(company => (
                                        <option key={company.id} value={company.id}>{company.name}</option>
                                    ))}
                                </select>
                            </Field>
                            <Field label="Açıklama">
                                <textarea
                                    value={form.description ?? ''}
                                    onChange={event => setForm(current => ({ ...current, description: event.target.value }))}
                                    className={`${inputClass} resize-none`}
                                    rows={3}
                                />
                            </Field>
                            <Field label="Kategori">
                                <select
                                    value={form.category ?? 'OTHER'}
                                    onChange={event => setForm(current => ({
                                        ...current,
                                        category: event.target.value as TaskCategory,
                                    }))}
                                    className={inputClass}
                                >
                                    {Object.entries(TASK_CATEGORY_LABELS).map(([value, label]) => (
                                        <option key={value} value={value}>{label}</option>
                                    ))}
                                </select>
                            </Field>
                            <div className="grid grid-cols-2 gap-4">
                                <DateField label="Başlangıç Tarihi" value={form.startDate}
                                    onChange={value => setForm(current => ({ ...current, startDate: value }))} />
                                <TimeField label="Başlangıç Saati" value={form.startTime}
                                    onChange={value => setForm(current => ({ ...current, startTime: value }))} />
                                <DateField label="Bitiş Tarihi" value={form.endDate}
                                    onChange={value => setForm(current => ({ ...current, endDate: value }))} />
                                <TimeField label="Bitiş Saati" value={form.endTime}
                                    onChange={value => setForm(current => ({ ...current, endTime: value }))} />
                            </div>
                            <button
                                type="submit"
                                disabled={createTask.isPending}
                                className="w-full py-3 bg-pink-600 hover:bg-pink-500 text-white rounded-xl text-sm font-bold disabled:opacity-50"
                            >
                                {createTask.isPending ? 'Oluşturuluyor...' : 'Görevi Oluştur'}
                            </button>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div>
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{label}</label>
            {children}
        </div>
    );
}

function DateField({ label, value, onChange }: { label: string; value?: string; onChange: (value?: string) => void }) {
    return (
        <Field label={label}>
            <input
                type="date"
                value={value?.slice(0, 10) ?? ''}
                onChange={event => onChange(event.target.value
                    ? new Date(event.target.value).toISOString()
                    : undefined)}
                className={inputClass}
            />
        </Field>
    );
}

function TimeField({ label, value, onChange }: { label: string; value?: string; onChange: (value?: string) => void }) {
    return (
        <Field label={label}>
            <input
                type="time"
                value={value ?? ''}
                onChange={event => onChange(event.target.value || undefined)}
                className={inputClass}
            />
        </Field>
    );
}
