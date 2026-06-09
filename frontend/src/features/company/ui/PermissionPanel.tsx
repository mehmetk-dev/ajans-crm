import { Shield, Trash2 } from 'lucide-react';
import type { MembershipInfo } from '../api/company.types';
import { useCompanyPermissions, useRemoveEmployee, useUpdatePermission } from '../hooks/useCompanies';
import {
    nextPermissionLevel,
    PERMISSION_LABELS,
    PERMISSION_LEVEL_STYLES,
} from '../model/permission.constants';

interface Props {
    companyId: string;
    member: MembershipInfo;
    onRemoved: () => void;
}

export function PermissionPanel({ companyId, member, onRemoved }: Props) {
    const { data: permissions, isLoading } = useCompanyPermissions(companyId, member.userId);
    const updatePermission = useUpdatePermission(companyId, member.userId);
    const removeEmployee = useRemoveEmployee(companyId);

    function remove() {
        if (confirm(`${member.fullName} bu şirketten çıkarılsın mı?`)) {
            removeEmployee.mutate(member.userId, { onSuccess: onRemoved });
        }
    }

    return (
        <div className="bg-[#0C0C0E] border border-white/[0.06] rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    {member.fullName} - İzinler
                </h3>
                {member.membershipRole === 'EMPLOYEE' && (
                    <button
                        onClick={remove}
                        disabled={removeEmployee.isPending}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                        <Trash2 className="w-3 h-3" />
                        Üyeliği Kaldır
                    </button>
                )}
            </div>

            {isLoading ? (
                <p className="text-zinc-600 text-sm text-center py-4">Yükleniyor...</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {permissions?.map(permission => (
                        <button
                            key={permission.permissionKey}
                            onClick={() => updatePermission.mutate({
                                permissionKey: permission.permissionKey,
                                level: nextPermissionLevel(permission.level),
                            })}
                            className={`flex items-center justify-between p-3 rounded-xl border transition-all hover:scale-[1.01] ${PERMISSION_LEVEL_STYLES[permission.level]}`}
                        >
                            <span className="text-sm">
                                {PERMISSION_LABELS[permission.permissionKey] || permission.permissionKey}
                            </span>
                            <span className="text-xs font-bold uppercase tracking-wider opacity-80">
                                {permission.level}
                            </span>
                        </button>
                    ))}
                </div>
            )}
            <p className="text-[10px] text-zinc-700 mt-3 text-center">
                İzin seviyesini değiştirmek için tıklayın: NONE → RESTRICTED → FULL
            </p>
        </div>
    );
}
