import { describe, expect, it } from 'vitest';
import {
    formatMetaAdsCurrency,
    formatMetaAdsMetric,
    sortMetaAdsCampaigns,
} from '../model/metaAds.utils';
import type { MetaAdsCampaignRow } from '../metaAds.types';

const campaign = (
    campaignId: string,
    spend: number,
    clicks: number,
): MetaAdsCampaignRow => ({
    campaignId,
    campaignName: campaignId,
    status: 'ACTIVE',
    objective: '',
    spend,
    impressions: clicks * 10,
    clicks,
    reach: clicks * 5,
    cpm: 0,
    cpc: 0,
    ctr: 0,
});

describe('metaAds.utils', () => {
    it('formats compact metrics and Turkish lira', () => {
        expect(formatMetaAdsMetric(1_500)).toBe('1.5K');
        expect(formatMetaAdsMetric(2_500_000)).toBe('2.5M');
        expect(formatMetaAdsCurrency(125.5)).toContain('125,50');
    });

    it('sorts campaigns without mutating the source list', () => {
        const source = [
            campaign('first', 10, 50),
            campaign('second', 20, 25),
        ];

        expect(sortMetaAdsCampaigns(source, 'spend', false)
            .map(item => item.campaignId))
            .toEqual(['second', 'first']);
        expect(sortMetaAdsCampaigns(source, 'clicks', true)
            .map(item => item.campaignId))
            .toEqual(['second', 'first']);
        expect(source.map(item => item.campaignId))
            .toEqual(['first', 'second']);
    });
});
