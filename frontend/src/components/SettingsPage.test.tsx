import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
    updateUser: vi.fn(),
    uploadAvatar: vi.fn(),
    updateProfile: vi.fn(),
    changePassword: vi.fn(),
    updateMailEmail: vi.fn(),
    playNotificationSound: vi.fn(),
}));

vi.mock('../store/AuthContext', () => ({
    useAuth: () => ({
        user: {
            id: 'user-1',
            email: 'user@test.com',
            mailEmail: 'notify@test.com',
            fullName: 'Test User',
            globalRole: 'AGENCY_STAFF',
            membershipRole: null,
            avatarUrl: null,
            companyId: null,
        },
        isLoading: false,
        login: vi.fn(),
        logout: vi.fn(),
        updateUser: mocks.updateUser,
    }),
}));

vi.mock('../api/settings', () => ({
    settingsApi: {
        updateProfile: mocks.updateProfile,
        changePassword: mocks.changePassword,
        updateMailEmail: mocks.updateMailEmail,
        uploadAvatar: mocks.uploadAvatar,
    },
}));

vi.mock('../lib/browserNotifications', async (importOriginal) => ({
    ...await importOriginal<typeof import('../lib/browserNotifications')>(),
    playNotificationSound: mocks.playNotificationSound,
}));

import SettingsPage from './SettingsPage';

function installStorageMock() {
    const store = new Map<string, string>();
    const storage = {
        getItem: vi.fn((key: string) => store.get(key) ?? null),
        setItem: vi.fn((key: string, value: string) => store.set(key, value)),
        removeItem: vi.fn((key: string) => store.delete(key)),
        clear: vi.fn(() => store.clear()),
        key: vi.fn((index: number) => Array.from(store.keys())[index] ?? null),
        get length() {
            return store.size;
        },
    } as unknown as Storage;

    Object.defineProperty(window, 'localStorage', {
        value: storage,
        configurable: true,
    });
    Object.defineProperty(globalThis, 'localStorage', {
        value: storage,
        configurable: true,
    });
}

function renderSettingsPage() {
    const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });

    return render(
        <QueryClientProvider client={queryClient}>
            <SettingsPage accentColor="pink" />
        </QueryClientProvider>
    );
}

describe('SettingsPage', () => {
    beforeEach(() => {
        installStorageMock();
        vi.clearAllMocks();
        localStorage.clear();
        mocks.updateProfile.mockResolvedValue({ fullName: 'Test User' });
        mocks.changePassword.mockResolvedValue({ message: 'ok' });
        mocks.updateMailEmail.mockResolvedValue({ mailEmail: 'new-notify@test.com' });
        mocks.uploadAvatar.mockResolvedValue({ avatarUrl: '/api/settings/avatar/user-1/avatar.png' });
        mocks.playNotificationSound.mockResolvedValue(true);
    });

    it('lets the current user upload a profile photo from settings', async () => {
        renderSettingsPage();

        const file = new File(['avatar'], 'avatar.png', { type: 'image/png' });
        const input = screen.getByLabelText('Profil fotoğrafı yükle');

        fireEvent.change(input, { target: { files: [file] } });

        await waitFor(() => {
            expect(mocks.uploadAvatar).toHaveBeenCalledWith(file);
        });
        await waitFor(() => {
            expect(mocks.updateUser).toHaveBeenCalledWith({ avatarUrl: '/api/settings/avatar/user-1/avatar.png' });
        });
        expect(screen.getByText('Profil fotoğrafı güncellendi!')).toBeInTheDocument();
    });

    it('does not expose per-user notification preferences', async () => {
        renderSettingsPage();

        expect(screen.queryByText('Bildirim Tercihleri')).not.toBeInTheDocument();
        expect(screen.queryByLabelText('Görev atandı email')).not.toBeInTheDocument();
    });

    it('does not expose login email change controls', () => {
        renderSettingsPage();

        expect(screen.getByLabelText('Giriş E-postası')).toHaveValue('user@test.com');
        expect(screen.queryByText('E-posta Değiştir')).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /E-postayı Değiştir/i })).not.toBeInTheDocument();
        expect(screen.queryByPlaceholderText('yeni@email.com')).not.toBeInTheDocument();
    });

    it('updates the mail email without changing the login email', async () => {
        renderSettingsPage();
        const emailSection = screen.getByRole('heading', { name: 'Mail E-postası' }).parentElement!.parentElement!;
        const withinSection = within(emailSection);

        fireEvent.change(withinSection.getByLabelText('Mail E-postası'), { target: { value: 'new-notify@test.com' } });
        fireEvent.click(withinSection.getByRole('button', { name: /Mail E-postasını Kaydet/i }));

        await waitFor(() => {
            expect(mocks.updateMailEmail).toHaveBeenCalledWith({ mailEmail: 'new-notify@test.com' });
        });
        await waitFor(() => {
            expect(mocks.updateUser).toHaveBeenCalledWith({ mailEmail: 'new-notify@test.com' });
        });
        expect(screen.getByText('Mail e-postası güncellendi!')).toBeInTheDocument();
    });

    it('lets the user enable notification sound on this device and test it', () => {
        renderSettingsPage();

        const notificationsSection = screen.getByRole('heading', { name: 'Bildirimler' }).parentElement!.parentElement!;
        const withinSection = within(notificationsSection);

        fireEvent.click(withinSection.getByRole('switch', { name: 'Sesli bildirim' }));
        expect(localStorage.getItem('crm.notificationSoundEnabled')).toBe('true');
        expect(mocks.playNotificationSound).toHaveBeenCalledTimes(1);

        mocks.playNotificationSound.mockClear();
        fireEvent.click(withinSection.getByRole('button', { name: /Sesi test et/i }));
        expect(mocks.playNotificationSound).toHaveBeenCalledTimes(1);
    });
});
