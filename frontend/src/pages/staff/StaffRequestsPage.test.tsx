import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import StaffRequestsPage from './StaffRequestsPage';

const request = {
    id: 'request-1',
    type: 'GENERAL',
    referenceId: null,
    companyName: 'Örnek Şirket',
    companyId: 'company-1',
    requestedByName: 'Ayşe Yılmaz',
    requestedById: 'user-1',
    requestedByAvatarUrl: null,
    status: 'PENDING',
    title: 'Ek Hizmet Talebi',
    description: 'Yeni kampanya için önceliklidir.',
    metadata: JSON.stringify({
        kind: 'ADDITIONAL_SERVICE',
        services: [
            { id: 'social', name: 'Sosyal Medya Yönetimi' },
            { id: 'seo', name: 'SEO Optimizasyonu' },
        ],
    }),
    reviewedByName: null,
    reviewNote: null,
    createdAt: '2026-07-14T12:00:00Z',
    reviewedAt: null,
};

vi.mock('../../features/content-plans', () => ({
    ApprovalReviewDialog: () => null,
    parseContentApprovalMetadata: () => ({}),
    useApprovalRequests: () => ({ data: [request], isLoading: false }),
    useRejectApproval: () => ({ mutate: vi.fn() }),
    useReviewApproval: () => ({ mutate: vi.fn(), isPending: false }),
}));

vi.mock('../../features/tasks', () => ({
    taskApi: { listAssignableUsers: vi.fn().mockResolvedValue([]) },
    taskKeys: { assignableUsers: () => ['assignable-users'] },
}));

describe('StaffRequestsPage', () => {
    it('shows requested additional services and the customer note', () => {
        const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
        render(
            <QueryClientProvider client={queryClient}>
                <StaffRequestsPage />
            </QueryClientProvider>,
        );

        fireEvent.click(screen.getByRole('button', { name: /Ek Hizmet Talebi/i }));

        expect(screen.getByText('Talep edilen hizmetler')).toBeInTheDocument();
        expect(screen.getByText('Sosyal Medya Yönetimi')).toBeInTheDocument();
        expect(screen.getByText('SEO Optimizasyonu')).toBeInTheDocument();
        expect(screen.getByText('Müşteri notu')).toBeInTheDocument();
        expect(screen.getByText('Yeni kampanya için önceliklidir.')).toBeInTheDocument();
    });
});
