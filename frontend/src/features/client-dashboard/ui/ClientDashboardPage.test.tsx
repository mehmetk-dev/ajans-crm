import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const dashboardMock = vi.hoisted(() => vi.fn());
const refreshTabMock = vi.hoisted(() => vi.fn());

vi.mock('../useClientDashboard', () => ({
    useClientDashboard: () => dashboardMock(),
    useRefreshDashboard: () => ({ refreshTab: refreshTabMock }),
}));

import ClientDashboardPage from './ClientDashboardPage';

function baseDashboard(overrides: Record<string, unknown> = {}) {
    return {
        companyId: 'company-1',
        isLoading: false,
        ga: undefined,
        sc: undefined,
        ig: undefined,
        ads: {
            connected: true,
            hasAdsScope: true,
            customerId: '123',
            currencyCode: 'TRY',
            errorMessage: null,
            totalSpend: 1250,
            impressions: 10000,
            clicks: 400,
            conversions: 32,
            ctr: 4,
            cpc: 3.13,
            conversionRate: 8,
            campaigns: [],
            dailyTrend: [],
        },
        metaAds: {
            connected: false,
            adAccountId: null,
            adAccountName: null,
            errorMessage: null,
            totalSpend: 0,
            impressions: 0,
            clicks: 0,
            reach: 0,
            cpm: 0,
            cpc: 0,
            ctr: 0,
            campaigns: [],
            dailyTrend: [],
        },
        shoots: [],
        tasks: [],
        gaSnapshot: undefined,
        scSnapshot: undefined,
        igSnapshot: undefined,
        adsSnapshot: undefined,
        metaAdsSnapshot: undefined,
        gaConnected: false,
        scConnected: false,
        igConnected: false,
        googleAdsConnected: true,
        metaAdsConnected: false,
        hasProduction: false,
        hasContentMarketing: false,
        hasService: (service: string) => service === 'AD_MANAGEMENT',
        ...overrides,
    };
}

function renderPage() {
    return render(
        <MemoryRouter>
            <ClientDashboardPage />
        </MemoryRouter>,
    );
}

describe('ClientDashboardPage', () => {
    beforeEach(() => {
        dashboardMock.mockReset();
        refreshTabMock.mockReset();
        refreshTabMock.mockResolvedValue(undefined);
        dashboardMock.mockReturnValue(baseDashboard());
    });

    it('shows an advertising tab when ad management is active', () => {
        renderPage();

        fireEvent.click(screen.getByRole('button', { name: 'Reklamlar' }));

        expect(screen.getByText('Google Ads')).toBeInTheDocument();
        expect(screen.getByText('Meta Ads bağlı değil')).toBeInTheDocument();
        expect(screen.getByText('₺1.3K')).toBeInTheDocument();
    });

    it('keeps the tasks tab visible without the production service', () => {
        renderPage();

        expect(screen.getByRole('button', { name: 'Takvim & Görevler' })).toBeInTheDocument();
    });

    it('shows a visible refresh error', async () => {
        refreshTabMock.mockRejectedValueOnce(new Error('Meta geçici olarak yanıt vermiyor'));
        renderPage();

        fireEvent.click(screen.getByRole('button', { name: 'Yenile' }));

        expect(await screen.findByRole('alert')).toHaveTextContent('Dashboard verileri yenilenemedi');
    });

    it('shows a company-context error instead of an empty dashboard', async () => {
        dashboardMock.mockReturnValue(baseDashboard({ companyId: '' }));
        renderPage();

        await waitFor(() => {
            expect(screen.getByText('Müşteri şirketi bulunamadı')).toBeInTheDocument();
        });
    });
});
