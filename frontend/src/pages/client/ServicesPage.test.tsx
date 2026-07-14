import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ServicesPage from './ServicesPage';

const createApprovalMock = vi.hoisted(() => vi.fn());
const listAdditionalServicesMock = vi.hoisted(() => vi.fn());
const activeServicesMock = vi.hoisted(() => vi.fn());

vi.mock('../../store/AuthContext', () => ({
    useAuth: () => ({
        user: { companyId: 'company-1' },
    }),
}));

vi.mock('../../features/content-plans', () => ({
    approvalApi: {
        create: (...args: unknown[]) => createApprovalMock(...args),
        listAdditionalServices: (...args: unknown[]) => listAdditionalServicesMock(...args),
    },
}));

vi.mock('../../hooks/useActiveServices', () => ({
    useActiveServices: () => ({ activeServices: activeServicesMock() }),
}));

describe('ServicesPage', () => {
    beforeEach(() => {
        createApprovalMock.mockReset();
        createApprovalMock.mockResolvedValue({ id: 'request-1' });
        listAdditionalServicesMock.mockReset();
        listAdditionalServicesMock.mockResolvedValue([]);
        activeServicesMock.mockReset();
        activeServicesMock.mockReturnValue([]);
    });

    it('makes the entire service card an explicit click target', async () => {
        render(<ServicesPage />);

        await screen.findByText('Henüz ek hizmet talebiniz bulunmuyor.');
        const card = screen.getByRole('button', { name: /Sosyal Medya — Kullanılabilir/i });

        expect(card).toHaveAttribute('type', 'button');
        expect(card).toHaveClass('w-full', 'h-full', 'cursor-pointer');
        expect(card).toHaveAttribute('aria-pressed', 'false');

        fireEvent.click(card);

        expect(card).toHaveAttribute('aria-pressed', 'true');
        expect(screen.getByText('1 hizmet seçildi')).toBeInTheDocument();
    });

    it('submits selected services and the note as a general approval request', async () => {
        render(<ServicesPage />);

        fireEvent.click(screen.getByRole('button', { name: /Sosyal Medya — Kullanılabilir/i }));
        fireEvent.click(screen.getByRole('button', { name: /Reklam Yönetimi — Kullanılabilir/i }));
        fireEvent.change(screen.getByPlaceholderText('Ek notlarınız veya detaylar...'), {
            target: { value: 'Yeni kampanya için önceliklidir.' },
        });
        fireEvent.click(screen.getByRole('button', { name: 'Talep Gönder' }));

        await waitFor(() => expect(createApprovalMock).toHaveBeenCalledTimes(1));
        const payload = createApprovalMock.mock.calls[0][0];
        expect(payload).toMatchObject({
            type: 'GENERAL',
            companyId: 'company-1',
            title: 'Ek Hizmet Talebi',
            description: 'Yeni kampanya için önceliklidir.',
        });
        expect(JSON.parse(payload.metadata)).toEqual({
            kind: 'ADDITIONAL_SERVICE',
            services: [
                { id: 'SOCIAL_MEDIA', name: 'Sosyal Medya' },
                { id: 'AD_MANAGEMENT', name: 'Reklam Yönetimi' },
            ],
        });
        expect(await screen.findByRole('heading', { name: 'Talebiniz Alındı!' })).toBeInTheDocument();
    });

    it('keeps the form open and shows an inline error when submission fails', async () => {
        createApprovalMock.mockRejectedValueOnce(new Error('network'));
        render(<ServicesPage />);

        fireEvent.click(screen.getByRole('button', { name: /Web Tasarımı — Kullanılabilir/i }));
        fireEvent.click(screen.getByRole('button', { name: 'Talep Gönder' }));

        expect(await screen.findByRole('alert')).toHaveTextContent('Ek hizmet talebi gönderilemedi');
        expect(screen.queryByRole('heading', { name: 'Talebiniz Alındı!' })).not.toBeInTheDocument();
    });

    it('marks active and pending services as unavailable for duplicate requests', async () => {
        activeServicesMock.mockReturnValue(['SOCIAL_MEDIA']);
        listAdditionalServicesMock.mockResolvedValue([
            {
                id: 'request-1',
                type: 'GENERAL',
                companyId: 'company-1',
                status: 'PENDING',
                title: 'Ek Hizmet Talebi',
                metadata: JSON.stringify({
                    kind: 'ADDITIONAL_SERVICE',
                    services: [{ id: 'AD_MANAGEMENT', name: 'Reklam Yönetimi' }],
                }),
                createdAt: '2026-07-14T10:00:00',
            },
        ]);

        render(<ServicesPage />);

        const social = await screen.findByRole('button', { name: /Sosyal Medya — Aktif/i });
        const ads = screen.getByRole('button', { name: /Reklam Yönetimi — Talep bekliyor/i });

        expect(social).toBeDisabled();
        expect(ads).toBeDisabled();
        expect(screen.getByText('Taleplerim')).toBeInTheDocument();
        expect(screen.getByText('Bekliyor')).toBeInTheDocument();
    });
});
