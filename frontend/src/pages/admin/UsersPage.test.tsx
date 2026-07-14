import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AllUserResponse } from '../../api/admin';
import UsersPage from './UsersPage';

const mocks = vi.hoisted(() => ({
    getAllUsers: vi.fn(),
    updateUser: vi.fn(),
    updateUserRole: vi.fn(),
    resetUserPassword: vi.fn(),
    deleteUser: vi.fn(),
}));

vi.mock('../../api/admin', () => ({
    adminApi: {
        getAllUsers: mocks.getAllUsers,
        updateUser: mocks.updateUser,
        updateUserRole: mocks.updateUserRole,
        resetUserPassword: mocks.resetUserPassword,
        deleteUser: mocks.deleteUser,
    },
}));

const adminUser: AllUserResponse = {
    id: 'admin-1',
    fullName: 'Sistem Yöneticisi',
    email: 'admin@example.com',
    globalRole: 'ADMIN',
    membershipRole: null,
    avatarUrl: null,
    phone: null,
    position: null,
    department: null,
    companies: [],
    createdAt: '2026-07-14T10:00:00Z',
};

const companyUser: AllUserResponse = {
    id: 'company-user-1',
    fullName: 'Şirket Kullanıcısı',
    email: 'company@example.com',
    globalRole: 'COMPANY_USER',
    membershipRole: 'OWNER',
    avatarUrl: null,
    phone: null,
    position: null,
    department: null,
    companies: [],
    createdAt: '2026-07-14T11:00:00Z',
};

describe('UsersPage password reset', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.getAllUsers.mockResolvedValue([adminUser, companyUser]);
    });

    it('shows the password action only for non-admin users', async () => {
        render(<UsersPage />);

        const adminRow = (await screen.findByText('admin@example.com')).closest('tr');
        const companyRow = screen.getByText('company@example.com').closest('tr');

        expect(adminRow).not.toBeNull();
        expect(companyRow).not.toBeNull();
        expect(within(adminRow!).queryByRole('button', { name: 'Şifre Değiştir' })).not.toBeInTheDocument();
        expect(within(companyRow!).getByRole('button', { name: 'Şifre Değiştir' })).toBeInTheDocument();
    });

    it('opens the modal and shows visible success feedback after reset', async () => {
        mocks.resetUserPassword.mockResolvedValue({
            message: 'Kullanıcı şifresi başarıyla değiştirildi',
        });
        render(<UsersPage />);

        const companyRow = (await screen.findByText('company@example.com')).closest('tr');
        fireEvent.click(within(companyRow!).getByRole('button', { name: 'Şifre Değiştir' }));

        expect(screen.getByRole('heading', {
            name: 'Kullanıcı Şifresini Değiştir',
        })).toBeInTheDocument();

        fireEvent.change(screen.getByLabelText('Yeni şifre'), {
            target: { value: 'new-pass-1' },
        });
        fireEvent.change(screen.getByLabelText('Yeni şifre tekrarı'), {
            target: { value: 'new-pass-1' },
        });
        fireEvent.change(screen.getByLabelText('Admin mevcut şifresi'), {
            target: { value: 'admin-current' },
        });
        fireEvent.click(screen.getByRole('button', { name: 'Şifreyi Değiştir' }));

        expect(await screen.findByText('Kullanıcı şifresi başarıyla değiştirildi')).toBeInTheDocument();
        await waitFor(() => {
            expect(screen.queryByRole('heading', {
                name: 'Kullanıcı Şifresini Değiştir',
            })).not.toBeInTheDocument();
        });
    });
});
