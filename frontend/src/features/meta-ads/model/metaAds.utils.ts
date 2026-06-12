import type {
    MetaAdsCampaignRow,
    MetaAdsSortColumn,
} from '../metaAds.types';

export function formatMetaAdsMetric(value: number): string {
    if (value >= 1_000_000) return (value / 1_000_000).toFixed(1) + 'M';
    if (value >= 1_000) return (value / 1_000).toFixed(1) + 'K';
    return value.toLocaleString('tr-TR');
}

export function formatMetaAdsCurrency(value: number): string {
    return '₺' + value.toLocaleString('tr-TR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

export function sortMetaAdsCampaigns(
    campaigns: MetaAdsCampaignRow[],
    column: MetaAdsSortColumn,
    ascending: boolean,
): MetaAdsCampaignRow[] {
    return [...campaigns].sort((left, right) =>
        ascending
            ? left[column] - right[column]
            : right[column] - left[column],
    );
}
