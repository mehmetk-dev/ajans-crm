import { Clock, Pencil, Trash2 } from 'lucide-react';
import type { MaintenanceLogEntry } from '../api/maintenanceLog.types';
import {
    MAINTENANCE_CATEGORY_COLORS,
    MAINTENANCE_CATEGORY_LABELS,
} from '../model/maintenanceLog.constants';
import { formatMaintenanceDate } from '../model/maintenanceLogDate';
import { UserAvatar } from '../../../components/UserAvatar';

interface Props {
    entries: MaintenanceLogEntry[];
    onEdit: (entry: MaintenanceLogEntry) => void;
    onDelete: (entryId: string) => void;
}

export function MaintenanceLogList({ entries, onEdit, onDelete }: Props) {
    return (
        <div className="space-y-2">
            {entries.map(entry => (
                <div
                    key={entry.id}
                    className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08] transition-colors"
                >
                    <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between gap-2 flex-wrap">
                            <p className="text-sm font-semibold text-white">{entry.title}</p>
                            <span className="text-[11px] text-zinc-500 flex items-center gap-1 flex-shrink-0">
                                <Clock className="w-3 h-3" />
                                {formatMaintenanceDate(entry.performedAt)}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1.5">
                            <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full ${MAINTENANCE_CATEGORY_COLORS[entry.category]}`}>
                                {MAINTENANCE_CATEGORY_LABELS[entry.category]}
                            </span>
                            {entry.performedByName && (
                                <span className="text-[11px] text-zinc-500 flex items-center gap-1">
                                    <UserAvatar name={entry.performedByName} avatarUrl={entry.performedByAvatarUrl} className="h-4 w-4 rounded text-[8px]" />
                                    {entry.performedByName}
                                </span>
                            )}
                        </div>
                        {entry.description && (
                            <p className="text-xs text-zinc-400 mt-2 leading-relaxed">{entry.description}</p>
                        )}
                    </div>
                    <div className="flex flex-col gap-1 flex-shrink-0">
                        <button
                            onClick={() => onEdit(entry)}
                            className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-white/[0.06] transition-colors"
                            title="Düzenle"
                        >
                            <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                            onClick={() => onDelete(entry.id)}
                            className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            title="Sil"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
