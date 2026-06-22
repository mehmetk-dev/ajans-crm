import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
    updateUser: vi.fn(),
    uploadAvatar: vi.fn(),
    updateProfile: vi.fn(),
    changePassword: vi.fn(),
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
});
