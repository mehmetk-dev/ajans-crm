import { Calendar, Camera, Clock, FileText, MapPin, User } from 'lucide-react';
import type { ShootResponse } from '../api/shoot.types';
import { shootStatusMeta } from '../model/shoot.constants';
import { getShootDisplayStatus } from '../model/shoot.utils';

export function ShootCard({ shoot, onClick }: { shoot: ShootResponse; onClick: () => void }) {
    const status = shootStatusMeta[getShootDisplayStatus(shoot)];
    return (
        <button onClick={onClick}
            className="w-full text-left bg-[#0C0C0E] border border-white/[0.06] rounded-2xl p-5 hover:border-violet-500/20 transition-colors">
            <div className="flex items-start gap-4">
                <div className="h-11 w-11 rounded-xl bg-violet-500/10 flex items-center justify-center">
                    <Camera className="w-5 h-5 text-violet-400" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-bold text-white truncate">{shoot.title}</h3>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${status.className}`}>{status.label}</span>
                        {shoot.linkedContentCount > 0 && (
                            <span className="flex items-center gap-1 text-[10px] text-violet-400">
                                <FileText className="w-3 h-3" />{shoot.linkedContentCount} içerik
                            </span>
                        )}
                    </div>
                    <p className="text-xs text-zinc-500 mt-1">{shoot.companyName}</p>
                    <div className="flex flex-wrap gap-3 mt-3 text-[11px] text-zinc-500">
                        {shoot.shootDate && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(shoot.shootDate)}</span>}
                        {shoot.shootTime && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{shoot.shootTime.slice(0, 5)}</span>}
                        {shoot.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{shoot.location}</span>}
                        {shoot.photographerName && (
                            <span className="flex items-center gap-1.5">
                                {shoot.photographerAvatarUrl ? (
                                    <img
                                        src={shoot.photographerAvatarUrl}
                                        alt={shoot.photographerName}
                                        className="h-4 w-4 rounded-full object-cover border border-white/[0.08]"
                                    />
                                ) : (
                                    <User className="w-3 h-3" />
                                )}
                                {shoot.photographerName}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </button>
    );
}

function formatDate(value: string) {
    return new Date(value).toLocaleDateString('tr-TR');
}
