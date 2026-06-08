import { useState } from 'react';
import { Loader2, Plus, Wrench } from 'lucide-react';
import { ZodError } from 'zod';
import type { MaintenanceLogEntry, MaintenanceLogInput } from '../api/maintenanceLog.types';
import {
    useCreateMaintenanceLog,
    useDeleteMaintenanceLog,
    useMaintenanceLog,
    useUpdateMaintenanceLog,
} from '../hooks/useMaintenanceLog';
import {
    parseMaintenanceLogInput,
} from '../model/maintenanceLog.schema';
import { toIsoDateTime, toLocalDateTimeInput } from '../model/maintenanceLogDate';
import { MaintenanceLogForm } from './MaintenanceLogForm';
import { MaintenanceLogList } from './MaintenanceLogList';

interface Props {
    companyId: string;
}

function emptyForm(): MaintenanceLogInput {
    return {
        title: '',
        description: '',
        category: 'update',
        performedAt: new Date().toISOString(),
    };
}

export function MaintenanceLogPanel({ companyId }: Props) {
    const { data: entries = [], isLoading } = useMaintenanceLog(companyId);
    const createLog = useCreateMaintenanceLog(companyId);
    const updateLog = useUpdateMaintenanceLog(companyId);
    const deleteLog = useDeleteMaintenanceLog(companyId);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState<MaintenanceLogInput>(emptyForm);
    const [dateLocal, setDateLocal] = useState(toLocalDateTimeInput);
    const [formError, setFormError] = useState<string>();

    function resetForm() {
        setShowForm(false);
        setEditingId(null);
        setForm(emptyForm());
        setDateLocal(toLocalDateTimeInput());
        setFormError(undefined);
    }

    function openCreateForm() {
        resetForm();
        setShowForm(true);
    }

    function openEditForm(entry: MaintenanceLogEntry) {
        setEditingId(entry.id);
        setShowForm(true);
        setForm({
            title: entry.title,
            description: entry.description ?? '',
            category: entry.category,
            performedAt: entry.performedAt,
        });
        setDateLocal(toLocalDateTimeInput(entry.performedAt));
        setFormError(undefined);
    }

    function submit() {
        try {
            const input = parseMaintenanceLogInput({
                ...form,
                performedAt: toIsoDateTime(dateLocal),
            });
            if (editingId) {
                updateLog.mutate({ entryId: editingId, input }, { onSuccess: resetForm });
            } else {
                createLog.mutate(input, { onSuccess: resetForm });
            }
        } catch (error) {
            setFormError(error instanceof ZodError ? error.issues[0]?.message : 'Form doğrulanamadı');
        }
    }

    function remove(entryId: string) {
        if (confirm('Bu kayıt silinsin mi?')) {
            deleteLog.mutate(entryId);
        }
    }

    const pending = createLog.isPending || updateLog.isPending;

    return (
        <div className="bg-[#0C0C0E] border border-white/[0.06] rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-[#F5BEC8]" />
                    <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">
                        Bakım Günlüğü
                    </h3>
                    <span className="text-[11px] text-zinc-600">({entries.length})</span>
                </div>
                {!showForm && (
                    <button
                        onClick={openCreateForm}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#C8697A]/10 text-[#F5BEC8] text-xs font-medium hover:bg-[#C8697A]/20 transition-colors"
                    >
                        <Plus className="w-3.5 h-3.5" /> Kayıt Ekle
                    </button>
                )}
            </div>

            {showForm && (
                <MaintenanceLogForm
                    form={form}
                    dateLocal={dateLocal}
                    editing={editingId !== null}
                    pending={pending}
                    error={formError}
                    onChange={setForm}
                    onDateChange={setDateLocal}
                    onCancel={resetForm}
                    onSubmit={submit}
                />
            )}

            {isLoading ? (
                <div className="flex justify-center py-6">
                    <Loader2 className="w-4 h-4 text-zinc-500 animate-spin" />
                </div>
            ) : entries.length === 0 ? (
                <p className="text-xs text-zinc-500 text-center py-8">Henüz bakım kaydı eklenmemiş.</p>
            ) : (
                <MaintenanceLogList entries={entries} onEdit={openEditForm} onDelete={remove} />
            )}
        </div>
    );
}
