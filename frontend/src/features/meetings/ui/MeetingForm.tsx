import { useState, type FormEvent } from 'react';
import { useStaffCompanies } from '../../company';
import { useAssignableUsers } from '../../tasks';
import { useCreateMeeting } from '../hooks/useMeetings';
import {
    defaultMeetingFormValues,
    toCreateMeetingInput,
    type MeetingFormValues,
} from '../model/meeting.utils';

const inputClass = 'w-full mt-1 px-4 py-2.5 bg-[#18181b]/60 border border-white/[0.06] rounded-xl text-sm text-white outline-none focus:border-cyan-500/50 transition-colors';
const labelClass = 'text-[10px] font-bold text-zinc-500 uppercase tracking-widest';

interface MeetingFormProps {
    onSuccess: () => void;
}

export function MeetingForm({ onSuccess }: MeetingFormProps) {
    const [form, setForm] = useState<MeetingFormValues>(defaultMeetingFormValues);
    const { data: companies = [] } = useStaffCompanies();
    const { data: users = [] } = useAssignableUsers(form.companyId || undefined);
    const createMeeting = useCreateMeeting();

    const update = <K extends keyof MeetingFormValues>(key: K, value: MeetingFormValues[K]) => {
        setForm(current => ({ ...current, [key]: value }));
    };

    const submit = async (event: FormEvent) => {
        event.preventDefault();
        if (!form.title.trim() || !form.meetingDate) return;
        await createMeeting.mutateAsync(toCreateMeetingInput(form));
        setForm(defaultMeetingFormValues);
        onSuccess();
    };

    return (
        <form onSubmit={submit} className="space-y-4">
            <div>
                <label className={labelClass}>Şirket</label>
                <select value={form.companyId} onChange={event => update('companyId', event.target.value)} className={inputClass}>
                    <option value="">Ajans İçi (Şirketsiz)</option>
                    {companies.map(company => <option key={company.id} value={company.id}>{company.name}</option>)}
                </select>
            </div>
            <div>
                <label className={labelClass}>Toplantı Konusu *</label>
                <input value={form.title} onChange={event => update('title', event.target.value)} className={inputClass} required />
            </div>
            <div>
                <label className={labelClass}>Açıklama</label>
                <textarea value={form.description} onChange={event => update('description', event.target.value)}
                    className={`${inputClass} resize-none`} rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className={labelClass}>Tarih & Saat *</label>
                    <input type="datetime-local" value={form.meetingDate}
                        onChange={event => update('meetingDate', event.target.value)} className={inputClass} required />
                </div>
                <div>
                    <label className={labelClass}>Süre (dk)</label>
                    <input type="number" value={form.durationMinutes}
                        onChange={event => update('durationMinutes', Number(event.target.value))}
                        className={inputClass} min={15} step={15} />
                </div>
            </div>
            <div>
                <label className={labelClass}>Konum</label>
                <input value={form.location} onChange={event => update('location', event.target.value)}
                    className={inputClass} placeholder="Ofis, Zoom, vb..." />
            </div>
            <div>
                <label className={labelClass}>Katılımcılar</label>
                <select multiple value={form.participantIds}
                    onChange={event => update('participantIds', Array.from(event.target.selectedOptions, option => option.value))}
                    className={`${inputClass} min-h-[100px]`}>
                    {users.map(user => <option key={user.id} value={user.id}>{user.fullName}</option>)}
                </select>
                <p className="text-[10px] text-zinc-600 mt-1">Ctrl/Cmd ile çoklu seçim yapabilirsiniz</p>
            </div>
            <button type="submit" disabled={createMeeting.isPending}
                className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-sm font-bold transition-all disabled:opacity-50">
                {createMeeting.isPending ? 'Oluşturuluyor...' : 'Toplantı Oluştur'}
            </button>
        </form>
    );
}
