import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ClientAnalyticsPage from './ClientAnalyticsPage';
import type { ServiceCategory } from '../../serviceCatalog';
import { googleAnalyticsApi } from '../../google-analytics/api/googleAnalyticsApi';
import { searchConsoleApi } from '../../search-console/api/searchConsoleApi';
import { googleAdsApi } from '../../google-ads/api/googleAdsApi';
import { metaAdsApi } from '../../meta-ads/api/metaAdsApi';
import { igApi } from '../../instagram/api/instagramApi';
import { integrationSnapshotApi } from '../../integration-snapshots/api/integrationSnapshotApi';

const activeServicesMock = vi.fn();

vi.mock('../../../store/AuthContext', () => ({
    useAuth: () => ({
        user: {
            id: 'user-1',
            companyId: 'company-1',
            globalRole: 'COMPANY_USER',
        },
    }),
}));

vi.mock('../../../hooks/useActiveServices', () => ({
    useActiveServices: () => activeServicesMock(),
}));

vi.mock('../../google-analytics/api/googleAnalyticsApi', () => ({
    googleAnalyticsApi: {
        getStatus: vi.fn(),
    },
}));

vi.mock('../../search-console/api/searchConsoleApi', () => ({
    searchConsoleApi: {
        getStatus: vi.fn(),
    },
}));

vi.mock('../../google-ads/api/googleAdsApi', () => ({
    googleAdsApi: {
        getStatus: vi.fn(),
    },
}));

vi.mock('../../meta-ads/api/metaAdsApi', () => ({
    metaAdsApi: {
        getStatus: vi.fn(),
    },
}));

vi.mock('../../instagram/api/instagramApi', () => ({
    igApi: {
        getStatus: vi.fn(),
    },
}));

vi.mock('../../integration-snapshots/api/integrationSnapshotApi', () => ({
    integrationSnapshotApi: {
        refreshOverview: vi.fn(),
    },
}));

vi.mock('../../web-design/ui/WebDesignPanel', () => ({
    default: () => <div>Web design panel</div>,
}));

vi.mock('./InstagramAnalyticsPanel', () => ({
    default: () => <div>Instagram panel</div>,
}));

vi.mock('../../content-plans/ui/ContentPlanPanel', () => ({
    ContentPlanPanel: () => <div>Content plan panel</div>,
}));

vi.mock('./ShootingTimelinePanel', () => ({
    default: () => <div>Shooting panel</div>,
}));

vi.mock('../../search-console/ui/SearchConsolePanel', () => ({
    default: () => <div>Search console panel</div>,
}));

vi.mock('../../google-analytics/ui/GoogleAnalyticsPanel', () => ({
    default: () => <div>Google analytics panel</div>,
}));

vi.mock('../../google-ads/ui/GoogleAdsPanel', () => ({
    default: () => <div>Google ads panel</div>,
}));

vi.mock('../../meta-ads/ui/MetaAdsPanel', () => ({
    default: () => <div>Meta ads panel</div>,
}));

function renderPage() {
    const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });

    return render(
        <QueryClientProvider client={queryClient}>
            <MemoryRouter>
                <ClientAnalyticsPage />
            </MemoryRouter>
        </QueryClientProvider>,
    );
}

function mockActiveServices(activeServices: ServiceCategory[]) {
    activeServicesMock.mockReturnValue({
        isLoading: false,
        activeServices,
        hasService: (service: ServiceCategory) => activeServices.includes(service),
    });
}

function sectionTitles() {
    return screen
        .getAllByRole('heading', { level: 2 })
        .map(heading => heading.textContent);
}

describe('ClientAnalyticsPage service ordering', () => {
    beforeEach(() => {
        activeServicesMock.mockReset();
        vi.mocked(googleAnalyticsApi.getStatus).mockResolvedValue({
            connected: true,
            propertyId: 'prop-1',
            authUrl: '',
        });
        vi.mocked(searchConsoleApi.getStatus).mockResolvedValue({
            connected: true,
            siteUrl: 'https://fogistanbul.com',
            hasScScope: true,
            needsReconnect: false,
            authUrl: '',
        });
        vi.mocked(googleAdsApi.getStatus).mockResolvedValue({
            connected: true,
            hasAdsScope: true,
            needsReconnect: false,
            customerId: '123',
            authUrl: '',
        });
        vi.mocked(metaAdsApi.getStatus).mockResolvedValue({
            connected: true,
            adAccountId: 'act_123',
            authUrl: '',
        });
        vi.mocked(igApi.getStatus).mockResolvedValue({
            configured: true,
            connected: true,
            authUrl: '',
            username: 'fogistanbul',
            igUserId: 'ig-1',
        });
        vi.mocked(integrationSnapshotApi.refreshOverview).mockResolvedValue(undefined);
    });

    it('moves inactive service sections below active service sections', () => {
        mockActiveServices([
            'WEB_DESIGN',
            'SOCIAL_MEDIA',
            'PRODUCTION',
            'DIGITAL_MARKETING',
            'AD_MANAGEMENT',
        ]);

        renderPage();

        const titles = sectionTitles();

        expect(titles.indexOf('İçerik Planı')).toBeGreaterThan(
            titles.indexOf('Meta Ads'),
        );
    });

    it('moves active but disconnected integration sections below connected sections', async () => {
        mockActiveServices([
            'WEB_DESIGN',
            'SOCIAL_MEDIA',
            'CONTENT_MARKETING',
            'PRODUCTION',
            'DIGITAL_MARKETING',
            'AD_MANAGEMENT',
        ]);
        vi.mocked(googleAnalyticsApi.getStatus).mockResolvedValue({
            connected: false,
            propertyId: '',
            authUrl: 'https://google.example/oauth',
        });
        vi.mocked(metaAdsApi.getStatus).mockResolvedValue({
            connected: false,
            adAccountId: '',
            authUrl: 'https://meta.example/oauth',
        });

        renderPage();

        await waitFor(() => {
            const titles = sectionTitles();

            expect(titles.indexOf('Google Analytics')).toBeGreaterThan(
                titles.indexOf('Google Ads'),
            );
            expect(titles.indexOf('Meta Ads')).toBeGreaterThan(
                titles.indexOf('Google Ads'),
            );
        });
    });

    it('forces backend snapshots before invalidating analytics queries', async () => {
        mockActiveServices(['SOCIAL_MEDIA']);

        renderPage();
        fireEvent.click(screen.getByRole('button', { name: 'Verileri Yenile' }));

        await waitFor(() => {
            expect(integrationSnapshotApi.refreshOverview).toHaveBeenCalledWith('company-1');
        });
    });

    it('shows a visible error when snapshot refresh fails', async () => {
        mockActiveServices(['SOCIAL_MEDIA']);
        vi.mocked(integrationSnapshotApi.refreshOverview)
            .mockRejectedValueOnce(new Error('Snapshot servisi yanıt vermiyor'));

        renderPage();
        fireEvent.click(screen.getByRole('button', { name: 'Verileri Yenile' }));

        expect(await screen.findByRole('alert')).toHaveTextContent(
            'Analitik verileri yenilenemedi',
        );
    });
});
