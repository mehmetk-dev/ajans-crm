import type {
    GoogleAdsCampaignRow,
    GoogleAdsSortColumn,
} from '../googleAds.types';

export function formatMetric(value: number): string {
    if (value >= 1_000_000) return (value / 1_000_000).toFixed(1) + 'M';
    if (value >= 1_000) return (value / 1_000).toFixed(1) + 'K';
    return value.toLocaleString('tr-TR');
}

export function formatCurrency(value: number): string {
    return '₺' + value.toLocaleString('tr-TR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

export function sortCampaigns(
    campaigns: GoogleAdsCampaignRow[],
    column: GoogleAdsSortColumn,
    ascending: boolean,
): GoogleAdsCampaignRow[] {
    return [...campaigns].sort((left, right) =>
        ascending
            ? left[column] - right[column]
            : right[column] - left[column],
    );
}

export function campaignStatusTone(status: string): string {
    return status === 'ENABLED'
        ? 'text-emerald-400 bg-emerald-500/10'
        : 'text-zinc-500 bg-zinc-500/10';
}
