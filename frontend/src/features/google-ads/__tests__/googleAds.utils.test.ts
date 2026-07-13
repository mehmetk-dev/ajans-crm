import { describe, expect, it } from 'vitest';
import {
    campaignStatusTone,
    formatCurrency,
    formatMetric,
    sortCampaigns,
} from '../model/googleAds.utils';
import type { GoogleAdsCampaignRow } from '../googleAds.types';

const campaigns: GoogleAdsCampaignRow[] = [
    {
        campaignId: '1',
        campaignName: 'Brand',
        status: 'ENABLED',
        spend: 100,
        impressions: 1000,
        clicks: 50,
        conversions: 5,
        ctr: 5,
        cpc: 2,
    },
    {
        campaignId: '2',
        campaignName: 'Search',
        status: 'PAUSED',
        spend: 200,
        impressions: 500,
        clicks: 25,
        conversions: 10,
        ctr: 5,
        cpc: 8,
    },
];

describe('formatMetric', () => {
    it('küçük sayıları lokalize eder', () => {
        expect(formatMetric(42)).toBe('42');
    });

    it('binleri K ile kısaltır', () => {
        expect(formatMetric(1500)).toBe('1.5K');
    });

    it('milyonları M ile kısaltır', () => {
        expect(formatMetric(2_500_000)).toBe('2.5M');
    });
});

describe('formatCurrency', () => {
    it('Türk lirasını iki ondalıkla biçimlendirir', () => {
        const result = formatCurrency(1234.5, 'TRY');
        expect(result).toContain('₺');
        expect(result).toContain('1.234');
        expect(result).toContain('50');
    });

    it('hesabın para birimini kullanır', () => {
        expect(formatCurrency(1234.5, 'EUR')).toContain('€');
    });
});

describe('sortCampaigns', () => {
    it('harcamaya göre azalan sıralar', () => {
        expect(sortCampaigns(campaigns, 'spend', false).map(c => c.campaignId))
            .toEqual(['2', '1']);
    });

    it('tıklamaya göre artan sıralar', () => {
        expect(sortCampaigns(campaigns, 'clicks', true).map(c => c.campaignId))
            .toEqual(['2', '1']);
    });

    it('kaynak diziyi değiştirmez', () => {
        sortCampaigns(campaigns, 'spend', false);
        expect(campaigns.map(c => c.campaignId)).toEqual(['1', '2']);
    });
});

describe('campaignStatusTone', () => {
    it('aktif kampanyayı yeşil gösterir', () => {
        expect(campaignStatusTone('ENABLED')).toContain('emerald');
    });

    it('diğer durumları nötr gösterir', () => {
        expect(campaignStatusTone('PAUSED')).toContain('zinc');
    });
});
