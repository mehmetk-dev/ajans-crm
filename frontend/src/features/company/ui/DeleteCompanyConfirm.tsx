import { Trash2 } from 'lucide-react';

interface DeleteCompanyConfirmProps {
    companyName: string;
    onCancel: () => void;
    onConfirm: () => void;
}

export function DeleteCompanyConfirm({ companyName, onCancel, onConfirm }: DeleteCompanyConfirmProps) {
    return (
        <>
            <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                    <Trash2 className="w-5 h-5 text-red-400" />
                </div>
                <div>
                    <h3 className="text-white font-bold text-sm">Şirketi Sil</h3>
                    <p className="text-zinc-500 text-xs">Bu işlem geri alınamaz</p>
                </div>
            </div>
            <p className="text-zinc-400 text-sm mb-6">
                <span className="text-white font-medium">{companyName}</span> şirketini silmek istediğinize emin misiniz?
                Şirkete ait tüm görevler ve üyelikler de silinecektir.
            </p>
            <div className="flex gap-3">
                <button onClick={onCancel}
                    className="flex-1 py-2.5 rounded-xl border border-white/[0.06] text-zinc-400 hover:text-white text-sm font-medium transition-colors">
                    İptal
                </button>
                <button onClick={onConfirm}
                    className="flex-1 py-2.5 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 text-sm font-medium transition-colors">
                    Sil
                </button>
            </div>
        </>
    );
}
