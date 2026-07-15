import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { postMock } = vi.hoisted(() => ({ postMock: vi.fn() }));

vi.mock('../store/AuthContext', () => ({
    useAuth: () => ({ user: null }),
}));

vi.mock('../api/client', () => ({
    default: { post: postMock },
}));

import LandingPage from './LandingPage';

function renderLandingPage() {
    render(
        <MemoryRouter>
            <LandingPage />
        </MemoryRouter>
    );
}

describe('LandingPage', () => {
    beforeEach(() => {
        postMock.mockReset();
    });

    it('renders the final component choices without design switchers', () => {
        renderLandingPage();

        expect(screen.queryByText(/Tasarım Felsefesi/i)).not.toBeInTheDocument();
        expect(screen.getByText(/Liquid timeline/i)).toBeInTheDocument();
        expect(screen.getByText(/Tartışma burada, onay son mesajda/i)).toBeInTheDocument();
        expect(screen.getByText(/Ajans İş Birliğinde Yeni Standart/i)).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: /Projenizi bize anlatın/i })).toBeInTheDocument();
    });

    it('is composed from focused landing feature components', () => {
        const componentModules = import.meta.glob('../features/landing/ui/*.tsx');
        const componentFiles = Object.keys(componentModules);

        [
            'LandingHeader',
            'HeroSection',
            'AboutSection',
            'WorkflowSection',
            'ServicesSection',
            'ApprovalSection',
            'BenefitsSection',
            'FaqSection',
            'CtaSection',
            'ContactSection',
            'LandingFooter',
        ].forEach((componentName) => {
            expect(componentFiles.some((file) => file.endsWith(`/${componentName}.tsx`))).toBe(true);
        });
    });

    it('submits the contact form and shows visible success feedback', async () => {
        postMock.mockResolvedValueOnce({ data: { message: 'Mesajınız ulaştı' } });
        renderLandingPage();

        fireEvent.change(screen.getByLabelText(/Ad Soyad/i), { target: { value: 'Ayşe Yılmaz' } });
        fireEvent.change(screen.getByLabelText(/^E-posta/i), { target: { value: 'ayse@example.com' } });
        fireEvent.change(screen.getByLabelText(/Hangi konuda/i), { target: { value: 'Dijital Pazarlama' } });
        fireEvent.change(screen.getByLabelText(/Mesajınız/i), { target: { value: 'Yeni projemiz için görüşmek istiyoruz.' } });
        fireEvent.click(screen.getByRole('checkbox'));
        fireEvent.click(screen.getByRole('button', { name: /Talebimi Gönder/i }));

        await waitFor(() => expect(postMock).toHaveBeenCalledWith('/contact', expect.objectContaining({
            name: 'Ayşe Yılmaz',
            email: 'ayse@example.com',
            service: 'Dijital Pazarlama',
        })));
        expect(await screen.findByRole('status')).toHaveTextContent(/Mesajınız ulaştı/i);
    });
});
