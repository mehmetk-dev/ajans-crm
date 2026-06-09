import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { LayoutTemplate, Loader2, Save } from 'lucide-react';
import { companyApi, type CompanyResponse } from '../../features/company';
import { MaintenanceLogPanel } from '../../features/maintenance-log';

interface Props {
    company: CompanyResponse;
}

interface InfraForm {
    hostingProvider: string;
    domainExpiry: string;
    sslExpiry: string;
    cmsType: string;
    cmsVersion: string;
    themeName: string;
}

function infraFormFromCompany(company: CompanyResponse): InfraForm {
    return {
        hostingProvider: company.hostingProvider ?? '',
        domainExpiry: company.domainExpiry ?? '',
        sslExpiry: company.sslExpiry ?? '',
        cmsType: company.cmsType ?? '',
        cmsVersion: company.cmsVersion ?? '',
        themeName: company.themeName ?? '',
    };
}

const inputClass = 'bg-[#0C0C0E] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:border-[#C8697A]/50 focus:outline-none w-full';
const labelClass = 'text-[11px] uppercase tracking-wider text-zinc-500 mb-1 block';

export default function WebDesignAdminSection({ company }: Props) {
    const queryClient = useQueryClient();
    const [infraForm, setInfraForm] = useState<InfraForm>(() => infraFormFromCompany(company));
    const [infraDirty, setInfraDirty] = useState(false);
    const [companySnapshotId, setCompanySnapshotId] = useState(company.id);

    if (companySnapshotId !== company.id) {
        setCompanySnapshotId(company.id);
        setInfraForm(infraFormFromCompany(company));
        setInfraDirty(false);
    }

    const saveInfrastructure = useMutation({
        mutationFn: () => companyApi.updateInfrastructure(company.id, {
            hostingProvider: infraForm.hostingProvider || null,
            domainExpiry: infraForm.domainExpiry || null,
            sslExpiry: infraForm.sslExpiry || null,
            cmsType: infraForm.cmsType || null,
            cmsVersion: infraForm.cmsVersion || null,
            themeName: infraForm.themeName || null,
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['company', company.id] });
            setInfraDirty(false);
        },
    });

    function updateInfrastructure(key: keyof InfraForm, value: string) {
        setInfraForm(previous => ({ ...previous, [key]: value }));
        setInfraDirty(true);
    }

    return (
        <div className="space-y-4">
            <div className="bg-[#0C0C0E] border border-white/[0.06] rounded-2xl p-5 space-y-6">
                <div className="flex items-center gap-2">
                    <LayoutTemplate className="w-4 h-4 text-[#F5BEC8]" />
                    <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">Web Tasarım</h3>
                </div>
                <div>
                    <h4 className="text-xs font-semibold text-zinc-400 mb-3">Altyapı Bilgileri</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        <div>
                            <label className={labelClass}>Hosting</label>
                            <input
                                className={inputClass}
                                placeholder="Örn. Hetzner, Cloudways"
                                value={infraForm.hostingProvider}
                                onChange={event => updateInfrastructure('hostingProvider', event.target.value)}
                            />
                        </div>
                        <div>
                            <label className={labelClass}>Domain Bitiş</label>
                            <input
                                type="date"
                                className={inputClass}
                                value={infraForm.domainExpiry}
                                onChange={event => updateInfrastructure('domainExpiry', event.target.value)}
                            />
                        </div>
                        <div>
                            <label className={labelClass}>SSL Bitiş</label>
                            <input
                                type="date"
                                className={inputClass}
                                value={infraForm.sslExpiry}
                                onChange={event => updateInfrastructure('sslExpiry', event.target.value)}
                            />
                        </div>
                        <div>
                            <label className={labelClass}>CMS</label>
                            <input
                                className={inputClass}
                                placeholder="Örn. WordPress"
                                value={infraForm.cmsType}
                                onChange={event => updateInfrastructure('cmsType', event.target.value)}
                            />
                        </div>
                        <div>
                            <label className={labelClass}>CMS Versiyonu</label>
                            <input
                                className={inputClass}
                                placeholder="Örn. 6.4"
                                value={infraForm.cmsVersion}
                                onChange={event => updateInfrastructure('cmsVersion', event.target.value)}
                            />
                        </div>
                        <div>
                            <label className={labelClass}>Tema</label>
                            <input
                                className={inputClass}
                                placeholder="Örn. Astra Pro"
                                value={infraForm.themeName}
                                onChange={event => updateInfrastructure('themeName', event.target.value)}
                            />
                        </div>
                    </div>
                    <div className="flex justify-end mt-3">
                        <button
                            onClick={() => saveInfrastructure.mutate()}
                            disabled={!infraDirty || saveInfrastructure.isPending}
                            className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-[#C8697A] text-white text-sm font-medium hover:bg-[#B85B6E] disabled:opacity-40 transition-colors"
                        >
                            {saveInfrastructure.isPending
                                ? <Loader2 className="w-4 h-4 animate-spin" />
                                : <Save className="w-4 h-4" />}
                            {saveInfrastructure.isPending ? 'Kaydediliyor' : 'Altyapıyı Kaydet'}
                        </button>
                    </div>
                </div>
            </div>
            <MaintenanceLogPanel companyId={company.id} />
        </div>
    );
}
