import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { GoogleAdsAccountOption } from '../googleAds.types';
import GoogleAdsAccountPicker from './GoogleAdsAccountPicker';

const accounts: GoogleAdsAccountOption[] = [
    {
        customerId: '2994497086',
        descriptiveName: 'Direct Co',
        loginCustomerId: '2994497086',
        accessType: 'DIRECT',
        managerName: null,
        status: 'ENABLED',
    },
    {
        customerId: '2222222222',
        descriptiveName: 'Managed Co',
        loginCustomerId: '8437875152',
        accessType: 'MANAGER',
        managerName: 'Agency MCC',
        status: 'ENABLED',
    },
];

describe('GoogleAdsAccountPicker', () => {
    it('shows access path and submits the exact selected option', () => {
        const onSelect = vi.fn();
        const onSubmit = vi.fn();
        render(
            <GoogleAdsAccountPicker
                accounts={accounts}
                selectedKey=""
                isLoading={false}
                isSaving={false}
                warnings={[]}
                onSelect={onSelect}
                onSubmit={onSubmit}
                onRetry={vi.fn()}
            />,
        );

        expect(screen.getByText('Doğrudan erişim')).toBeInTheDocument();
        expect(screen.getByText('Agency MCC üzerinden')).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: /Managed Co/ }));
        expect(onSelect).toHaveBeenCalledWith('2222222222:8437875152');
    });
});
