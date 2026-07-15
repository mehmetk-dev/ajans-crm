import { Check, Loader2, RefreshCw } from 'lucide-react';
import type { GoogleAdsAccountOption } from '../googleAds.types';

interface GoogleAdsAccountPickerProps {
    accounts: GoogleAdsAccountOption[];
    selectedKey: string;
    isLoading: boolean;
    isSaving: boolean;
    warnings: string[];
    onSelect: (key: string) => void;
    onSubmit: () => void;
    onRetry: () => void;
}

export default function GoogleAdsAccountPicker({
    accounts,
    selectedKey,
    isLoading,
    isSaving,
    warnings,
    onSelect,
    onSubmit,
    onRetry,
}: GoogleAdsAccountPickerProps) {
    if (isLoading) {
        return (
            <div className="flex items-center gap-2 py-4 text-xs text-zinc-400">
                <Loader2 className="h-4 w-4 animate-spin" />
                Erişebildiğiniz Google Ads hesapları alınıyor…
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {warnings.map(warning => (
                <p key={warning} className="text-xs text-amber-300">{warning}</p>
            ))}
            {accounts.length === 0 ? (
                <div className="flex items-center justify-between gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
                    <p className="text-xs text-amber-200">
                        Bu Google kullanıcısının erişebildiği etkin reklamveren hesabı bulunamadı.
                    </p>
                    <button type="button" onClick={onRetry}
                        className="flex shrink-0 items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs text-zinc-300">
                        <RefreshCw className="h-3.5 w-3.5" /> Tekrar dene
                    </button>
                </div>
            ) : (
                <div className="grid gap-2 md:grid-cols-2">
                    {accounts.map(account => {
                        const key = `${account.customerId}:${account.loginCustomerId}`;
                        const selected = selectedKey === key;
                        return (
                            <button key={key} type="button" onClick={() => onSelect(key)}
                                aria-pressed={selected}
                                className={`flex items-start justify-between rounded-xl border p-4 text-left transition-colors ${
                                    selected
                                        ? 'border-blue-500/50 bg-blue-500/10'
                                        : 'border-white/[0.08] bg-white/[0.02] hover:border-white/20'
                                }`}>
                                <span>
                                    <span className="block text-sm font-semibold text-white">
                                        {account.descriptiveName}
                                    </span>
                                    <span className="mt-1 block text-xs text-zinc-500">
                                        {account.customerId}
                                    </span>
                                    <span className="mt-2 block text-[11px] text-zinc-400">
                                        {account.accessType === 'DIRECT'
                                            ? 'Doğrudan erişim'
                                            : `${account.managerName ?? account.loginCustomerId} üzerinden`}
                                    </span>
                                </span>
                                {selected && <Check className="h-4 w-4 text-blue-400" />}
                            </button>
                        );
                    })}
                </div>
            )}
            {accounts.length > 0 && (
                <button type="button" onClick={onSubmit}
                    disabled={!selectedKey || isSaving}
                    className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-40">
                    {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                    Bu hesabı kullan
                </button>
            )}
        </div>
    );
}
