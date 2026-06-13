import { BarChart3, Camera, Check, FileText, Instagram, LayoutTemplate, Megaphone, X } from 'lucide-react';
import type { CreateCompanyInput } from '../../company';

interface CreateCompanyFormProps {
    form: CreateCompanyInput;
    saving: boolean;
    error: string;
    onFieldChange: (field: string, value: string) => void;
    onFoundedYearChange: (value: string) => void;
    onToggleService: (category: string) => void;
    onSelectAllServices: () => void;
    onSubmit: (e: React.FormEvent) => void;
    onClose: () => void;
}

const SERVICE_CATALOG = [
    { cat: 'DIGITAL_MARKETING', label: 'Dijital Pazarlama', sub: 'GA + Search Console', icon: BarChart3 },
    { cat: 'WEB_DESIGN', label: 'Web Tasarımı', sub: 'PageSpeed + Site', icon: LayoutTemplate },
    { cat: 'AD_MANAGEMENT', label: 'Reklam Yönetimi', sub: 'Google + Meta Ads', icon: Megaphone },
    { cat: 'SOCIAL_MEDIA', label: 'Sosyal Medya', sub: 'Instagram + Reels', icon: Instagram },
    { cat: 'PRODUCTION', label: 'Prodüksiyon', sub: 'Çekim Takvimi', icon: Camera },
    { cat: 'CONTENT_MARKETING', label: 'İçerik Pazarlama', sub: 'İçerik Planı', icon: FileText },
] as const;

const ALL_SERVICES = SERVICE_CATALOG.map(s => s.cat);

export function CreateCompanyForm({
    form, saving, error,
    onFieldChange, onFoundedYearChange,
    onToggleService, onSelectAllServices, onSubmit, onClose,
}: CreateCompanyFormProps) {
    const selectedCount = form.selectedServices?.length ?? 0;
    const allSelected = selectedCount === ALL_SERVICES.length;

    return (
        <>
            <div className="p-6 border-b border-white/[0.06] flex items-center justify-between sticky top-0 bg-[#0C0C0E] backdrop-blur z-10 rounded-t-2xl">
                <h2 className="text-lg font-bold text-white">Yeni Şirket Oluştur</h2>
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
                        <input value={form.name} onChange={e => onFieldChange('name', e.target.value)}
                            className="w-full px-4 py-3 glass-input rounded-xl text-sm text-white outline-none"
                            placeholder="Şirket Adı *" required />
                    </div>
                    <input value={form.industry ?? ''} onChange={e => onFieldChange('industry', e.target.value)}
                        className="w-full px-4 py-3 glass-input rounded-xl text-sm text-white outline-none" placeholder="Sektör" />
                    <input value={form.email ?? ''} onChange={e => onFieldChange('email', e.target.value)}
                        className="w-full px-4 py-3 glass-input rounded-xl text-sm text-white outline-none" placeholder="Şirket Email" />
                    <input value={form.phone ?? ''} onChange={e => onFieldChange('phone', e.target.value)}
                        className="w-full px-4 py-3 glass-input rounded-xl text-sm text-white outline-none" placeholder="Telefon" />
                    <input value={form.website ?? ''} onChange={e => onFieldChange('website', e.target.value)}
                        className="w-full px-4 py-3 glass-input rounded-xl text-sm text-white outline-none" placeholder="Website" />
                    <input value={form.taxId ?? ''} onChange={e => onFieldChange('taxId', e.target.value)}
                        className="w-full px-4 py-3 glass-input rounded-xl text-sm text-white outline-none" placeholder="Vergi No" />
                    <input value={form.foundedYear ?? ''} onChange={e => onFoundedYearChange(e.target.value)}
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

                <FormSection title="Şirket Sahibi (Otomatik Hesap Oluşturulur)">
                    <input value={form.ownerFullName ?? ''} onChange={e => onFieldChange('ownerFullName', e.target.value)}
                        className="w-full px-4 py-3 glass-input rounded-xl text-sm text-white outline-none"
                        placeholder="Ad Soyad *" required />
                    <input value={form.ownerEmail ?? ''} onChange={e => onFieldChange('ownerEmail', e.target.value)}
                        type="email" className="w-full px-4 py-3 glass-input rounded-xl text-sm text-white outline-none"
                        placeholder="Email *" required />
                    <input value={form.ownerPassword ?? ''} onChange={e => onFieldChange('ownerPassword', e.target.value)}
                        type="password" className="w-full px-4 py-3 glass-input rounded-xl text-sm text-white outline-none"
                        placeholder="Şifre *" required />
                    <input value={form.ownerPhone ?? ''} onChange={e => onFieldChange('ownerPhone', e.target.value)}
                        className="w-full px-4 py-3 glass-input rounded-xl text-sm text-white outline-none" placeholder="Telefon" />
                    <div className="col-span-1 sm:col-span-2">
                        <input value={form.ownerPosition ?? ''} onChange={e => onFieldChange('ownerPosition', e.target.value)}
                            className="w-full px-4 py-3 glass-input rounded-xl text-sm text-white outline-none"
                            placeholder="Pozisyon (Genel Müdür, CEO vb.)" />
                    </div>
                </FormSection>

                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Sunulan Hizmetler</p>
                        <button type="button" onClick={onSelectAllServices}
                            className="text-[10px] text-zinc-500 hover:text-zinc-300 transition-colors">
                            {allSelected ? 'Tümünü Kaldır' : 'Tümünü Seç'}
                        </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        {SERVICE_CATALOG.map(({ cat, label, sub, icon: Icon }) => {
                            const active = form.selectedServices?.includes(cat);
                            return (
                                <button key={cat} type="button" onClick={() => onToggleService(cat)}
                                    className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all ${
                                        active ? 'bg-orange-500/10 border-orange-500/30' : 'bg-white/[0.02] border-white/[0.05] opacity-60 hover:opacity-80'
                                    }`}>
                                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                        active ? 'bg-orange-500/20' : 'bg-white/[0.04]'
                                    }`}>
                                        {active ? <Check className="w-3.5 h-3.5 text-orange-400" /> : <Icon className="w-3.5 h-3.5 text-zinc-600" />}
                                    </div>
                                    <div>
                                        <p className={`text-[11px] font-semibold ${active ? 'text-white' : 'text-zinc-500'}`}>{label}</p>
                                        <p className="text-[9px] text-zinc-600">{sub}</p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                    <p className="text-[9px] text-zinc-700">Seçilen hizmetlere ait paneller müşteri portalında görünecektir</p>
                </div>

                <button type="submit" disabled={saving}
                    className="w-full py-2.5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2 text-[13px] shadow-lg shadow-orange-500/20 transition-all disabled:opacity-50">
                    {saving ? <div className="h-5 w-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : 'Şirketi Oluştur'}
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
