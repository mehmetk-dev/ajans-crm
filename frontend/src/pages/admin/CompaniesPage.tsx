import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { getApiErrorMessage } from '../../lib/apiError';
import {
    companyApi,
    CreateCompanyForm,
    CompanyList,
    CompanyListEmptyState,
    EditCompanyForm,
    DeleteCompanyConfirm,
    type CompanyResponse,
    type CreateCompanyInput,
    type UpdateCompanyInput,
} from '../../features/company';

const ALL_SERVICES = ['DIGITAL_MARKETING', 'WEB_DESIGN', 'AD_MANAGEMENT', 'SOCIAL_MEDIA', 'PRODUCTION', 'CONTENT_MARKETING'];

const EMPTY_CREATE: CreateCompanyInput = {
    name: '', industry: '', email: '', phone: '', address: '', website: '', notes: '',
    taxId: '', foundedYear: undefined,
    socialInstagram: '', socialFacebook: '', socialTwitter: '', socialLinkedin: '', socialYoutube: '', socialTiktok: '',
    ownerFullName: '', ownerEmail: '', ownerPassword: '', ownerPhone: '', ownerPosition: '',
    selectedServices: [],
};

function cleanPayload<T extends Record<string, unknown>>(form: T): T {
    const payload: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(form)) {
        payload[key] = typeof value === 'string' && value.trim() === '' ? undefined : value;
    }
    return payload as T;
}

export default function CompaniesPage() {
    const [companies, setCompanies] = useState<CompanyResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [loadError, setLoadError] = useState('');

    const [editingCompany, setEditingCompany] = useState<CompanyResponse | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<CompanyResponse | null>(null);
    const [editForm, setEditForm] = useState<UpdateCompanyInput>({ name: '' });
    const [editSaving, setEditSaving] = useState(false);
    const [editError, setEditError] = useState('');

    const [form, setForm] = useState<CreateCompanyInput>(EMPTY_CREATE);

    useEffect(() => {
        loadCompanies();
    }, []);

    const loadCompanies = () => {
        setLoading(true);
        setLoadError('');
        companyApi.listAdmin()
            .then(setCompanies)
            .catch((err: unknown) => setLoadError(getApiErrorMessage(err, 'Şirketler yüklenemedi')))
            .finally(() => setLoading(false));
    };

    const toggleService = (cat: string) => {
        setForm(prev => ({
            ...prev,
            selectedServices: prev.selectedServices?.includes(cat)
                ? prev.selectedServices.filter(s => s !== cat)
                : [...(prev.selectedServices ?? []), cat]
        }));
    };

    const toggleAllServices = () => {
        setForm(p => ({
            ...p,
            selectedServices: p.selectedServices?.length === ALL_SERVICES.length ? [] : [...ALL_SERVICES],
        }));
    };

    const updateField = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));
    const updateFoundedYear = (value: string) =>
        setForm(p => ({ ...p, foundedYear: value ? parseInt(value) : undefined }));
    const updateEditField = (field: string, value: string | number) => setEditForm(prev => ({ ...prev, [field]: value }));

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        try {
            await companyApi.create(cleanPayload(form as unknown as Record<string, unknown>) as unknown as CreateCompanyInput);
            setShowForm(false);
            setForm(EMPTY_CREATE);
            loadCompanies();
        } catch (err: unknown) {
            setError(getApiErrorMessage(err, 'Şirket oluşturulamadı'));
        } finally {
            setSaving(false);
        }
    };

    const openEdit = (e: React.MouseEvent, company: CompanyResponse) => {
        e.preventDefault();
        e.stopPropagation();
        setEditForm({
            name: company.name,
            industry: company.industry || '',
            email: company.email || '',
            phone: company.phone || '',
            address: company.address || '',
            website: company.website || '',
            notes: company.notes || '',
            taxId: company.taxId || '',
            foundedYear: company.foundedYear ?? undefined,
            socialInstagram: company.socialInstagram || '',
            socialFacebook: company.socialFacebook || '',
            socialTwitter: company.socialTwitter || '',
            socialLinkedin: company.socialLinkedin || '',
            socialYoutube: company.socialYoutube || '',
            socialTiktok: company.socialTiktok || '',
        });
        setEditError('');
        setEditingCompany(company);
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingCompany) return;
        setEditSaving(true);
        setEditError('');
        try {
            await companyApi.update(editingCompany.id, cleanPayload(editForm as unknown as Record<string, unknown>) as unknown as UpdateCompanyInput);
            setEditingCompany(null);
            loadCompanies();
        } catch (err: unknown) {
            setEditError(getApiErrorMessage(err, 'Şirket güncellenemedi'));
        } finally {
            setEditSaving(false);
        }
    };

    const openDelete = (e: React.MouseEvent, company: CompanyResponse) => {
        e.preventDefault();
        e.stopPropagation();
        setDeleteConfirm(company);
    };

    const handleDelete = async () => {
        if (!deleteConfirm) return;
        try {
            await companyApi.delete(deleteConfirm.id);
            setDeleteConfirm(null);
            loadCompanies();
        } catch (err: unknown) {
            alert(getApiErrorMessage(err, 'Şirket silinemedi'));
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Şirketler</h1>
                    <p className="text-zinc-500 text-[13px] mt-1">Müşteri şirketlerinizi yönetin</p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 text-[13px] shadow-lg shadow-orange-500/20 transition-all"
                >
                    <Plus className="w-4 h-4" />
                    Yeni Şirket
                </button>
            </div>

            {loadError ? (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{loadError}</div>
            ) : loading ? (
                <div className="flex items-center justify-center h-40">
                    <div className="h-8 w-8 border-2 border-zinc-800 border-t-orange-500 rounded-full animate-spin" />
                </div>
            ) : companies.length === 0 ? (
                <CompanyListEmptyState />
            ) : (
                <CompanyList
                    companies={companies}
                    onEdit={openEdit}
                    onDelete={openDelete}
                />
            )}

            <AnimatePresence>
                {showForm && (
                    <ModalShell onClose={() => setShowForm(false)}>
                        <CreateCompanyForm
                            form={form}
                            saving={saving}
                            error={error}
                            onFieldChange={updateField}
                            onFoundedYearChange={updateFoundedYear}
                            onToggleService={toggleService}
                            onSelectAllServices={toggleAllServices}
                            onSubmit={handleCreate}
                            onClose={() => setShowForm(false)}
                        />
                    </ModalShell>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {editingCompany && (
                    <ModalShell onClose={() => setEditingCompany(null)}>
                        <EditCompanyForm
                            form={editForm}
                            saving={editSaving}
                            error={editError}
                            onFieldChange={updateEditField}
                            onSubmit={handleUpdate}
                            onClose={() => setEditingCompany(null)}
                        />
                    </ModalShell>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {deleteConfirm && (
                    <ModalShell onClose={() => setDeleteConfirm(null)} widthClass="max-w-sm" noPadding>
                        <div className="p-6">
                            <DeleteCompanyConfirm
                                companyName={deleteConfirm.name}
                                onCancel={() => setDeleteConfirm(null)}
                                onConfirm={handleDelete}
                            />
                        </div>
                    </ModalShell>
                )}
            </AnimatePresence>
        </div>
    );
}

interface ModalShellProps {
    onClose: () => void;
    children: React.ReactNode;
    widthClass?: string;
    noPadding?: boolean;
}

function ModalShell({ onClose, children, widthClass = 'max-w-xl', noPadding = false }: ModalShellProps) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className={`glass-panel rounded-2xl w-full ${widthClass} max-h-[90vh] ${noPadding ? '' : 'overflow-auto'}`}
                onClick={e => e.stopPropagation()}
            >
                {children}
            </motion.div>
        </motion.div>
    );
}
