import { useState } from 'react';
import { UserPlus, Users } from 'lucide-react';
import type { AddEmployeeInput, CompanyResponse, MembershipInfo } from '../api/company.types';
import { useAddEmployee } from '../hooks/useCompanies';
import { AddEmployeeForm } from './AddEmployeeForm';
import { MemberGroup } from './MemberGroup';
import { PermissionPanel } from './PermissionPanel';

interface Props {
    company: CompanyResponse;
}

const emptyEmployee = (): AddEmployeeInput => ({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    position: '',
    department: '',
});

export function CompanyMembersPanel({ company }: Props) {
    const [showForm, setShowForm] = useState(false);
    const [selectedMember, setSelectedMember] = useState<MembershipInfo | null>(null);
    const [form, setForm] = useState<AddEmployeeInput>(emptyEmployee);
    const addEmployee = useAddEmployee(company.id);
    const members = company.members ?? [];

    function add() {
        addEmployee.mutate(form, {
            onSuccess: () => {
                setShowForm(false);
                setForm(emptyEmployee());
            },
        });
    }

    function select(member: MembershipInfo) {
        setSelectedMember(current => current?.id === member.id ? null : member);
    }

    return (
        <>
            <div className="bg-[#0C0C0E] border border-white/[0.06] rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Üyeler ({members.length})
                    </h3>
                    <button
                        onClick={() => setShowForm(value => !value)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-500/10 text-orange-400 text-sm font-medium hover:bg-orange-500/20 transition-colors"
                    >
                        <UserPlus className="w-4 h-4" />
                        Çalışan Ekle
                    </button>
                </div>

                {showForm && (
                    <AddEmployeeForm
                        form={form}
                        pending={addEmployee.isPending}
                        onChange={setForm}
                        onCancel={() => setShowForm(false)}
                        onSubmit={add}
                    />
                )}

                <MemberGroup title="Şirket Sahibi" role="OWNER" members={members}
                    selectedId={selectedMember?.id} emptyText="Şirket sahibi bulunamadı"
                    accent="amber" onSelect={select} />
                <MemberGroup title="Çalışanlar" role="EMPLOYEE" members={members}
                    selectedId={selectedMember?.id} emptyText="Henüz çalışan eklenmemiş"
                    accent="blue" onSelect={select} />
                <MemberGroup title="Ajans Yetkilileri" role="AGENCY_STAFF" members={members}
                    selectedId={selectedMember?.id} emptyText="Henüz yetkili atanmamış"
                    accent="pink" onSelect={select} />
            </div>

            {selectedMember && (
                <PermissionPanel
                    companyId={company.id}
                    member={selectedMember}
                    onRemoved={() => setSelectedMember(null)}
                />
            )}
        </>
    );
}
