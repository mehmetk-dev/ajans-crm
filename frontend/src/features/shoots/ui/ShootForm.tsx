import { useState, useId, type FormEvent } from 'react';
import { Trash2 } from 'lucide-react';
import { useStaffCompanies } from '../../company';
import { useAssignableUsers } from '../../tasks';
import { useCreateShoot } from '../hooks/useShoots';
import {
    defaultShootFormValues,
    toCreateShootInput,
    type ShootFormValues,
} from '../model/shoot.utils';

const inputClass = 'w-full mt-1 px-3 py-2.5 bg-[#18181b]/60 border border-white/[0.06] rounded-xl text-sm text-white outline-none focus:border-violet-500/50';
const labelClass = 'text-[10px] font-bold text-zinc-500 uppercase tracking-widest';

export function ShootForm({ onSuccess }: { onSuccess: () => void }) {
    const [form, setForm] = useState<ShootFormValues>(defaultShootFormValues);
    const { data: companies = [] } = useStaffCompanies();
    const { data: users = [] } = useAssignableUsers(form.companyId || undefined);
    const createShoot = useCreateShoot();
    const id = useId();

    const update = <K extends keyof ShootFormValues>(key: K, value: ShootFormValues[K]) => {
        setForm(current => ({ ...current, [key]: value }));
    };

    const submit = async (event: FormEvent) => {
        event.preventDefault();
        if (!form.companyId || !form.title.trim()) return;
        await createShoot.mutateAsync(toCreateShootInput(form));
        setForm(defaultShootFormValues);
        onSuccess();
    };

    return (
        <form onSubmit={submit} className="space-y-4">
            <div>
                <label htmlFor={`${id}-company`} className={labelClass}>Şirket *</label>
                <select id={`${id}-company`} value={form.companyId} onChange={event => update('companyId', event.target.value)}
                    className={inputClass} required>
                    <option value="">Şirket seçin</option>
                    {companies.map(company => <option key={company.id} value={company.id}>{company.name}</option>)}
                </select>
            </div>
            <div>
                <label htmlFor={`${id}-title`} className={labelClass}>Başlık *</label>
                <input id={`${id}-title`} value={form.title} onChange={event => update('title', event.target.value)}
                    className={inputClass} required />
            </div>
            <div>
                <label htmlFor={`${id}-photographer`} className={labelClass}>Çekimci</label>
                <select id={`${id}-photographer`} value={form.photographerId}
                    onChange={event => update('photographerId', event.target.value)}
                    className={inputClass}>
                    <option value="">Seçilmedi</option>
                    {users.map(user => <option key={user.id} value={user.id}>{user.fullName}</option>)}
                </select>
            </div>
            <div>
                <label htmlFor={`${id}-desc`} className={labelClass}>Açıklama</label>
                <textarea id={`${id}-desc`} value={form.description} onChange={event => update('description', event.target.value)}
                    className={`${inputClass} resize-none`} rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label htmlFor={`${id}-date`} className={labelClass}>Tarih</label>
                    <input id={`${id}-date`} type="date" value={form.shootDate}
                        onChange={event => update('shootDate', event.target.value)} className={inputClass} />
                </div>
                <div>
                    <label htmlFor={`${id}-time`} className={labelClass}>Saat</label>
                    <input id={`${id}-time`} type="time" value={form.shootTime}
                        onChange={event => update('shootTime', event.target.value)} className={inputClass} />
                </div>
            </div>
            <div>
                <label htmlFor={`${id}-location`} className={labelClass}>Konum</label>
                <input id={`${id}-location`} value={form.location} onChange={event => update('location', event.target.value)}
                    className={inputClass} />
            </div>
            <div>
                <label htmlFor={`${id}-notes`} className={labelClass}>Notlar</label>
                <textarea id={`${id}-notes`} value={form.notes} onChange={event => update('notes', event.target.value)}
                    className={`${inputClass} resize-none`} rows={2} />
            </div>
            <ParticipantFields form={form} update={update} users={users} />
            <EquipmentFields form={form} update={update} />
            <button type="submit" disabled={createShoot.isPending}
                className="w-full py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-sm font-bold disabled:opacity-50">
                {createShoot.isPending ? 'Oluşturuluyor...' : 'Çekim Oluştur'}
            </button>
        </form>
    );
}

function ParticipantFields({
    form,
    update,
    users,
}: {
    form: ShootFormValues;
    update: <K extends keyof ShootFormValues>(key: K, value: ShootFormValues[K]) => void;
    users: { id: string; fullName: string }[];
}) {
    const add = () => update('participants', [...form.participants, { userId: '', roleInShoot: '' }]);
    return (
        <div className="border-t border-white/[0.06] pt-4" role="group" aria-labelledby="participants-heading">
            <div className="flex justify-between mb-2">
                <h3 id="participants-heading" className={labelClass}>Katılımcılar</h3>
                <button type="button" onClick={add} className="text-[10px] text-violet-400">+ Ekle</button>
            </div>
            <div className="space-y-2">
                {form.participants.map((participant, index) => (
                    <div key={index} className="grid grid-cols-[1fr_1fr_auto] gap-2">
                        <select value={participant.userId} className={inputClass}
                            onChange={event => update('participants', form.participants.map((item, itemIndex) =>
                                itemIndex === index ? { ...item, userId: event.target.value } : item))}>
                            <option value="">Kişi seçin</option>
                            {users.map(user => <option key={user.id} value={user.id}>{user.fullName}</option>)}
                        </select>
                        <input value={participant.roleInShoot} className={inputClass} placeholder="Rol"
                            onChange={event => update('participants', form.participants.map((item, itemIndex) =>
                                itemIndex === index ? { ...item, roleInShoot: event.target.value } : item))} />
                        <button type="button" onClick={() => update('participants', form.participants.filter((_, itemIndex) => itemIndex !== index))}
                            className="mt-1 text-zinc-600 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                    </div>
                ))}
            </div>
        </div>
    );
}

function EquipmentFields({
    form,
    update,
}: {
    form: ShootFormValues;
    update: <K extends keyof ShootFormValues>(key: K, value: ShootFormValues[K]) => void;
}) {
    const add = () => update('equipment', [...form.equipment, { name: '', quantity: 1, notes: '' }]);
    return (
        <div className="border-t border-white/[0.06] pt-4" role="group" aria-labelledby="equipment-heading">
            <div className="flex justify-between mb-2">
                <h3 id="equipment-heading" className={labelClass}>Ekipman</h3>
                <button type="button" onClick={add} className="text-[10px] text-violet-400">+ Ekle</button>
            </div>
            <div className="space-y-2">
                {form.equipment.map((equipment, index) => (
                    <div key={index} className="grid grid-cols-[1fr_70px_1fr_auto] gap-2">
                        {(['name', 'quantity', 'notes'] as const).map(field => (
                            <input key={field} type={field === 'quantity' ? 'number' : 'text'}
                                value={equipment[field]} className={inputClass}
                                min={field === 'quantity' ? 1 : undefined}
                                placeholder={field === 'name' ? 'Ekipman' : field === 'notes' ? 'Not' : undefined}
                                onChange={event => update('equipment', form.equipment.map((item, itemIndex) =>
                                    itemIndex === index
                                        ? { ...item, [field]: field === 'quantity' ? Number(event.target.value) : event.target.value }
                                        : item))} />
                        ))}
                        <button type="button" onClick={() => update('equipment', form.equipment.filter((_, itemIndex) => itemIndex !== index))}
                            className="mt-1 text-zinc-600 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                    </div>
                ))}
            </div>
        </div>
    );
}
