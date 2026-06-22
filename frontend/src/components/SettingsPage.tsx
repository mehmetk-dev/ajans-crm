import { useRef, useState, useId } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '../store/AuthContext';
import { settingsApi } from '../api/settings';
import { User, Lock, Save, CheckCircle2, AlertCircle, Camera } from 'lucide-react';

interface Props {
    accentColor?: string;
}

export default function SettingsPage({ accentColor = 'blue' }: Props) {
    const id = useId();
    const { user, updateUser } = useAuth();
    const avatarInputRef = useRef<HTMLInputElement>(null);
    const [fullName, setFullName] = useState(user?.fullName || '');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [profileMsg, setProfileMsg] = useState('');
    const [avatarMsg, setAvatarMsg] = useState('');
    const [avatarError, setAvatarError] = useState('');
    const [passwordMsg, setPasswordMsg] = useState('');
    const [passwordError, setPasswordError] = useState('');

    const accentClasses: Record<string, { btn: string; icon: string; focus: string }> = {
        blue: {
            btn: 'bg-blue-500 hover:bg-blue-600',
            icon: 'text-blue-400',
            focus: 'focus:border-blue-500/30',
        },
        orange: {
            btn: 'bg-orange-500 hover:bg-orange-600',
            icon: 'text-orange-400',
            focus: 'focus:border-orange-500/30',
        },
        pink: {
            btn: 'bg-pink-500 hover:bg-pink-600',
            icon: 'text-pink-400',
            focus: 'focus:border-pink-500/30',
        },
    };
    const accent = accentClasses[accentColor] || accentClasses.blue;

    const profileMutation = useMutation({
        mutationFn: () => settingsApi.updateProfile({ fullName }),
        onSuccess: (data) => {
            updateUser({ fullName: data.fullName });
            setProfileMsg('Profil güncellendi!');
            setTimeout(() => setProfileMsg(''), 3000);
        },
    });

    const avatarMutation = useMutation({
        mutationFn: (file: File) => settingsApi.uploadAvatar(file),
        onSuccess: (data) => {
            if (data.avatarUrl) {
                updateUser({ avatarUrl: data.avatarUrl });
            }
            setAvatarError('');
            setAvatarMsg('Profil fotoğrafı güncellendi!');
            setTimeout(() => setAvatarMsg(''), 3000);
        },
        onError: () => {
            setAvatarMsg('');
            setAvatarError('Profil fotoğrafı yüklenemedi');
            setTimeout(() => setAvatarError(''), 3000);
        },
    });

    const passwordMutation = useMutation({
        mutationFn: () => settingsApi.changePassword({ currentPassword, newPassword }),
        onSuccess: (data) => {
            if (data.error) {
                setPasswordError(data.error);
                setTimeout(() => setPasswordError(''), 3000);
            } else {
                setPasswordMsg('Şifre değiştirildi!');
                setCurrentPassword('');
                setNewPassword('');
                setTimeout(() => setPasswordMsg(''), 3000);
            }
        },
        onError: () => {
            setPasswordError('Şifre değiştirilemedi');
            setTimeout(() => setPasswordError(''), 3000);
        },
    });

    const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            avatarMutation.mutate(file);
        }
        event.target.value = '';
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white">Ayarlar</h1>
                <p className="text-sm text-zinc-500 mt-1">Profil ve hesap ayarlarınız</p>
            </div>

            {/* Profile */}
            <div className="bg-[#0C0C0E] border border-white/[0.06] rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                    <User className={`w-4 h-4 ${accent.icon}`} />
                    <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Profil Bilgileri</h3>
                </div>

                <div className="flex flex-col gap-5 md:flex-row md:items-start">
                    <div className="flex items-center gap-4 md:w-64">
                        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#18181b] flex items-center justify-center text-xl font-bold text-zinc-400">
                            {user?.avatarUrl ? (
                                <img src={user.avatarUrl} alt={user.fullName} className="h-full w-full object-cover" />
                            ) : (
                                user?.fullName?.charAt(0) || 'K'
                            )}
                        </div>
                        <div className="min-w-0">
                            <input
                                ref={avatarInputRef}
                                id={`${id}-avatar`}
                                type="file"
                                accept="image/jpeg,image/png,image/webp,image/gif"
                                className="sr-only"
                                aria-label="Profil fotoğrafı yükle"
                                onChange={handleAvatarChange}
                            />
                            <button
                                type="button"
                                onClick={() => avatarInputRef.current?.click()}
                                disabled={avatarMutation.isPending}
                                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-white text-sm font-semibold disabled:opacity-50 transition-colors ${accent.btn}`}
                            >
                                <Camera className="w-4 h-4" />
                                {avatarMutation.isPending ? 'Yükleniyor...' : 'Fotoğraf yükle'}
                            </button>
                            <p className="mt-2 text-xs text-zinc-500">JPG, PNG, WebP veya GIF. Maksimum 5MB.</p>
                            {avatarMsg && <p className="mt-2 flex items-center gap-1 text-pink-400 text-xs"><CheckCircle2 className="w-3 h-3" />{avatarMsg}</p>}
                            {avatarError && <p className="mt-2 flex items-center gap-1 text-red-400 text-xs"><AlertCircle className="w-3 h-3" />{avatarError}</p>}
                        </div>
                    </div>

                    <div className="grid flex-1 grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor={`${id}-fullname`} className="text-xs text-zinc-500 block mb-1">Ad Soyad</label>
                            <input id={`${id}-fullname`} value={fullName} onChange={e => setFullName(e.target.value)}
                                className={`w-full bg-[#18181b]/60 border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-white focus:outline-none ${accent.focus}`} />
                        </div>
                        <div>
                            <label htmlFor={`${id}-email`} className="text-xs text-zinc-500 block mb-1">Email</label>
                            <input id={`${id}-email`} defaultValue={user?.email || ''} disabled
                                className="w-full bg-[#18181b]/40 border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-zinc-500 cursor-not-allowed" />
                        </div>
                    </div>
                </div>
                <div className="flex items-center justify-end gap-3 mt-4">
                    {profileMsg && <span className="flex items-center gap-1 text-pink-400 text-xs"><CheckCircle2 className="w-3 h-3" />{profileMsg}</span>}
                    <button onClick={() => profileMutation.mutate()} disabled={profileMutation.isPending || !fullName.trim()}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold disabled:opacity-50 transition-colors ${accent.btn}`}>
                        <Save className="w-4 h-4" />
                        {profileMutation.isPending ? 'Kaydediliyor...' : 'Kaydet'}
                    </button>
                </div>
            </div>

            {/* Password */}
            <div className="bg-[#0C0C0E] border border-white/[0.06] rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                    <Lock className={`w-4 h-4 ${accent.icon}`} />
                    <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Şifre Değiştir</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor={`${id}-currentpwd`} className="text-xs text-zinc-500 block mb-1">Mevcut Şifre</label>
                        <input id={`${id}-currentpwd`} type="password" placeholder="••••••••" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)}
                            className={`w-full bg-[#18181b]/60 border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-white focus:outline-none ${accent.focus}`} />
                    </div>
                    <div>
                        <label htmlFor={`${id}-newpwd`} className="text-xs text-zinc-500 block mb-1">Yeni Şifre</label>
                        <input id={`${id}-newpwd`} type="password" placeholder="••••••••" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                            className={`w-full bg-[#18181b]/60 border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-white focus:outline-none ${accent.focus}`} />
                    </div>
                </div>
                <div className="flex items-center justify-end gap-3 mt-4">
                    {passwordMsg && <span className="flex items-center gap-1 text-pink-400 text-xs"><CheckCircle2 className="w-3 h-3" />{passwordMsg}</span>}
                    {passwordError && <span className="flex items-center gap-1 text-red-400 text-xs"><AlertCircle className="w-3 h-3" />{passwordError}</span>}
                    <button onClick={() => passwordMutation.mutate()} disabled={passwordMutation.isPending || !currentPassword || !newPassword || newPassword.length < 6}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold disabled:opacity-50 transition-colors ${accent.btn}`}>
                        <Lock className="w-4 h-4" />
                        {passwordMutation.isPending ? 'Değiştiriliyor...' : 'Şifreyi Değiştir'}
                    </button>
                </div>
            </div>
        </div>
    );
}
