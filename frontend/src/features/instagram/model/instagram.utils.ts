export function formatInstagramMetric(value: number): string {
    if (value >= 1_000_000) return (value / 1_000_000).toFixed(1) + 'M';
    if (value >= 1_000) return (value / 1_000).toFixed(1) + 'K';
    return value.toLocaleString('tr-TR');
}

export function instagramGrowthRate(
    followersCount: number,
    followersGained: number,
    followersLost: number,
): number {
    if (followersCount <= 0) return 0;
    return (followersGained - followersLost) / followersCount * 100;
}

export function instagramEngagementRate(
    followersCount: number,
    totalLikes: number,
    totalComments: number,
): number {
    if (followersCount <= 0) return 0;
    return (totalLikes + totalComments) / followersCount * 100;
}
