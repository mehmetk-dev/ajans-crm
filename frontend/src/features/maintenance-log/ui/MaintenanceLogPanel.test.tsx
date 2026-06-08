import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { maintenanceLogApi } from '../api/maintenanceLogApi';
import { MaintenanceLogPanel } from './MaintenanceLogPanel';

function renderPanel() {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false },
        },
    });

    return render(
        <QueryClientProvider client={queryClient}>
            <MaintenanceLogPanel companyId="company-1" />
        </QueryClientProvider>
    );
}

describe('MaintenanceLogPanel', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('lists entries and creates a normalized entry', async () => {
        vi.spyOn(maintenanceLogApi, 'listCompany').mockResolvedValue([{
            id: 'entry-1',
            companyId: 'company-1',
            title: 'Mevcut bakım',
            description: null,
            category: 'update',
            performedAt: '2026-06-09T10:00:00.000Z',
            performedByName: 'Test User',
            createdAt: '2026-06-09T10:00:00.000Z',
        }]);
        const createSpy = vi.spyOn(maintenanceLogApi, 'create').mockResolvedValue({
            id: 'entry-2',
            companyId: 'company-1',
            title: 'SSL yenilendi',
            description: null,
            category: 'update',
            performedAt: '2026-06-09T11:00:00.000Z',
            createdAt: '2026-06-09T11:00:00.000Z',
        });

        renderPanel();

        expect(await screen.findByText('Mevcut bakım')).toBeInTheDocument();
        fireEvent.click(screen.getByRole('button', { name: 'Kayıt Ekle' }));
        fireEvent.change(screen.getByPlaceholderText('Örn: Ana sayfa banner güncellendi'), {
            target: { value: '  SSL yenilendi  ' },
        });
        fireEvent.click(screen.getByRole('button', { name: 'Kaydet' }));

        await waitFor(() => {
            expect(createSpy).toHaveBeenCalledWith('company-1', expect.objectContaining({
                title: 'SSL yenilendi',
                description: undefined,
                category: 'update',
            }));
        });
    });
});
