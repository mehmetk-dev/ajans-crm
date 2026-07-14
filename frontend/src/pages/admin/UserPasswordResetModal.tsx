import { useState } from 'react';
import type { FormEvent } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Eye, EyeOff, KeyRound, X } from 'lucide-react';
import { adminApi } from '../../api/admin';
import type { AllUserResponse } from '../../api/admin';
import { UserAvatar } from '../../components/UserAvatar';
import { getApiErrorMessage } from '../../lib/apiError';

interface UserPasswordResetModalProps {
    user: AllUserResponse;
    onClose: () => void;
    onSuccess: (message: string) => void;
}

interface PasswordFieldProps {
    id: string;
    label: string;
    value: string;
    visible: boolean;
    autoComplete: 'current-password' | 'new-password';
    onChange: (value: string) => void;
    onToggleVisibility: () => void;
}

function PasswordField({
    id,
    label,
    value,
    visible,
    autoComplete,
    onChange,
    onToggleVisibility,
}: PasswordFieldProps) {
    return (
        <div>
            <label htmlFor={id} className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1.5">
                {label}
            </label>
            <div className="relative">
                <input
                    id={id}
                    type={visible ? 'text' : 'password'}
                    value={value}
                    onChange={event => onChange(event.target.value)}
                    autoComplete={autoComplete}
                    maxLength={128}
                    className="w-full px-4 py-3 pr-11 glass-input rounded-xl text-sm text-white outline-none"
                />
                <button
                    type="button"
                    onClick={onToggleVisibility}
                    aria-label={`${label} ${visible ? 'gizle' : 'göster'}`}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                >
                    {visible
                        ? <EyeOff className="w-4 h-4" />
                        : <Eye className="w-4 h-4" />}
                </button>
            </div>
        </div>
    );
}

export default function UserPasswordResetModal({
    user,
    onClose,
    onSuccess,
}: UserPasswordResetModalProps) {
    const [newPassword, setNewPassword] = useState('');
    const [confirmation, setConfirmation] = useState('');
    const [adminPassword, setAdminPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [showAdminPassword, setShowAdminPassword] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const hasValidLength = newPassword.length >= 8 && newPassword.length <= 128;
    const passwordsMatch = newPassword === confirmation;
    const canSubmit = hasValidLength
        && newPassword.trim().length > 0
        && passwordsMatch
        && confirmation.length > 0
        && adminPassword.trim().length > 0
        && adminPassword.length <= 128
        && !saving;

    const clearPasswords = () => {
        setNewPassword('');
        setConfirmation('');
        setAdminPassword('');
        setShowNewPassword(false);
        setShowConfirmation(false);
        setShowAdminPassword(false);
        setError('');
    };

    const handleClose = () => {
        if (saving) return;
        clearPasswords();
        onClose();
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!canSubmit) return;

        setSaving(true);
        setError('');
        try {
            const result = await adminApi.resetUserPassword(user.id, {
                adminPassword,
                newPassword,
            });
            clearPasswords();
            onSuccess(result.message);
        } catch (failure: unknown) {
            setError(getApiErrorMessage(failure, 'Kullanıcı şifresi değiştirilemedi'));
        } finally {
            setSaving(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4"
            onClick={handleClose}
        >
            <motion.div
                role="dialog"
                aria-modal="true"
                aria-labelledby="password-reset-title"
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                className="glass-panel rounded-2xl w-full max-w-md max-h-[90vh] overflow-auto"
                onClick={event => event.stopPropagation()}
            >
                <div className="p-6 border-b border-white/[0.06] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                            <KeyRound className="w-5 h-5 text-orange-400" />
                        </div>
                        <div>
                            <h2 id="password-reset-title" className="text-lg font-bold text-white">
                                Kullanıcı Şifresini Değiştir
                            </h2>
                            <p className="text-[11px] text-zinc-500">Admin doğrulaması zorunludur</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={saving}
                        aria-label="Şifre değiştirme penceresini kapat"
                        className="text-zinc-500 hover:text-white transition-colors disabled:opacity-50"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-white/[0.02] rounded-xl border border-white/[0.04]">
                        <UserAvatar
                            name={user.fullName}
                            avatarUrl={user.avatarUrl}
                            className="h-10 w-10 rounded-xl text-xs"
                        />
                        <div className="min-w-0">
                            <p className="text-sm font-medium text-white truncate">{user.fullName}</p>
                            <p className="text-[11px] text-zinc-500 truncate">{user.email}</p>
                        </div>
                    </div>

                    {error && (
                        <div role="alert" className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs">
                            {error}
                        </div>
                    )}

                    <PasswordField
                        id="new-password"
                        label="Yeni şifre"
                        value={newPassword}
                        visible={showNewPassword}
                        autoComplete="new-password"
                        onChange={setNewPassword}
                        onToggleVisibility={() => setShowNewPassword(value => !value)}
                    />
                    {newPassword.length > 0 && !hasValidLength && (
                        <p className="text-[11px] text-amber-400">Yeni şifre 8 ile 128 karakter arasında olmalı</p>
                    )}

                    <PasswordField
                        id="new-password-confirmation"
                        label="Yeni şifre tekrarı"
                        value={confirmation}
                        visible={showConfirmation}
                        autoComplete="new-password"
                        onChange={setConfirmation}
                        onToggleVisibility={() => setShowConfirmation(value => !value)}
                    />
                    {confirmation.length > 0 && !passwordsMatch && (
                        <p className="text-[11px] text-red-400">Yeni şifreler eşleşmiyor</p>
                    )}

                    <div className="pt-1">
                        <PasswordField
                            id="admin-current-password"
                            label="Admin mevcut şifresi"
                            value={adminPassword}
                            visible={showAdminPassword}
                            autoComplete="current-password"
                            onChange={setAdminPassword}
                            onToggleVisibility={() => setShowAdminPassword(value => !value)}
                        />
                    </div>

                    <div className="flex items-start gap-2.5 p-3 bg-amber-500/[0.06] border border-amber-500/20 rounded-xl">
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <p className="text-[11px] leading-relaxed text-amber-200/70">
                            Kullanıcının yenileme oturumları kapatılır. Açık bir oturum,
                            mevcut erişim anahtarının süresi dolana kadar devam edebilir.
                        </p>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={saving}
                            className="flex-1 py-2.5 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-zinc-400 font-medium rounded-xl text-[13px] transition-all disabled:opacity-50"
                        >
                            İptal
                        </button>
                        <button
                            type="submit"
                            disabled={!canSubmit}
                            className="flex-1 py-2.5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2 text-[13px] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {saving
                                ? <div className="h-5 w-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                : 'Şifreyi Değiştir'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
}
