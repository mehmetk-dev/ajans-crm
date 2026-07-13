import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { CreateCompanyForm } from './CreateCompanyForm';
import type { CreateCompanyInput } from '../api/company.types';

const form: CreateCompanyInput = {
    name: '',
    ownerFullName: '',
    ownerEmail: '',
    ownerPassword: '',
    selectedServices: [],
};

describe('CreateCompanyForm', () => {
    it('prevents the signed-in admin credentials from autofilling the new owner account', () => {
        const onFieldChange = vi.fn();

        render(
            <CreateCompanyForm
                form={form}
                saving={false}
                error=""
                onFieldChange={onFieldChange}
                onFoundedYearChange={vi.fn()}
                onToggleService={vi.fn()}
                onSelectAllServices={vi.fn()}
                onSubmit={vi.fn()}
                onClose={vi.fn()}
            />,
        );

        const ownerEmail = screen.getByPlaceholderText('Email *');
        const ownerPassword = screen.getByPlaceholderText('Şifre (en az 8 karakter) *');

        expect(ownerEmail.closest('form')).toHaveAttribute('autocomplete', 'off');
        expect(ownerEmail).toHaveAttribute('name', 'ownerEmail');
        expect(ownerEmail).toHaveAttribute('autocomplete', 'off');
        expect(ownerPassword).toHaveAttribute('name', 'ownerPassword');
        expect(ownerPassword).toHaveAttribute('autocomplete', 'new-password');

        fireEvent.change(ownerPassword, { target: { value: 'Manual123!' } });
        expect(onFieldChange).toHaveBeenCalledWith('ownerPassword', 'Manual123!');
    });
});
