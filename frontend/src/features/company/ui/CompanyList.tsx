import { motion } from 'framer-motion';
import { Building2, ListTodo, Pencil, Shield, Trash2, Users } from 'lucide-react';
import type { CompanyResponse } from '../../company';

interface CompanyListProps {
    companies: CompanyResponse[];
    onEdit: (e: React.MouseEvent, company: CompanyResponse) => void;
    onDelete: (e: React.MouseEvent, company: CompanyResponse) => void;
}

export function CompanyList({ companies, onEdit, onDelete }: CompanyListProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {companies.map((company, i) => (
                <motion.a
                    key={company.id}
                    href={`/admin/companies/${company.id}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-[#0C0C0E] border border-white/[0.06] p-5 rounded-2xl hover:border-white/[0.08] transition-all group cursor-pointer"
                >
                    <div className="flex items-start justify-between mb-4">
                        <div className="h-12 w-12 rounded-xl bg-[#18181b] flex items-center justify-center border border-white/[0.06]">
                            {company.logoUrl ? (
                                <img src={company.logoUrl} alt={company.name} className="w-8 h-8 rounded-lg object-cover" />
                            ) : (
                                <Building2 className="w-6 h-6 text-zinc-500" />
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={e => onEdit(e, company)}
                                className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-white/10 text-zinc-500 hover:text-white transition-all"
                            >
                                <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                                onClick={e => onDelete(e, company)}
                                className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500/10 text-zinc-500 hover:text-red-400 transition-all"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg ${company.contractStatus === 'ACTIVE'
                                ? 'bg-pink-500/10 text-pink-400'
                                : 'bg-[#18181b] text-zinc-500'
                                }`}>
                                {company.contractStatus === 'ACTIVE' ? 'Aktif' : company.contractStatus}
                            </span>
                        </div>
                    </div>

                    <h3 className="text-sm font-semibold text-white group-hover:text-orange-400 transition-colors">{company.name}</h3>
                    <p className="text-zinc-600 text-xs mt-0.5">{company.industry || 'Sektör belirtilmemiş'}</p>

                    <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/[0.06]">
                        <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                            <Users className="w-3.5 h-3.5" /> {company.employeeCount} Çalışan
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                            <Shield className="w-3.5 h-3.5" /> {company.staffCount} Yetkili
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                            <ListTodo className="w-3.5 h-3.5" /> {company.taskCount} Görev
                        </div>
                    </div>
                </motion.a>
            ))}
        </div>
    );
}

export function CompanyListEmptyState() {
    return (
        <div className="glass-panel p-16 rounded-2xl text-center">
            <Building2 className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-zinc-400">Henüz şirket yok</h3>
            <p className="text-zinc-600 text-sm mt-1">İlk müşterinizi ekleyerek başlayın.</p>
        </div>
    );
}
