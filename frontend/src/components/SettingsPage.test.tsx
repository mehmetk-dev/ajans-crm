import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
    updateUser: vi.fn(),
    uploadAvatar: vi.fn(),
    updateProfile: vi.fn(),
    changePassword: vi.fn(),
    changeEmail: vi.fn(),
}));

vi.mock('../store/AuthContext', () => ({
    useAuth: () => ({
        user: {
            id: 'user-1',
            email: 'user@test.com',
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
        changeEmail: mocks.changeEmail,
        uploadAvatar: mocks.uploadAvatar,
    },
}));

import SettingsPage from './SettingsPage';

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
        vi.clearAllMocks();
        mocks.updateProfile.mockResolvedValue({ fullName: 'Test User' });
        mocks.changePassword.mockResolvedValue({ message: 'ok' });
        mocks.changeEmail.mockResolvedValue({ email: 'new@test.com' });
        mocks.uploadAvatar.mockResolvedValue({ avatarUrl: '/api/settings/avatar/user-1/avatar.png' });
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

    it('disables the email change button until a different email and password are entered', () => {
        renderSettingsPage();
        const emailSection = screen.getByText('E-posta Değiştir').parentElement!.parentElement!;
        const withinSection = within(emailSection);

        const button = withinSection.getByRole('button', { name: /E-postayı Değiştir/i });
        expect(button).toBeDisabled();

        fireEvent.change(withinSection.getByPlaceholderText('yeni@email.com'), { target: { value: 'user@test.com' } });
        expect(button).toBeDisabled();

        fireEvent.change(withinSection.getByPlaceholderText('yeni@email.com'), { target: { value: 'new@test.com' } });
        expect(button).toBeDisabled();

        fireEvent.change(withinSection.getByPlaceholderText('••••••••'), { target: { value: 'secret' } });
        expect(button).toBeEnabled();
    });

    it('changes the email after submitting a valid new email and password', async () => {
        renderSettingsPage();
        const emailSection = screen.getByText('E-posta Değiştir').parentElement!.parentElement!;
        const withinSection = within(emailSection);

        fireEvent.change(withinSection.getByPlaceholderText('yeni@email.com'), { target: { value: 'new@test.com' } });
        fireEvent.change(withinSection.getByPlaceholderText('••••••••'), { target: { value: 'secret' } });
        fireEvent.click(withinSection.getByRole('button', { name: /E-postayı Değiştir/i }));

        await waitFor(() => {
            expect(mocks.changeEmail).toHaveBeenCalledWith({ currentPassword: 'secret', newEmail: 'new@test.com' });
        });
        await waitFor(() => {
            expect(mocks.updateUser).toHaveBeenCalledWith({ email: 'new@test.com' });
        });
        expect(screen.getByText('E-posta adresiniz güncellendi!')).toBeInTheDocument();
    });
});
