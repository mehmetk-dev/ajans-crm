import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AllUserResponse } from '../../api/admin';
import UserPasswordResetModal from './UserPasswordResetModal';

const mocks = vi.hoisted(() => ({
    resetUserPassword: vi.fn(),
}));

vi.mock('../../api/admin', () => ({
    adminApi: {
        resetUserPassword: mocks.resetUserPassword,
    },
}));

const user: AllUserResponse = {
    id: 'user-1',
    fullName: 'Şirket Kullanıcısı',
    email: 'sirket@example.com',
    globalRole: 'COMPANY_USER',
    membershipRole: 'OWNER',
    avatarUrl: null,
    phone: null,
    position: null,
    department: null,
    companies: [],
    createdAt: '2026-07-14T12:00:00Z',
};

function fillValidForm(adminPassword = 'admin-current') {
    fireEvent.change(screen.getByLabelText('Yeni şifre'), {
        target: { value: 'new-pass-1' },
    });
    fireEvent.change(screen.getByLabelText('Yeni şifre tekrarı'), {
        target: { value: 'new-pass-1' },
    });
    fireEvent.change(screen.getByLabelText('Admin mevcut şifresi'), {
        target: { value: adminPassword },
    });
}

describe('UserPasswordResetModal', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('blocks mismatched passwords without calling the API', () => {
        render(
            <UserPasswordResetModal
                user={user}
                onClose={vi.fn()}
                onSuccess={vi.fn()}
            />,
        );

        fireEvent.change(screen.getByLabelText('Yeni şifre'), {
            target: { value: 'new-pass-1' },
        });
        fireEvent.change(screen.getByLabelText('Yeni şifre tekrarı'), {
            target: { value: 'new-pass-2' },
        });
        fireEvent.change(screen.getByLabelText('Admin mevcut şifresi'), {
            target: { value: 'admin-current' },
        });

        expect(screen.getByText('Yeni şifreler eşleşmiyor')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Şifreyi Değiştir' })).toBeDisabled();
        expect(mocks.resetUserPassword).not.toHaveBeenCalled();
    });

    it('submits the target id and required passwords', async () => {
        mocks.resetUserPassword.mockResolvedValue({
            message: 'Kullanıcı şifresi başarıyla değiştirildi',
        });
        const onSuccess = vi.fn();
        render(
            <UserPasswordResetModal
                user={user}
                onClose={vi.fn()}
                onSuccess={onSuccess}
            />,
        );
        fillValidForm();

        fireEvent.click(screen.getByRole('button', { name: 'Şifreyi Değiştir' }));

        await waitFor(() => {
            expect(mocks.resetUserPassword).toHaveBeenCalledWith('user-1', {
                adminPassword: 'admin-current',
                newPassword: 'new-pass-1',
            });
        });
        expect(onSuccess).toHaveBeenCalledWith('Kullanıcı şifresi başarıyla değiştirildi');
    });

    it('keeps backend errors visible in the modal', async () => {
        mocks.resetUserPassword.mockRejectedValue({
            response: {
                status: 400,
                data: {
                    code: 'ADMIN_PASSWORD_INVALID',
                    message: 'Admin şifresi hatalı',
                },
            },
        });
        render(
            <UserPasswordResetModal
                user={user}
                onClose={vi.fn()}
                onSuccess={vi.fn()}
            />,
        );
        fillValidForm('wrong-admin');

        fireEvent.click(screen.getByRole('button', { name: 'Şifreyi Değiştir' }));

        expect(await screen.findByText('Admin şifresi hatalı')).toBeInTheDocument();
        expect(screen.getByRole('heading', {
            name: 'Kullanıcı Şifresini Değiştir',
        })).toBeInTheDocument();
    });

    it('clears every password field before closing', () => {
        const onClose = vi.fn();
        render(
            <UserPasswordResetModal
                user={user}
                onClose={onClose}
                onSuccess={vi.fn()}
            />,
        );
        fillValidForm();

        fireEvent.click(screen.getByRole('button', { name: 'İptal' }));

        expect(screen.getByLabelText('Yeni şifre')).toHaveValue('');
        expect(screen.getByLabelText('Yeni şifre tekrarı')).toHaveValue('');
        expect(screen.getByLabelText('Admin mevcut şifresi')).toHaveValue('');
        expect(onClose).toHaveBeenCalledTimes(1);
    });
});
