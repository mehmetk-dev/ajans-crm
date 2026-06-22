import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi, type CompanyServiceItem } from '../../api/admin';
import {
    companyApi,
    companyKeys,
    CompanyMembersPanel,
    type CompanyResponse,
} from '../../features/company';
import {
    ArrowLeft, Building2, Mail, Phone, Globe, MapPin, Calendar,
    Briefcase, ExternalLink,
    Instagram, Facebook, Twitter, Linkedin, Youtube,
    BarChart3, Megaphone, Camera, FileText, LayoutTemplate, ToggleLeft, ToggleRight
} from 'lucide-react';
import WebDesignAdminSection from '../../components/admin/WebDesignAdminSection';

export default function CompanyDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const { data: company, isLoading } = useQuery<CompanyResponse>({
        queryKey: companyKeys.detail('admin', id ?? ''),
        queryFn: () => companyApi.getAdmin(id!),
        enabled: !!id,
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin h-8 w-8 border-2 border-orange-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    if (!company) return <div className="text-zinc-500 text-center py-12">Şirket bulunamadı</div>;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button onClick={() => navigate('/admin/companies')}
                    className="p-2 rounded-lg hover:bg-white/5 text-zinc-400 hover:text-white transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
                            <Building2 className="w-6 h-6 text-orange-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">{company.name}</h1>
                            <div className="flex items-center gap-3 text-sm text-zinc-500">
                                {company.industry && <span>{company.industry}</span>}
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${company.contractStatus === 'ACTIVE' ? 'bg-pink-500/10 text-pink-400' : 'bg-zinc-700 text-zinc-400'}`}>
                                    {company.contractStatus === 'ACTIVE' ? 'Aktif' : company.contractStatus}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Contact */}
                <div className="bg-[#0C0C0E] border border-white/[0.06] rounded-2xl p-5 space-y-3">
                    <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">İletişim</h3>
                    {company.email && (
                        <div className="flex items-center gap-2 text-sm">
                            <Mail className="w-4 h-4 text-zinc-600" />
                            <span className="text-white">{company.email}</span>
                        </div>
                    )}
                    {company.phone && (
                        <div className="flex items-center gap-2 text-sm">
                            <Phone className="w-4 h-4 text-zinc-600" />
                            <span className="text-white">{company.phone}</span>
                        </div>
                    )}
                    {company.website && (
                        <a href={company.website} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300">
                            <Globe className="w-4 h-4" />
                            <span>{company.website}</span>
                            <ExternalLink className="w-3 h-3" />
                        </a>
                    )}
                    {company.address && (
                        <div className="flex items-start gap-2 text-sm">
                            <MapPin className="w-4 h-4 text-zinc-600 mt-0.5" />
                            <span className="text-zinc-300">{company.address}</span>
                        </div>
                    )}
                </div>

                {/* Details */}
                <div className="bg-[#0C0C0E] border border-white/[0.06] rounded-2xl p-5 space-y-3">
                    <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Detaylar</h3>
                    {company.taxId && (
                        <div className="flex items-center gap-2 text-sm">
                            <Briefcase className="w-4 h-4 text-zinc-600" />
                            <span className="text-zinc-400">Vergi No:</span>
                            <span className="text-white">{company.taxId}</span>
                        </div>
                    )}
                    {company.foundedYear && (
                        <div className="flex items-center gap-2 text-sm">
                            <Calendar className="w-4 h-4 text-zinc-600" />
                            <span className="text-zinc-400">Kuruluş:</span>
                            <span className="text-white">{company.foundedYear}</span>
                        </div>
                    )}
                    <div className="flex items-center gap-4 text-sm">
                        <span className="text-zinc-400">Çalışan:</span>
                        <span className="text-white font-medium">{company.employeeCount}</span>
                        <span className="text-zinc-400">Yetkili:</span>
                        <span className="text-white font-medium">{company.staffCount}</span>
                        <span className="text-zinc-400">Görev:</span>
                        <span className="text-white font-medium">{company.taskCount}</span>
                    </div>
                </div>

                {/* Socials */}
                <div className="bg-[#0C0C0E] border border-white/[0.06] rounded-2xl p-5 space-y-3">
                    <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Sosyal Medya</h3>
                    <div className="flex flex-wrap gap-2">
                        {company.socialInstagram && (
                            <a href={`https://instagram.com/${company.socialInstagram}`} target="_blank" rel="noopener noreferrer"
                                className="p-2 rounded-lg bg-gradient-to-br from-pink-500/10 to-purple-600/10 text-pink-400 hover:from-pink-500/20 hover:to-purple-600/20 transition-colors">
                                <Instagram className="w-4 h-4" />
                            </a>
                        )}
                        {company.socialFacebook && (
                            <a href={company.socialFacebook} target="_blank" rel="noopener noreferrer"
                                className="p-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors">
                                <Facebook className="w-4 h-4" />
                            </a>
                        )}
                        {company.socialTwitter && (
                            <a href={company.socialTwitter} target="_blank" rel="noopener noreferrer"
                                className="p-2 rounded-lg bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 transition-colors">
                                <Twitter className="w-4 h-4" />
                            </a>
                        )}
                        {company.socialLinkedin && (
                            <a href={company.socialLinkedin} target="_blank" rel="noopener noreferrer"
                                className="p-2 rounded-lg bg-blue-600/10 text-blue-400 hover:bg-blue-600/20 transition-colors">
                                <Linkedin className="w-4 h-4" />
                            </a>
                        )}
                        {company.socialYoutube && (
                            <a href={company.socialYoutube} target="_blank" rel="noopener noreferrer"
                                className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors">
                                <Youtube className="w-4 h-4" />
                            </a>
                        )}
                        {!company.socialInstagram && !company.socialFacebook && !company.socialTwitter &&
                            !company.socialLinkedin && !company.socialYoutube && (
                                <p className="text-zinc-600 text-sm">Sosyal medya bağlantısı eklenmemiş</p>
                            )}
                    </div>
                </div>
            </div>

            {/* Notes */}
            {company.notes && (
                <div className="bg-[#0C0C0E] border border-white/[0.06] rounded-2xl p-5">
                    <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-2">Notlar</h3>
                    <p className="text-zinc-300 text-sm whitespace-pre-wrap">{company.notes}</p>
                </div>
            )}

            {/* Web Design (infrastructure + maintenance log) */}
            <WebDesignAdminSection company={company} />

            {/* Service Management */}
            <ServiceManagementSection companyId={company.id} />

            <CompanyMembersPanel company={company} />
        </div>
    );
}

// ===============================================================================
// SERVICE MANAGEMENT SECTION
// ===============================================================================

const SERVICE_META = [
    { category: 'DIGITAL_MARKETING', label: 'Dijital Pazarlama', desc: 'Google Analytics + Search Console', icon: BarChart3, color: 'blue' },
    { category: 'WEB_DESIGN',        label: 'Web Tasarımı',     desc: 'PageSpeed + Site Verileri',       icon: LayoutTemplate, color: 'cyan' },
    { category: 'AD_MANAGEMENT',     label: 'Reklam Yönetimi',  desc: 'Google Ads + Meta Ads',           icon: Megaphone, color: 'amber' },
    { category: 'SOCIAL_MEDIA',      label: 'Sosyal Medya',     desc: 'Instagram Analiz + Reels',        icon: Instagram, color: 'pink' },
    { category: 'PRODUCTION',        label: 'Prodüksiyon',      desc: 'Çekim Takvimi',                   icon: Camera, color: 'violet' },
    { category: 'CONTENT_MARKETING', label: 'İçerik Pazarlama', desc: 'İçerik Planı',                   icon: FileText, color: 'emerald' },
];

const COLOR_MAP: Record<string, string> = {
    blue:    'from-blue-500/10 to-blue-400/5 border-blue-500/20 text-blue-400',
    cyan:    'from-cyan-500/10 to-cyan-400/5 border-cyan-500/20 text-cyan-400',
    amber:   'from-amber-500/10 to-amber-400/5 border-amber-500/20 text-amber-400',
    pink:    'from-pink-500/10 to-pink-400/5 border-pink-500/20 text-pink-400',
    violet:  'from-violet-500/10 to-violet-400/5 border-violet-500/20 text-violet-400',
    emerald: 'from-emerald-500/10 to-emerald-400/5 border-emerald-500/20 text-emerald-400',
};

function ServiceManagementSection({ companyId }: { companyId: string }) {
    const queryClient = useQueryClient();

    const { data: services = [], isLoading } = useQuery<CompanyServiceItem[]>({
        queryKey: ['company-services', companyId],
        queryFn: () => adminApi.getCompanyServices(companyId),
        enabled: !!companyId,
    });

    const toggleMutation = useMutation({
        mutationFn: ({ category, active }: { category: string; active: boolean }) =>
            adminApi.toggleCompanyService(companyId, category, active),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['company-services', companyId] });
        },
    });

    const getActive = (category: string) =>
        services.find(s => s.category === category)?.active ?? false;

    return (
        <div className="bg-[#0C0C0E] border border-white/[0.06] rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-5">
                <ToggleRight className="w-4 h-4 text-orange-400" />
                <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Hizmet Yönetimi</h3>
                <span className="ml-auto text-[10px] text-zinc-600">
                    {services.filter(s => s.active).length}/{services.length || 6} aktif
                </span>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="h-24 rounded-xl bg-white/[0.02] border border-white/[0.04] animate-pulse" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {SERVICE_META.map(({ category, label, desc, icon: Icon, color }) => {
                        const active = getActive(category);
                        const colorCls = COLOR_MAP[color];
                        const iconColor = colorCls.split(' ').find((c: string) => c.startsWith('text-')) ?? 'text-zinc-400';
                        return (
                            <button
                                key={category}
                                onClick={() => toggleMutation.mutate({ category, active: !active })}
                                disabled={toggleMutation.isPending}
                                className={`relative flex flex-col gap-2 p-4 rounded-xl border text-left transition-all hover:scale-[1.02] active:scale-[0.98] ${
                                    active
                                        ? `bg-gradient-to-br ${colorCls}`
                                        : 'bg-white/[0.02] border-white/[0.05] opacity-60 hover:opacity-80'
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <Icon className={`w-4 h-4 ${active ? iconColor : 'text-zinc-600'}`} />
                                    {active
                                        ? <ToggleRight className="w-5 h-5 text-emerald-400" />
                                        : <ToggleLeft className="w-5 h-5 text-zinc-600" />
                                    }
                                </div>
                                <div>
                                    <p className={`text-[12px] font-semibold ${active ? 'text-white' : 'text-zinc-500'}`}>{label}</p>
                                    <p className="text-[10px] text-zinc-600 mt-0.5">{desc}</p>
                                </div>
                                {active && (
                                    <span className="absolute top-2 right-10 text-[9px] font-bold text-emerald-400 uppercase tracking-wider">Acik</span>
                                )}
                            </button>
                        );
                    })}
                </div>
            )}
            <p className="text-[10px] text-zinc-700 mt-3 text-center">
                Karta tıklayarak hizmeti açın veya kapatın. Değişiklikler anında müşteri paneline yansır.
            </p>
        </div>
    );
}
