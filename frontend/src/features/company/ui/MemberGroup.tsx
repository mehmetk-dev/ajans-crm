import { ChevronDown, ChevronUp } from 'lucide-react';
import type { MembershipInfo, MembershipRole } from '../api/company.types';

interface Props {
    title: string;
    role: MembershipRole;
    members: MembershipInfo[];
    selectedId?: string;
    emptyText: string;
    accent: 'amber' | 'blue' | 'pink';
    onSelect: (member: MembershipInfo) => void;
}

const accents = {
    amber: {
        heading: 'text-amber-400',
        dot: 'bg-amber-400',
        avatar: 'bg-amber-500/10 text-amber-400',
        badge: 'bg-amber-500/10 text-amber-400',
    },
    blue: {
        heading: 'text-blue-400',
        dot: 'bg-blue-400',
        avatar: 'bg-zinc-800 text-zinc-400',
        badge: 'bg-zinc-700/50 text-zinc-400',
    },
    pink: {
        heading: 'text-pink-400',
        dot: 'bg-pink-400',
        avatar: 'bg-pink-500/10 text-pink-400',
        badge: 'bg-pink-500/10 text-pink-400',
    },
};

export function MemberGroup({
    title,
    role,
    members,
    selectedId,
    emptyText,
    accent,
    onSelect,
}: Props) {
    const roleMembers = members.filter(member => member.membershipRole === role);
    const styles = accents[accent];

    return (
        <div className="mb-4">
            <h4 className={`text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-1.5 ${styles.heading}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${styles.dot}`} />
                {title} ({roleMembers.length})
            </h4>
            <div className="space-y-2">
                {roleMembers.map(member => {
                    const selected = selectedId === member.id;
                    return (
                        <button
                            key={member.id}
                            onClick={() => onSelect(member)}
                            className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${selected ? 'bg-white/5 ring-1 ring-orange-500/30' : 'hover:bg-white/[0.02]'}`}
                        >
                            <div className={`h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold ${styles.avatar}`}>
                                {member.fullName?.charAt(0) || 'U'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate">{member.fullName}</p>
                                <p className="text-xs text-zinc-600 truncate">{member.email}</p>
                            </div>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${styles.badge}`}>
                                {title}
                            </span>
                            {selected
                                ? <ChevronUp className="w-4 h-4 text-zinc-500" />
                                : <ChevronDown className="w-4 h-4 text-zinc-600" />}
                        </button>
                    );
                })}
                {roleMembers.length === 0 && (
                    <p className="text-zinc-600 text-sm text-center py-2">{emptyText}</p>
                )}
            </div>
        </div>
    );
}
