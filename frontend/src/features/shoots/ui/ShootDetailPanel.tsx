import { AnimatePresence, motion } from 'framer-motion';
import type { ReactElement } from 'react';
import {
    Calendar, Camera, CheckCircle2, Clock, FileText, MapPin, Package,
    Trash2, User, Users, Wrench, X, XCircle,
} from 'lucide-react';
import type { ShootResponse, ShootScope, ShootStatus } from '../api/shoot.types';
import { useLinkedShootContent } from '../hooks/useShoots';
import { shootStatusMeta } from '../model/shoot.constants';
import { getShootDisplayStatus } from '../model/shoot.utils';

interface ShootDetailPanelProps {
    shoot: ShootResponse | null;
    scope: ShootScope;
    canManage?: boolean;
    canDelete?: boolean;
    onClose: () => void;
    onStatusChange?: (status: ShootStatus) => void;
    onDelete?: () => void;
}

export function ShootDetailPanel({
    shoot,
    scope,
    canManage = false,
    canDelete = false,
    onClose,
    onStatusChange,
    onDelete,
}: ShootDetailPanelProps) {
    const { data: linkedContent = [] } = useLinkedShootContent(scope, shoot?.id);
    const status = shoot ? shootStatusMeta[getShootDisplayStatus(shoot)] : null;
    return (
        <AnimatePresence>
            {shoot && status && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-end" onClick={onClose}>
                    <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                        className="w-full max-w-xl bg-[#0c0c0e] border-l border-white/[0.06] h-full overflow-y-auto"
                        onClick={event => event.stopPropagation()}>
                        <div className="sticky top-0 bg-[#0c0c0e]/95 border-b border-white/[0.06] p-5 z-10 flex justify-between">
                            <div>
                                <h2 className="text-lg font-bold text-white">{shoot.title}</h2>
                                <span className={`text-[10px] font-bold ${status.className}`}>{status.label}</span>
                            </div>
                            <div className="flex gap-2">
                                {canDelete && onDelete && (
                                    <button onClick={onDelete} className="text-zinc-600 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                                )}
                                <button onClick={onClose} className="text-zinc-500 hover:text-white"><X className="w-5 h-5" /></button>
                            </div>
                        </div>
                        <div className="p-5 space-y-5">
                            <div className="grid grid-cols-2 gap-3">
                                <Info icon={<User />} label="Şirket" value={shoot.companyName} />
                                {shoot.photographerName && <Info icon={<Camera />} label="Çekimci" value={shoot.photographerName} />}
                                {shoot.shootDate && <Info icon={<Calendar />} label="Tarih" value={new Date(shoot.shootDate).toLocaleDateString('tr-TR')} />}
                                {shoot.shootTime && <Info icon={<Clock />} label="Saat" value={shoot.shootTime.slice(0, 5)} />}
                                {shoot.location && <Info icon={<MapPin />} label="Konum" value={shoot.location} />}
                            </div>
                            {shoot.description && <TextBlock label="Açıklama" value={shoot.description} />}
                            {shoot.notes && <TextBlock label="Notlar" value={shoot.notes} />}
                            <ResourceList shoot={shoot} />
                            <div className="border-t border-white/[0.06] pt-4">
                                <h3 className="text-[10px] font-bold text-zinc-600 uppercase mb-3 flex items-center gap-1">
                                    <FileText className="w-3 h-3" /> Çekimdeki İçerikler ({linkedContent.length})
                                </h3>
                                {linkedContent.length === 0 ? (
                                    <p className="text-xs text-zinc-600">Bu çekime henüz içerik bağlanmamış.</p>
                                ) : linkedContent.map(content => (
                                    <div key={content.id} className="bg-white/[0.03] rounded-xl p-3 mb-2">
                                        <p className="text-sm text-white font-medium">{content.title}</p>
                                        <p className="text-[10px] text-zinc-500 mt-1">{content.platform} · {content.status}</p>
                                    </div>
                                ))}
                            </div>
                            {canManage && shoot.status === 'PLANNED' && onStatusChange && (
                                <div className="border-t border-white/[0.06] pt-4 flex gap-2">
                                    <button onClick={() => onStatusChange('COMPLETED')}
                                        className="flex items-center gap-1 px-4 py-2 bg-emerald-500/10 text-emerald-400 rounded-xl text-xs">
                                        <CheckCircle2 className="w-4 h-4" /> Tamamlandı
                                    </button>
                                    <button onClick={() => onStatusChange('CANCELLED')}
                                        className="flex items-center gap-1 px-4 py-2 bg-red-500/10 text-red-400 rounded-xl text-xs">
                                        <XCircle className="w-4 h-4" /> İptal Et
                                    </button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

function ResourceList({ shoot }: { shoot: ShootResponse }) {
    return (
        <>
            {shoot.equipment.length > 0 && (
                <div className="border-t border-white/[0.06] pt-4">
                    <h3 className="text-[10px] font-bold text-zinc-600 uppercase mb-3 flex items-center gap-1"><Package className="w-3 h-3" /> Ekipman</h3>
                    {shoot.equipment.map(item => (
                        <div key={item.id} className="flex justify-between bg-white/[0.03] rounded-xl p-3 mb-2">
                            <span className="text-sm text-zinc-300 flex items-center gap-2"><Wrench className="w-3 h-3" />{item.name}</span>
                            <span className="text-xs text-zinc-500">x{item.quantity}</span>
                        </div>
                    ))}
                </div>
            )}
            {shoot.participants.length > 0 && (
                <div className="border-t border-white/[0.06] pt-4">
                    <h3 className="text-[10px] font-bold text-zinc-600 uppercase mb-3 flex items-center gap-1"><Users className="w-3 h-3" /> Katılımcılar</h3>
                    <div className="flex flex-wrap gap-2">
                        {shoot.participants.map(person => (
                            <span key={person.userId} className="px-3 py-1.5 bg-white/[0.03] rounded-lg text-xs text-zinc-300">
                                {person.fullName}{person.roleInShoot ? ` · ${person.roleInShoot}` : ''}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </>
    );
}

function Info({ icon, label, value }: { icon: ReactElement; label: string; value: string }) {
    return (
        <div className="bg-white/[0.03] rounded-xl p-3">
            <p className="text-[10px] text-zinc-600 uppercase flex items-center gap-1">
                {icon && <span className="[&>svg]:w-3 [&>svg]:h-3">{icon}</span>}{label}
            </p>
            <p className="text-sm text-white mt-1">{value}</p>
        </div>
    );
}

function TextBlock({ label, value }: { label: string; value: string }) {
    return (
        <div className="bg-white/[0.03] rounded-xl p-3">
            <p className="text-[10px] text-zinc-600 uppercase mb-1">{label}</p>
            <p className="text-sm text-zinc-300 whitespace-pre-wrap">{value}</p>
        </div>
    );
}
