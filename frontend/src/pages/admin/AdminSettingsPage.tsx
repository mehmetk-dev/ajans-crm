import { type FormEvent, useEffect, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { AlertCircle, CheckCircle2, Mail, Save, Send, Server } from 'lucide-react';
import { adminApi, type MailTestResponse, type UpdateMailSettingsInput } from '../../api/admin';
import SettingsPage from '../../components/SettingsPage';

const defaultMailForm: UpdateMailSettingsInput = {
    enabled: false,
    host: 'smtp.gmail.com',
    port: 587,
    username: '',
    password: '',
    fromAddress: 'noreply@fogistanbul.com',
    smtpAuth: true,
    startTls: true,
    clearPassword: false,
};

export default function AdminSettingsPage() {
    const [form, setForm] = useState<UpdateMailSettingsInput>(defaultMailForm);
    const [saved, setSaved] = useState(false);
    const [testResult, setTestResult] = useState<MailTestResponse | null>(null);

    const mailSettings = useQuery({
        queryKey: ['admin-mail-settings'],
        queryFn: adminApi.getMailSettings,
    });

    useEffect(() => {
        if (mailSettings.data) {
            setForm({
                enabled: mailSettings.data.enabled,
                host: mailSettings.data.host,
                port: mailSettings.data.port,
                username: mailSettings.data.username ?? '',
                password: '',
                fromAddress: mailSettings.data.fromAddress,
                smtpAuth: mailSettings.data.smtpAuth,
                startTls: mailSettings.data.startTls,
                clearPassword: false,
            });
        }
    }, [mailSettings.data]);

    const updateMailSettings = useMutation({
        mutationFn: adminApi.updateMailSettings,
        onSuccess: (data) => {
            setSaved(true);
            setForm(current => ({
                ...current,
                enabled: data.enabled,
                host: data.host,
                port: data.port,
                username: data.username ?? '',
                password: '',
                fromAddress: data.fromAddress,
                smtpAuth: data.smtpAuth,
                startTls: data.startTls,
                clearPassword: false,
            }));
            setTimeout(() => setSaved(false), 3000);
        },
    });

    const testMailSettings = useMutation({
        mutationFn: async () => {
            await adminApi.updateMailSettings(buildMailPayload());
            return adminApi.testMailSettings();
        },
        onSuccess: async (result) => {
            setTestResult(result);
            await mailSettings.refetch();
        },
        onError: () => {
            setTestResult({
                success: false,
                to: 'mehmetkerem2109@gmail.com',
                message: 'Test isteği gönderilemedi',
            });
        },
    });

    const updateField = <K extends keyof UpdateMailSettingsInput>(
        field: K,
        value: UpdateMailSettingsInput[K],
    ) => {
        setForm(current => ({ ...current, [field]: value }));
    };

    const buildMailPayload = (): UpdateMailSettingsInput => ({
        ...form,
        host: form.host.trim(),
        username: form.username?.trim() || null,
        fromAddress: form.fromAddress.trim(),
    });

    const submitMailSettings = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        updateMailSettings.mutate(buildMailPayload());
    };

    return (
        <div className="space-y-6">
            <SettingsPage accentColor="orange" />

            <form onSubmit={submitMailSettings} className="bg-[#0C0C0E] border border-white/[0.06] rounded-2xl p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-5">
                    <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-orange-400" />
                        <div>
                            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">SMTP Ayarları</h3>
                            <p className="text-xs text-zinc-600 mt-1">Sistem maillerinin gönderileceği hesabı buradan yönet.</p>
                        </div>
                    </div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-zinc-300">
                        <input
                            type="checkbox"
                            checked={form.enabled}
                            onChange={event => updateField('enabled', event.target.checked)}
                            className="h-4 w-4 rounded border-white/10 bg-[#18181b] focus:border-orange-500/30"
                        />
                        Mail aktif
                    </label>
                </div>

                {mailSettings.isLoading ? (
                    <div className="text-sm text-zinc-500">SMTP ayarları yükleniyor...</div>
                ) : mailSettings.isError ? (
                    <div className="flex items-center gap-2 text-sm text-red-400">
                        <AlertCircle className="w-4 h-4" />
                        SMTP ayarları alınamadı
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <label className="mb-1 block text-xs text-zinc-500" htmlFor="smtp-host">SMTP Sunucu</label>
                                <div className="relative">
                                    <Server className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" />
                                    <input
                                        id="smtp-host"
                                        value={form.host}
                                        onChange={event => updateField('host', event.target.value)}
                                        className="w-full rounded-lg border border-white/[0.06] bg-[#18181b]/60 py-2 pl-10 pr-3 text-sm text-white outline-none focus:border-orange-500/30"
                                        placeholder="smtp.gmail.com"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="mb-1 block text-xs text-zinc-500" htmlFor="smtp-port">Port</label>
                                <input
                                    id="smtp-port"
                                    type="number"
                                    min={1}
                                    max={65535}
                                    value={form.port}
                                    onChange={event => updateField('port', Number(event.target.value))}
                                    className="w-full rounded-lg border border-white/[0.06] bg-[#18181b]/60 px-3 py-2 text-sm text-white outline-none focus:border-orange-500/30"
                                    required
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-xs text-zinc-500" htmlFor="smtp-username">Kullanıcı Adı</label>
                                <input
                                    id="smtp-username"
                                    value={form.username ?? ''}
                                    onChange={event => updateField('username', event.target.value)}
                                    className="w-full rounded-lg border border-white/[0.06] bg-[#18181b]/60 px-3 py-2 text-sm text-white outline-none focus:border-orange-500/30"
                                    placeholder="mail@domain.com"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-xs text-zinc-500" htmlFor="smtp-password">Şifre</label>
                                <input
                                    id="smtp-password"
                                    type="password"
                                    value={form.password ?? ''}
                                    onChange={event => updateField('password', event.target.value)}
                                    className="w-full rounded-lg border border-white/[0.06] bg-[#18181b]/60 px-3 py-2 text-sm text-white outline-none focus:border-orange-500/30"
                                    placeholder={mailSettings.data?.passwordConfigured ? 'Mevcut şifre korunur' : 'SMTP şifresi'}
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="mb-1 block text-xs text-zinc-500" htmlFor="smtp-from">Gönderici Email</label>
                                <input
                                    id="smtp-from"
                                    type="email"
                                    value={form.fromAddress}
                                    onChange={event => updateField('fromAddress', event.target.value)}
                                    className="w-full rounded-lg border border-white/[0.06] bg-[#18181b]/60 px-3 py-2 text-sm text-white outline-none focus:border-orange-500/30"
                                    placeholder="noreply@fogistanbul.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex flex-wrap gap-5">
                                <label className="flex items-center gap-2 text-xs font-medium text-zinc-400">
                                    <input
                                        type="checkbox"
                                        checked={form.smtpAuth}
                                        onChange={event => updateField('smtpAuth', event.target.checked)}
                                        className="h-4 w-4 rounded border-white/10 bg-[#18181b] focus:border-orange-500/30"
                                    />
                                    SMTP Auth
                                </label>
                                <label className="flex items-center gap-2 text-xs font-medium text-zinc-400">
                                    <input
                                        type="checkbox"
                                        checked={form.startTls}
                                        onChange={event => updateField('startTls', event.target.checked)}
                                        className="h-4 w-4 rounded border-white/10 bg-[#18181b] focus:border-orange-500/30"
                                    />
                                    STARTTLS
                                </label>
                                {mailSettings.data?.passwordConfigured && (
                                    <label className="flex items-center gap-2 text-xs font-medium text-zinc-400">
                                        <input
                                            type="checkbox"
                                            checked={Boolean(form.clearPassword)}
                                            onChange={event => updateField('clearPassword', event.target.checked)}
                                            className="h-4 w-4 rounded border-white/10 bg-[#18181b] focus:border-orange-500/30"
                                        />
                                        Kayıtlı şifreyi sil
                                    </label>
                                )}
                            </div>

                            <div className="flex items-center justify-end gap-3">
                                {saved && (
                                    <span className="flex items-center gap-1 text-xs text-orange-400">
                                        <CheckCircle2 className="w-3 h-3" />
                                        SMTP ayarları kaydedildi
                                    </span>
                                )}
                                {updateMailSettings.isError && (
                                    <span className="flex items-center gap-1 text-xs text-red-400">
                                        <AlertCircle className="w-3 h-3" />
                                        Kaydedilemedi
                                    </span>
                                )}
                                <button
                                    type="submit"
                                    disabled={updateMailSettings.isPending || testMailSettings.isPending}
                                    className="flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-orange-600 disabled:opacity-50"
                                >
                                    <Save className="w-4 h-4" />
                                    {updateMailSettings.isPending ? 'Kaydediliyor...' : 'Kaydet'}
                                </button>
                                <button
                                    type="button"
                                    disabled={updateMailSettings.isPending || testMailSettings.isPending}
                                    onClick={() => testMailSettings.mutate()}
                                    className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-[#18181b] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#222226] disabled:opacity-50"
                                >
                                    <Send className="w-4 h-4" />
                                    {testMailSettings.isPending ? 'Test ediliyor...' : 'Test et'}
                                </button>
                            </div>
                        </div>

                        {testResult && (
                            <div className={`mt-4 flex items-start gap-2 rounded-lg border px-3 py-2 text-sm ${
                                testResult.success
                                    ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300'
                                    : 'border-red-500/20 bg-red-500/10 text-red-300'
                            }`}>
                                {testResult.success ? (
                                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                                ) : (
                                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                                )}
                                <span>{testResult.message} ({testResult.to})</span>
                            </div>
                        )}
                    </>
                )}
            </form>
        </div>
    );
}
