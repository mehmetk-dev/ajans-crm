import { X } from 'lucide-react';
import type { UpdateCompanyInput } from '../../company';

interface EditCompanyFormProps {
    form: UpdateCompanyInput;
    saving: boolean;
    error: string;
    onFieldChange: (field: string, value: string | number) => void;
    onSubmit: (e: React.FormEvent) => void;
    onClose: () => void;
}

export function EditCompanyForm({ form, saving, error, onFieldChange, onSubmit, onClose }: EditCompanyFormProps) {
    return (
        <>
            <div className="p-6 border-b border-white/[0.06] flex items-center justify-between sticky top-0 bg-[#0C0C0E] backdrop-blur z-10 rounded-t-2xl">
                <h2 className="text-lg font-bold text-white">Şirketi Düzenle</h2>
                <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
                    <X className="w-5 h-5" />
                </button>
            </div>

            <form onSubmit={onSubmit} className="p-6 space-y-6">
                {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs">{error}</div>
                )}

                <FormSection title="Şirket Bilgileri">
                    <div className="col-span-1 sm:col-span-2">
                        <input value={form.name ?? ''} onChange={e => onFieldChange('name', e.target.value)}
                            className="w-full px-4 py-3 glass-input rounded-xl text-sm text-white outline-none"
                            placeholder="Şirket Adı *" required />
                    </div>
                    <input value={form.industry ?? ''} onChange={e => onFieldChange('industry', e.target.value)}
                        className="w-full px-4 py-3 glass-input rounded-xl text-sm text-white outline-none" placeholder="Sektör" />
                    <input value={form.email ?? ''} onChange={e => onFieldChange('email', e.target.value)} type="email"
                        className="w-full px-4 py-3 glass-input rounded-xl text-sm text-white outline-none" placeholder="Şirket Email" />
                    <input value={form.phone ?? ''} onChange={e => onFieldChange('phone', e.target.value)}
                        className="w-full px-4 py-3 glass-input rounded-xl text-sm text-white outline-none" placeholder="Telefon" />
                    <input value={form.website ?? ''} onChange={e => onFieldChange('website', e.target.value)}
                        className="w-full px-4 py-3 glass-input rounded-xl text-sm text-white outline-none" placeholder="Website" />
                    <input value={form.taxId ?? ''} onChange={e => onFieldChange('taxId', e.target.value)}
                        className="w-full px-4 py-3 glass-input rounded-xl text-sm text-white outline-none" placeholder="Vergi No" />
                    <input value={form.foundedYear ?? ''}
                        onChange={e => onFieldChange('foundedYear', e.target.value ? parseInt(e.target.value) : '')}
                        type="number" className="w-full px-4 py-3 glass-input rounded-xl text-sm text-white outline-none"
                        placeholder="Kuruluş Yılı" />
                    <div className="col-span-1 sm:col-span-2">
                        <input value={form.address ?? ''} onChange={e => onFieldChange('address', e.target.value)}
                            className="w-full px-4 py-3 glass-input rounded-xl text-sm text-white outline-none" placeholder="Adres" />
                    </div>
                    <div className="col-span-1 sm:col-span-2">
                        <textarea value={form.notes ?? ''} onChange={e => onFieldChange('notes', e.target.value)}
                            className="w-full px-4 py-3 glass-input rounded-xl text-sm text-white outline-none resize-none" rows={3} placeholder="Notlar" />
                    </div>
                </FormSection>

                <FormSection title="Sosyal Medya">
                    {[
                        { field: 'socialInstagram', placeholder: 'Instagram (@kullanıcı)' },
                        { field: 'socialFacebook', placeholder: 'Facebook URL' },
                        { field: 'socialTwitter', placeholder: 'Twitter (@kullanıcı)' },
                        { field: 'socialLinkedin', placeholder: 'LinkedIn URL' },
                        { field: 'socialYoutube', placeholder: 'YouTube URL' },
                        { field: 'socialTiktok', placeholder: 'TikTok (@kullanıcı)' },
                    ].map(s => (
                        <input key={s.field} value={(form as never)[s.field] ?? ''}
                            onChange={e => onFieldChange(s.field, e.target.value)}
                            className="w-full px-4 py-3 glass-input rounded-xl text-sm text-white outline-none"
                            placeholder={s.placeholder} />
                    ))}
                </FormSection>

                <FormSection title="Kurumsal Bilgiler">
                    <div className="col-span-1 sm:col-span-2">
                        <textarea value={form.vision ?? ''} onChange={e => onFieldChange('vision', e.target.value)}
                            className="w-full px-4 py-3 glass-input rounded-xl text-sm text-white outline-none resize-none" rows={2} placeholder="Vizyon" />
                    </div>
                    <div className="col-span-1 sm:col-span-2">
                        <textarea value={form.mission ?? ''} onChange={e => onFieldChange('mission', e.target.value)}
                            className="w-full px-4 py-3 glass-input rounded-xl text-sm text-white outline-none resize-none" rows={2} placeholder="Misyon" />
                    </div>
                </FormSection>

                <button type="submit" disabled={saving}
                    className="w-full py-2.5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2 text-[13px] shadow-lg shadow-orange-500/20 transition-all disabled:opacity-50">
                    {saving ? <div className="h-5 w-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : 'Değişiklikleri Kaydet'}
                </button>
            </form>
        </>
    );
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="space-y-4">
            <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">{title}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {children}
            </div>
        </div>
    );
}
