import type { AssignableUser } from '../../tasks';

interface PrProjectMemberSelectorProps {
    users: AssignableUser[];
    selectedIds: string[];
    onChange: (ids: string[]) => void;
}

export function PrProjectMemberSelector({
    users,
    selectedIds,
    onChange,
}: PrProjectMemberSelectorProps) {
    return (
        <div role="group" aria-labelledby="project-team-heading">
            <h3 id="project-team-heading" className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                Proje Ekibi
            </h3>
            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {users.map(user => (
                    <label
                        key={user.id}
                        className="flex items-center gap-2 px-3 py-2 bg-white/[0.02] border border-white/[0.04] rounded-lg text-xs text-zinc-300"
                    >
                        <input
                            type="checkbox"
                            checked={selectedIds.includes(user.id)}
                            onChange={event => onChange(event.target.checked
                                ? [...selectedIds, user.id]
                                : selectedIds.filter(id => id !== user.id))}
                        />
                        {user.fullName}
                    </label>
                ))}
            </div>
        </div>
    );
}
