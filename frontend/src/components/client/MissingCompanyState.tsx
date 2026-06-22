import { AlertTriangle } from 'lucide-react';

interface MissingCompanyStateProps {
    title?: string;
    description?: string;
}

export function MissingCompanyState({
    title = 'Müşteri şirketi bulunamadı',
    description = 'Bu ekran şirket bilgisi olan bir müşteri hesabıyla açılmalıdır.',
}: MissingCompanyStateProps) {
    return (
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
            <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-400" />
                <div>
                    <h1 className="text-sm font-semibold text-amber-200">{title}</h1>
                    <p className="mt-1 text-xs text-zinc-500">{description}</p>
                </div>
            </div>
        </div>
    );
}
