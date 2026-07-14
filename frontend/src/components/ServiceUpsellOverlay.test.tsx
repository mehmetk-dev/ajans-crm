import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ServicePageGate } from './ServiceUpsellOverlay';

const activeServicesMock = vi.fn();
const membershipRoleMock = vi.fn();

vi.mock('../hooks/useActiveServices', () => ({
    useActiveServices: () => activeServicesMock(),
}));

vi.mock('../store/AuthContext', () => ({
    useAuth: () => ({ user: { membershipRole: membershipRoleMock() } }),
}));

describe('ServicePageGate', () => {
    beforeEach(() => {
        activeServicesMock.mockReset();
        membershipRoleMock.mockReturnValue('OWNER');
    });

    it('does not mount gated children while active services are loading', () => {
        activeServicesMock.mockReturnValue({
            isLoading: true,
            hasService: () => false,
        });

        render(
            <MemoryRouter>
                <ServicePageGate service="DIGITAL_MARKETING">
                    <div>Heavy analytics child</div>
                </ServicePageGate>
            </MemoryRouter>,
        );

        expect(screen.queryByText('Heavy analytics child')).not.toBeInTheDocument();
        expect(screen.getByText('Hizmet bilgileri yükleniyor...')).toBeInTheDocument();
    });

    it('does not mount gated children when the service is inactive', () => {
        activeServicesMock.mockReturnValue({
            isLoading: false,
            hasService: () => false,
        });

        render(
            <MemoryRouter>
                <ServicePageGate service="DIGITAL_MARKETING">
                    <div>Heavy analytics child</div>
                </ServicePageGate>
            </MemoryRouter>,
        );

        expect(screen.queryByText('Heavy analytics child')).not.toBeInTheDocument();
        expect(screen.getByText('Hizmet Aktif Değil')).toBeInTheDocument();
    });

    it('tells employees to contact their owner instead of showing a dead request CTA', () => {
        membershipRoleMock.mockReturnValue('EMPLOYEE');
        activeServicesMock.mockReturnValue({
            isLoading: false,
            hasService: () => false,
        });

        render(
            <MemoryRouter>
                <ServicePageGate service="DIGITAL_MARKETING">
                    <div>Heavy analytics child</div>
                </ServicePageGate>
            </MemoryRouter>,
        );

        expect(screen.getByText(/şirket sahibinizden/i)).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Hizmet Talep Et' })).not.toBeInTheDocument();
    });
});
