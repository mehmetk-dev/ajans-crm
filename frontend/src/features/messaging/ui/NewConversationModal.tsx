import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, X } from 'lucide-react';
import type { ContactResponse } from '../api/messaging.types';
import { getRoleLabel } from '../model/messaging.utils';
import { UserAvatar } from '../../../components/UserAvatar';

interface Props {
    open: boolean;
    contacts: ContactResponse[];
    loading?: boolean;
    onClose: () => void;
    onSelect: (userId: string) => void;
}

export function NewConversationModal({ open, contacts, loading = false, onClose, onSelect }: Props) {
    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.95 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0.95 }}
                        className="bg-[#0C0C0E] border border-white/[0.08] rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between p-6 border-b border-white/[0.06]">
                            <h3 className="text-lg font-bold text-white">Yeni Sohbet Başlat</h3>
                            <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-2 flex-1 overflow-y-auto">
                            {loading ? (
                                <div className="flex items-center justify-center gap-3 p-8 text-sm text-zinc-500">
                                    <Loader2 className="h-4 w-4 animate-spin text-[#C8697A]" />
                                    Kişiler yükleniyor...
                                </div>
                            ) : contacts.length === 0 ? (
                                <div className="p-8 text-center text-zinc-500 text-sm">
                                    Rehberde kişi bulunamadı.
                                </div>
                            ) : (
                                contacts.map(contact => (
                                    <button
                                        key={contact.id}
                                        onClick={() => onSelect(contact.id)}
                                        className="w-full flex items-center gap-3 p-3 hover:bg-white/[0.03] transition-colors rounded-xl text-left"
                                    >
                                        <UserAvatar name={contact.fullName} avatarUrl={contact.avatarUrl} className="h-10 w-10 rounded-full text-xs" />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-white">{contact.fullName}</p>
                                            <p className="text-xs text-zinc-500">
                                                {getRoleLabel(contact.globalRole, contact.membershipRole, contact.companyName) || contact.email}
                                            </p>
                                            {contact.positionTitle && (
                                                <p className="text-[11px] text-zinc-600">{contact.positionTitle}</p>
                                            )}
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
