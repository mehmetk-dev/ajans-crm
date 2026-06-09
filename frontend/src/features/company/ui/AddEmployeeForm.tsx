import type { AddEmployeeInput } from '../api/company.types';

interface Props {
    form: AddEmployeeInput;
    pending: boolean;
    onChange: (form: AddEmployeeInput) => void;
    onCancel: () => void;
    onSubmit: () => void;
}

const inputClass = 'bg-[#0C0C0E] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:border-orange-500/50 focus:outline-none';

export function AddEmployeeForm({ form, pending, onChange, onCancel, onSubmit }: Props) {
    return (
        <div className="mb-4 p-4 bg-[#18181b]/50 rounded-xl border border-white/[0.06] space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input className={inputClass} placeholder="Ad Soyad *" value={form.fullName}
                    onChange={event => onChange({ ...form, fullName: event.target.value })} />
                <input className={inputClass} placeholder="Email *" type="email" value={form.email}
                    onChange={event => onChange({ ...form, email: event.target.value })} />
                <input className={inputClass} placeholder="Şifre *" type="password" value={form.password}
                    onChange={event => onChange({ ...form, password: event.target.value })} />
                <input className={inputClass} placeholder="Telefon" value={form.phone ?? ''}
                    onChange={event => onChange({ ...form, phone: event.target.value })} />
                <input className={inputClass} placeholder="Pozisyon" value={form.position ?? ''}
                    onChange={event => onChange({ ...form, position: event.target.value })} />
                <input className={inputClass} placeholder="Departman" value={form.department ?? ''}
                    onChange={event => onChange({ ...form, department: event.target.value })} />
            </div>
            <div className="flex gap-2 justify-end">
                <button onClick={onCancel}
                    className="px-3 py-1.5 rounded-lg text-sm text-zinc-500 hover:text-white transition-colors">
                    İptal
                </button>
                <button
                    onClick={onSubmit}
                    disabled={!form.fullName.trim() || !form.email.trim() || !form.password || pending}
                    className="px-4 py-1.5 rounded-lg bg-orange-500 text-white text-sm font-medium hover:bg-orange-600 disabled:opacity-40 transition-colors"
                >
                    {pending ? 'Ekleniyor...' : 'Ekle'}
                </button>
            </div>
        </div>
    );
}
