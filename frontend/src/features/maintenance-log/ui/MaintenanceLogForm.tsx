import { Loader2, Save, X } from 'lucide-react';
import type { MaintenanceLogInput } from '../api/maintenanceLog.types';
import { MAINTENANCE_CATEGORY_OPTIONS } from '../model/maintenanceLog.constants';

interface Props {
    form: MaintenanceLogInput;
    dateLocal: string;
    editing: boolean;
    pending: boolean;
    error?: string;
    onChange: (form: MaintenanceLogInput) => void;
    onDateChange: (value: string) => void;
    onCancel: () => void;
    onSubmit: () => void;
}

const inputClass = 'bg-[#0C0C0E] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:border-[#C8697A]/50 focus:outline-none w-full';
const labelClass = 'text-[10px] uppercase tracking-wider text-zinc-500 mb-1 block';

export function MaintenanceLogForm({
    form,
    dateLocal,
    editing,
    pending,
    error,
    onChange,
    onDateChange,
    onCancel,
    onSubmit,
}: Props) {
    return (
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                    <label className={labelClass}>Başlık *</label>
                    <input
                        className={inputClass}
                        placeholder="Örn: Ana sayfa banner güncellendi"
                        value={form.title}
                        onChange={event => onChange({ ...form, title: event.target.value })}
                    />
                </div>
                <div>
                    <label className={labelClass}>Kategori</label>
                    <select
                        className={inputClass}
                        value={form.category}
                        onChange={event => onChange({
                            ...form,
                            category: event.target.value as MaintenanceLogInput['category'],
                        })}
                    >
                        {MAINTENANCE_CATEGORY_OPTIONS.map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className={labelClass}>Tarih *</label>
                    <input
                        type="datetime-local"
                        className={inputClass}
                        value={dateLocal}
                        onChange={event => onDateChange(event.target.value)}
                    />
                </div>
                <div className="sm:col-span-2">
                    <label className={labelClass}>Açıklama</label>
                    <textarea
                        className={`${inputClass} min-h-[72px] resize-none`}
                        placeholder="Ne yapıldığını kısaca açıklayın..."
                        value={form.description ?? ''}
                        onChange={event => onChange({ ...form, description: event.target.value })}
                    />
                </div>
            </div>
            {error && <p className="text-xs text-red-400">{error}</p>}
            <div className="flex justify-end gap-2 pt-1">
                <button
                    onClick={onCancel}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-zinc-400 hover:text-white transition-colors"
                >
                    <X className="w-3.5 h-3.5" /> İptal
                </button>
                <button
                    onClick={onSubmit}
                    disabled={pending}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#C8697A] text-white text-xs font-medium hover:bg-[#B85B6E] disabled:opacity-40 transition-colors"
                >
                    {pending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    {editing ? 'Güncelle' : 'Kaydet'}
                </button>
            </div>
        </div>
    );
}
