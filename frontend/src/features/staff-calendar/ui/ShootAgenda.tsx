import type { ShootResponse } from '../../shoots';
import { Camera, Clock, MapPin } from 'lucide-react';

interface ShootAgendaProps {
    shoots: ShootResponse[];
    onSelect: (shoot: ShootResponse) => void;
}

export function ShootAgenda({ shoots, onSelect }: ShootAgendaProps) {
    if (shoots.length === 0) return null;
    return (
        <section>
            <h4 className="text-xs font-bold text-violet-400 uppercase tracking-widest mb-2">
                Çekimler ({shoots.length})
            </h4>
            <div className="space-y-2">
                {shoots.map(shoot => (
                    <button key={shoot.id} onClick={() => onSelect(shoot)}
                        className="w-full p-3 rounded-xl bg-violet-500/[0.04] border border-violet-500/10 text-left">
                        <p className="text-sm font-medium text-white">{shoot.title}</p>
                        <div className="flex flex-wrap gap-3 mt-1 text-[10px] text-zinc-500">
                            <span className="flex items-center gap-1"><Camera className="w-3 h-3" />{shoot.companyName}</span>
                            {shoot.shootTime && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{shoot.shootTime.slice(0, 5)}</span>}
                            {shoot.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{shoot.location}</span>}
                        </div>
                    </button>
                ))}
            </div>
        </section>
    );
}