import { useEffect, useState, useId, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import type { CompanyResponse } from '../../company';
import type { AssignableUser, CreateTaskInput, TaskCategory, TaskResponse } from '../api/task.types';
import { useAssignableUsers, useCreateTask, useNotificationRecipients } from '../hooks/useTasks';
import { TASK_CATEGORY_LABELS } from '../model/task.constants';

type TaskCompanyOption = Pick<CompanyResponse, 'id' | 'name'>;
type TaskCreateMode = 'staff' | 'client';

interface Props {
    open: boolean;
    companies: TaskCompanyOption[];
    mode?: TaskCreateMode;
    defaultCompanyId?: string;
    onClose: () => void;
    onCreated?: (task: TaskResponse) => void;
}

const emptyForm = (companyId?: string): CreateTaskInput => ({
    companyId,
    assignedToId: '',
    notifyUserIds: [],
    title: '',
    description: '',
    category: 'OTHER',
});

const inputClass = 'w-full mt-1 px-4 py-2.5 bg-[#18181b]/60 border border-white/[0.06] rounded-xl text-sm text-white outline-none focus:border-pink-500/50 transition-colors';

export function TaskCreateDialog({ open, companies, mode = 'staff', defaultCompanyId, onClose, onCreated }: Props) {
    const fid = useId();
    const [form, setForm] = useState<CreateTaskInput>(() => emptyForm(defaultCompanyId));
    const submittingRef = useRef(false);
    const { data: users = [] } = useAssignableUsers(form.companyId, mode);
    const { data: notificationRecipients = [] } = useNotificationRecipients(form.companyId, mode);
    const createTask = useCreateTask(mode);
    const selectedNotifyIds = new Set(form.notifyUserIds ?? []);
    const notifyOptions = notificationRecipients.filter(user => user.id !== form.assignedToId);

    useEffect(() => {
        if (open) {
            const timeoutId = window.setTimeout(() => setForm(emptyForm(defaultCompanyId)), 0);
            return () => window.clearTimeout(timeoutId);
        }
    }, [defaultCompanyId, open]);

    function close() {
        submittingRef.current = false;
        setForm(emptyForm(defaultCompanyId));
        onClose();
    }

    function toggleNotifyUser(userId: string) {
        setForm(current => {
            const next = new Set(current.notifyUserIds ?? []);
            if (next.has(userId)) next.delete(userId);
            else next.add(userId);
            return { ...current, notifyUserIds: [...next] };
        });
    }

    function submit(event: React.FormEvent) {
        event.preventDefault();
        if (submittingRef.current || !form.assignedToId || !form.title.trim()) return;
        submittingRef.current = true;
        const payload: CreateTaskInput = { ...form };
        if (!payload.notifyUserIds?.length) {
            delete payload.notifyUserIds;
        }
        createTask.mutate(payload, {
            onSuccess: task => {
                onCreated?.(task);
                close();
            },
            onError: () => {
                submittingRef.current = false;
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
                            <Field label="Görev Başlığı *" fieldId={`${fid}-title`}>
                                <input
                                    id={`${fid}-title`}
                                    value={form.title}
                                    onChange={event => setForm(current => ({ ...current, title: event.target.value }))}
                                    className={inputClass}
                                    placeholder="Görev başlığı..."
                                    required
                                />
                            </Field>
                            <Field label="Atanan Kişi *" fieldId={`${fid}-assignee`}>
                                <select
                                    id={`${fid}-assignee`}
                                    value={form.assignedToId}
                                    onChange={event => setForm(current => ({
                                        ...current,
                                        assignedToId: event.target.value,
                                        notifyUserIds: (current.notifyUserIds ?? []).filter(id => id !== event.target.value),
                                    }))}
                                    className={inputClass}
                                    required
                                >
                                    <option value="">Kişi seçiniz</option>
                                    {users.map(user => (
                                        <option key={user.id} value={user.id}>{user.fullName}</option>
                                    ))}
                                </select>
                            </Field>
                            <Field label="Şirket" fieldId={`${fid}-company`}>
                                <select
                                    id={`${fid}-company`}
                                    value={form.companyId ?? ''}
                                    onChange={event => setForm(current => ({
                                        ...current,
                                        companyId: event.target.value || undefined,
                                        assignedToId: '',
                                        notifyUserIds: [],
                                    }))}
                                    className={inputClass}
                                >
                                    <option value="">Ajans İçi</option>
                                    {companies.map(company => (
                                        <option key={company.id} value={company.id}>{company.name}</option>
                                    ))}
                                </select>
                            </Field>
                            {notifyOptions.length > 0 && (
                                <Field label="Bilgilendirilecek Kişiler">
                                    <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {notifyOptions.map(user => (
                                            <NotifyOption
                                                key={user.id}
                                                user={user}
                                                checked={selectedNotifyIds.has(user.id)}
                                                onToggle={() => toggleNotifyUser(user.id)}
                                            />
                                        ))}
                                    </div>
                                </Field>
                            )}
                            <Field label="Açıklama" fieldId={`${fid}-desc`}>
                                <textarea
                                    id={`${fid}-desc`}
                                    value={form.description ?? ''}
                                    onChange={event => setForm(current => ({ ...current, description: event.target.value }))}
                                    className={`${inputClass} resize-none`}
                                    rows={3}
                                />
                            </Field>
                            <Field label="Kategori" fieldId={`${fid}-cat`}>
                                <select
                                    id={`${fid}-cat`}
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
                                <DateField label="Başlangıç Tarihi" fieldId={`${fid}-start`} value={form.startDate}
                                    onChange={value => setForm(current => ({ ...current, startDate: value }))} />
                                <TimeField label="Başlangıç Saati" fieldId={`${fid}-starttime`} value={form.startTime}
                                    onChange={value => setForm(current => ({ ...current, startTime: value }))} />
                                <DateField label="Bitiş Tarihi" fieldId={`${fid}-end`} value={form.endDate}
                                    onChange={value => setForm(current => ({ ...current, endDate: value }))} />
                                <TimeField label="Bitiş Saati" fieldId={`${fid}-endtime`} value={form.endTime}
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

function NotifyOption({ user, checked, onToggle }: { user: AssignableUser; checked: boolean; onToggle: () => void }) {
    return (
        <label className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs transition-colors cursor-pointer ${
            checked
                ? 'border-pink-500/40 bg-pink-500/10 text-white'
                : 'border-white/[0.06] bg-white/[0.02] text-zinc-400 hover:text-zinc-200'
        }`}>
            <input
                type="checkbox"
                checked={checked}
                onChange={onToggle}
                className="h-3.5 w-3.5 accent-pink-500"
            />
            <span className="min-w-0">
                <span className="block truncate font-medium">{user.fullName}</span>
                <span className="block truncate text-[10px] text-zinc-500">{user.email}</span>
            </span>
        </label>
    );
}

function Field({ label, fieldId, children }: { label: string; fieldId?: string; children: React.ReactNode }) {
    return (
        <div>
            <label htmlFor={fieldId} className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{label}</label>
            {children}
        </div>
    );
}

function DateField({ label, fieldId, value, onChange }: { label: string; fieldId?: string; value?: string; onChange: (value?: string) => void }) {
    return (
        <Field label={label} fieldId={fieldId}>
            <input
                id={fieldId}
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

function TimeField({ label, fieldId, value, onChange }: { label: string; fieldId?: string; value?: string; onChange: (value?: string) => void }) {
    return (
        <Field label={label} fieldId={fieldId}>
            <input
                id={fieldId}
                type="time"
                value={value ?? ''}
                onChange={event => onChange(event.target.value || undefined)}
                className={inputClass}
            />
        </Field>
    );
}
