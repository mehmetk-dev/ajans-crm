import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { integrationSnapshotApi } from '../../integration-snapshots/api/integrationSnapshotApi';
import type { ClientIntegrationSnapshotOverviewResponse } from '../../integration-snapshots/integrationSnapshot.types';
import { searchConsoleApi } from '../api/searchConsoleApi';
import type { ScOverviewResponse } from '../searchConsole.types';
import SearchConsolePanel from './SearchConsolePanel';

vi.mock('recharts', () => ({
    AreaChart: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
    Area: () => null,
    XAxis: () => null,
    YAxis: () => null,
    CartesianGrid: () => null,
    Tooltip: () => null,
    ResponsiveContainer: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
    PieChart: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
    Pie: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
    Cell: () => null,
    Legend: () => null,
}));

const sc: ScOverviewResponse = {
    connected: true,
    siteUrl: 'sc-domain:example.com',
    errorMessage: null,
    totalClicks: 25,
    totalImpressions: 500,
    avgCtr: 5,
    avgPosition: 7.2,
    dailyTrend: [],
    topQueries: [],
    topPages: [],
    devices: [],
    countries: [],
};

describe('SearchConsolePanel', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it('renders the persisted snapshot without issuing a live Search Console overview request', async () => {
        vi.spyOn(searchConsoleApi, 'getStatus').mockResolvedValue({
            connected: true,
            siteUrl: 'sc-domain:example.com',
            hasScScope: true,
            needsReconnect: false,
            authUrl: '',
        });
        const liveOverview = vi.spyOn(searchConsoleApi, 'getOverview').mockResolvedValue(sc);
        const snapshotOverview = vi.spyOn(integrationSnapshotApi, 'getOverview').mockResolvedValue({
            sc,
            scSnapshot: {
                status: 'READY',
                lastSyncedAt: '2026-07-14T09:00:00Z',
                nextSyncAt: '2026-07-14T15:00:00Z',
                stale: false,
                errorMessage: null,
            },
        } as ClientIntegrationSnapshotOverviewResponse);

        render(
            <MemoryRouter>
                <SearchConsolePanel companyId="company-1" />
            </MemoryRouter>,
        );

        await waitFor(() => expect(screen.getByText('25')).toBeInTheDocument());

        expect(snapshotOverview).toHaveBeenCalledWith('company-1');
        expect(liveOverview).not.toHaveBeenCalled();
        expect(screen.getByText(/Son güncelleme:/)).toBeInTheDocument();
    });
});
