import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi, type CompanyResponse, type MembershipInfo, type PermissionResponse, type CompanyServiceItem } from '../../api/admin';
import {
    ArrowLeft, Building2, Users, Mail, Phone, Globe, MapPin, Calendar, Shield,
    Trash2, ChevronDown, ChevronUp, Briefcase, ExternalLink, UserPlus,
    Instagram, Facebook, Twitter, Linkedin, Youtube,
    BarChart3, Megaphone, Camera, FileText, LayoutTemplate, ToggleLeft, ToggleRight
} from 'lucide-react';
import WebDesignAdminSection from '../../components/admin/WebDesignAdminSection';

const PERMISSION_LABELS: Record<string, string> = {
    'messages.general.write': 'Genel Kanalda Mesaj Yazma',
    'messages.dm.start': 'Özel Mesaj Başlatma',
    'messages.dm.write': 'Özel Mesajda Yazma',
    'tasks.view': 'Görevleri Görme',
    'tasks.create': 'Görev Oluşturma',
    'tasks.update': 'Görev Güncelleme',
    'calendar.view': 'Takvimi Görme',
    'calendar.create': 'Etkinlik Oluşturma',
    'meetings.request': 'Toplantı Talebi',
    'reports.view': 'Raporları Görme',
    'pr.view': 'PR Projelerini Görme',
    'pr.create': 'PR Projesi Oluşturma',
    'shoots.view': 'Çekimleri Görme',
    'shoots.create': 'Çekim Planlama',
    'panel.dashboard': 'Dashboard Erişimi',
    'panel.companies': 'Şirketler Erişimi',
    'panel.completed_tasks': 'Tamamlanan İşler',
};

const LEVEL_STYLES: Record<string, string> = {
    FULL: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
    RESTRICTED: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    NONE: 'bg-zinc-700/30 text-zinc-500 border-zinc-600/30',
};

export default function CompanyDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [showAddEmployee, setShowAddEmployee] = useState(false);
    const [selectedMember, setSelectedMember] = useState<MembershipInfo | null>(null);
    const [employeeForm, setEmployeeForm] = useState({ fullName: '', email: '', password: '', phone: '', position: '', department: '' });

    const { data: company, isLoading } = useQuery<CompanyResponse>({
        queryKey: ['company', id],
        queryFn: () => adminApi.getCompany(id!),
        enabled: !!id,
    });

    const { data: permissions } = useQuery<PermissionResponse[]>({
        queryKey: ['permissions', selectedMember?.userId, id],
        queryFn: () => adminApi.getPermissions(selectedMember!.userId, id!),
        enabled: !!selectedMember && !!id,
    });

    const addEmployeeMutation = useMutation({
        mutationFn: (data: typeof employeeForm) => adminApi.addEmployee(id!, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['company', id] });
            setShowAddEmployee(false);
            setEmployeeForm({ fullName: '', email: '', password: '', phone: '', position: '', department: '' });
        },
    });

    const removeEmployeeMutation = useMutation({
        mutationFn: (userId: string) => adminApi.removeEmployee(id!, userId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['company', id] });
            setSelectedMember(null);
        },
    });

    const updatePermissionMutation = useMutation({
        mutationFn: (data: { permissionKey: string; level: string }) =>
            adminApi.updatePermission({
                userId: selectedMember!.userId,
                companyId: id!,
                permissionKey: data.permissionKey,
                level: data.level,
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['permissions', selectedMember?.userId, id] });
        },
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin h-8 w-8 border-2 border-orange-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    if (!company) return <div className="text-zinc-500 text-center py-12">Şirket bulunamadı</div>;

    const cycleLevels = ['NONE', 'RESTRICTED', 'FULL'];
    const nextLevel = (current: string) => cycleLevels[(cycleLevels.indexOf(current) + 1) % 3];

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

            {/* Members */}
            <div className="bg-[#0C0C0E] border border-white/[0.06] rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Üyeler ({company.members?.length || 0})
                    </h3>
                    <button onClick={() => setShowAddEmployee(!showAddEmployee)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-500/10 text-orange-400 text-sm font-medium hover:bg-orange-500/20 transition-colors">
                        <UserPlus className="w-4 h-4" />
                        Çalışan Ekle
                    </button>
                </div>

                {/* Add Employee Form */}
                {showAddEmployee && (
                    <div className="mb-4 p-4 bg-[#18181b]/50 rounded-xl border border-white/[0.06] space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <input placeholder="Ad Soyad *" value={employeeForm.fullName}
                                onChange={e => setEmployeeForm(p => ({ ...p, fullName: e.target.value }))}
                                className="bg-[#0C0C0E] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:border-orange-500/50 focus:outline-none" />
                            <input placeholder="Email *" type="email" value={employeeForm.email}
                                onChange={e => setEmployeeForm(p => ({ ...p, email: e.target.value }))}
                                className="bg-[#0C0C0E] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:border-orange-500/50 focus:outline-none" />
                            <input placeholder="Şifre *" type="password" value={employeeForm.password}
                                onChange={e => setEmployeeForm(p => ({ ...p, password: e.target.value }))}
                                className="bg-[#0C0C0E] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:border-orange-500/50 focus:outline-none" />
                            <input placeholder="Telefon" value={employeeForm.phone}
                                onChange={e => setEmployeeForm(p => ({ ...p, phone: e.target.value }))}
                                className="bg-[#0C0C0E] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:border-orange-500/50 focus:outline-none" />
                            <input placeholder="Pozisyon" value={employeeForm.position}
                                onChange={e => setEmployeeForm(p => ({ ...p, position: e.target.value }))}
                                className="bg-[#0C0C0E] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:border-orange-500/50 focus:outline-none" />
                            <input placeholder="Departman" value={employeeForm.department}
                                onChange={e => setEmployeeForm(p => ({ ...p, department: e.target.value }))}
                                className="bg-[#0C0C0E] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:border-orange-500/50 focus:outline-none" />
                        </div>
                        <div className="flex gap-2 justify-end">
                            <button onClick={() => setShowAddEmployee(false)}
                                className="px-3 py-1.5 rounded-lg text-sm text-zinc-500 hover:text-white transition-colors">
                                İptal
                            </button>
                            <button
                                onClick={() => addEmployeeMutation.mutate(employeeForm)}
                                disabled={!employeeForm.fullName || !employeeForm.email || !employeeForm.password || addEmployeeMutation.isPending}
                                className="px-4 py-1.5 rounded-lg bg-orange-500 text-white text-sm font-medium hover:bg-orange-600 disabled:opacity-40 transition-colors">
                                {addEmployeeMutation.isPending ? 'Ekleniyor...' : 'Ekle'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Owner */}
                {company.members?.filter(m => m.membershipRole === 'OWNER').length > 0 && (
                    <div className="mb-4">
                        <h4 className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                            Şirket Sahibi
                        </h4>
                        <div className="space-y-2">
                            {company.members?.filter(m => m.membershipRole === 'OWNER').map((member) => (
                                <div key={member.id}
                                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${selectedMember?.id === member.id ? 'bg-white/5 ring-1 ring-orange-500/30' : 'hover:bg-white/[0.02]'}`}
                                    onClick={() => setSelectedMember(selectedMember?.id === member.id ? null : member)}>
                                    <div className="h-9 w-9 rounded-full bg-amber-500/10 flex items-center justify-center text-sm font-bold text-amber-400">
                                        {member.fullName?.charAt(0) || 'U'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-white truncate">{member.fullName}</p>
                                        <p className="text-xs text-zinc-600 truncate">{member.email}</p>
                                    </div>
                                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-amber-500/10 text-amber-400">
                                        Sahip
                                    </span>
                                    {selectedMember?.id === member.id ? <ChevronUp className="w-4 h-4 text-zinc-500" /> : <ChevronDown className="w-4 h-4 text-zinc-600" />}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Employees (OWNER excluded, EMPLOYEE only) */}
                <div className="mb-4">
                    <h4 className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                        Çalışanlar ({company.members?.filter(m => m.membershipRole === 'EMPLOYEE').length || 0})
                    </h4>
                    <div className="space-y-2">
                        {company.members?.filter(m => m.membershipRole === 'EMPLOYEE').map((member) => (
                            <div key={member.id}
                                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${selectedMember?.id === member.id ? 'bg-white/5 ring-1 ring-orange-500/30' : 'hover:bg-white/[0.02]'}`}
                                onClick={() => setSelectedMember(selectedMember?.id === member.id ? null : member)}>
                                <div className="h-9 w-9 rounded-full bg-zinc-800 flex items-center justify-center text-sm font-bold text-zinc-400">
                                    {member.fullName?.charAt(0) || 'U'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-white truncate">{member.fullName}</p>
                                    <p className="text-xs text-zinc-600 truncate">{member.email}</p>
                                </div>
                                <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-zinc-700/50 text-zinc-400">
                                    Çalışan
                                </span>
                                {selectedMember?.id === member.id ? <ChevronUp className="w-4 h-4 text-zinc-500" /> : <ChevronDown className="w-4 h-4 text-zinc-600" />}
                            </div>
                        ))}
                        {(!company.members || company.members.filter(m => m.membershipRole === 'EMPLOYEE').length === 0) && (
                            <p className="text-zinc-600 text-sm text-center py-2">Henüz çalışan eklenmemiş</p>
                        )}
                    </div>
                </div>

                {/* Agency Staff (Yetkililer) */}
                <div>
                    <h4 className="text-xs font-semibold text-pink-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-pink-400" />
                        Yetkililer ({company.members?.filter(m => m.membershipRole === 'AGENCY_STAFF').length || 0})
                    </h4>
                    <div className="space-y-2">
                        {company.members?.filter(m => m.membershipRole === 'AGENCY_STAFF').map((member) => (
                            <div key={member.id}
                                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${selectedMember?.id === member.id ? 'bg-white/5 ring-1 ring-orange-500/30' : 'hover:bg-white/[0.02]'}`}
                                onClick={() => setSelectedMember(selectedMember?.id === member.id ? null : member)}>
                                <div className="h-9 w-9 rounded-full bg-pink-500/10 flex items-center justify-center text-sm font-bold text-pink-400">
                                    {member.fullName?.charAt(0) || 'U'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-white truncate">{member.fullName}</p>
                                    <p className="text-xs text-zinc-600 truncate">{member.email}</p>
                                </div>
                                <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-pink-500/10 text-pink-400">
                                    Ajans Yetkilisi
                                </span>
                                {selectedMember?.id === member.id ? <ChevronUp className="w-4 h-4 text-zinc-500" /> : <ChevronDown className="w-4 h-4 text-zinc-600" />}
                            </div>
                        ))}
                        {(!company.members || company.members.filter(m => m.membershipRole === 'AGENCY_STAFF').length === 0) && (
                            <p className="text-zinc-600 text-sm text-center py-2">Henüz yetkili atanmamış</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Permissions Panel */}
            {selectedMember && (
                <div className="bg-[#0C0C0E] border border-white/[0.06] rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                            <Shield className="w-4 h-4" />
                            {selectedMember.fullName} — İzinler
                        </h3>
                        {selectedMember.membershipRole !== 'OWNER' && (
                            <button
                                onClick={() => {
                                    if (confirm(`${selectedMember.fullName} bu şirketten çıkarılsın mı?`)) {
                                        removeEmployeeMutation.mutate(selectedMember.userId);
                                    }
                                }}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-red-400 hover:bg-red-500/10 transition-colors">
                                <Trash2 className="w-3 h-3" />
                                Üyeliği Kaldır
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {permissions?.map((perm) => (
                            <button key={perm.permissionKey}
                                onClick={() => updatePermissionMutation.mutate({
                                    permissionKey: perm.permissionKey,
                                    level: nextLevel(perm.level),
                                })}
                                className={`flex items-center justify-between p-3 rounded-xl border transition-all hover:scale-[1.01] ${LEVEL_STYLES[perm.level]}`}>
                                <span className="text-sm">{PERMISSION_LABELS[perm.permissionKey] || perm.permissionKey}</span>
                                <span className="text-xs font-bold uppercase tracking-wider opacity-80">{perm.level}</span>
                            </button>
                        )) || (
                                <p className="text-zinc-600 text-sm col-span-2 text-center py-4">Yükleniyor...</p>
                            )}
                    </div>
                    <p className="text-[10px] text-zinc-700 mt-3 text-center">İzin seviyesini değiştirmek için tıklayın: NONE → RESTRICTED → FULL</p>
                </div>
            )}
        </div>
    );
}

// ===============================================================================
// SERVICE MANAGEMENT SECTION
// ===============================================================================

const SERVICE_META = [
    { category: 'DIGITAL_MARKETING', label: 'Dijital Pazarlama', desc: 'Google Analytics + Search Console', icon: BarChart3, color: 'blue' },
    { category: 'WEB_DESIGN',        label: 'Web Tasar�m�',      desc: 'PageSpeed + Site Verileri',       icon: LayoutTemplate, color: 'cyan' },
    { category: 'AD_MANAGEMENT',     label: 'Reklam Y�netimi',  desc: 'Google Ads + Meta Ads',           icon: Megaphone, color: 'amber' },
    { category: 'SOCIAL_MEDIA',      label: 'Sosyal Medya',     desc: 'Instagram Analiz + Reels',        icon: Instagram, color: 'pink' },
    { category: 'PRODUCTION',        label: 'Prod�ksiyon',      desc: 'Cekim Takvimi',                   icon: Camera, color: 'violet' },
    { category: 'CONTENT_MARKETING', label: 'Icerik Pazarlama', desc: 'Icerik Plani',                   icon: FileText, color: 'emerald' },
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
                <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Hizmet Yonetimi</h3>
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
                Karta tiklayarak hizmeti acin veya kapatin � degisiklikler aninda musteri paneline yansiir
            </p>
        </div>
    );
}
