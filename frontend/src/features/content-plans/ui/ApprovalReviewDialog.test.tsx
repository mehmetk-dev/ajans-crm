import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ApprovalReviewDialog } from './ApprovalReviewDialog';

describe('ApprovalReviewDialog', () => {
    it('uses a simple confirmation form for general service requests', () => {
        const onApprove = vi.fn();
        render(
            <ApprovalReviewDialog
                request={{
                    id: 'request-1',
                    type: 'GENERAL',
                    referenceId: null,
                    companyName: 'Örnek Şirket',
                    companyId: 'company-1',
                    requestedByName: 'Ayşe Yılmaz',
                    requestedById: 'user-1',
                    status: 'PENDING',
                    title: 'Ek Hizmet Talebi',
                    description: null,
                    metadata: null,
                    reviewedByName: null,
                    reviewNote: null,
                    createdAt: '2026-07-14T12:00:00Z',
                    reviewedAt: null,
                }}
                staffMembers={[]}
                onClose={vi.fn()}
                onApprove={onApprove}
            />,
        );

        expect(screen.getByRole('heading', { name: 'İsteği Onayla' })).toBeInTheDocument();
        fireEvent.change(screen.getByPlaceholderText('Müşteriye iletilecek not...'), {
            target: { value: 'Satış ekibi iletişime geçecek.' },
        });
        fireEvent.click(screen.getByRole('button', { name: 'Onayla' }));

        expect(onApprove).toHaveBeenCalledWith({ note: 'Satış ekibi iletişime geçecek.' });
    });
});
