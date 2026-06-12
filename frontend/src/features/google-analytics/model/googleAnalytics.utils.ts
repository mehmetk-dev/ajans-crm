import type { DatePreset, GaNamedMetric, SourcePieEntry, CountryBarEntry } from '../googleAnalytics.types';

// ─── Renk paletleri ────────────────────────────────────────────────────────────

export const SOURCE_COLORS = [
    '#3b82f6', '#10b981', '#f97316', '#8b5cf6', '#ec4899', '#06b6d4', '#f43f5e', '#84cc16',
] as const;

export const COUNTRY_COLORS = [
    '#3b82f6', '#10b981', '#f97316', '#8b5cf6', '#ec4899',
] as const;

// ─── Tarih aralıkları ─────────────────────────────────────────────────────────

export const DATE_PRESETS: DatePreset[] = [
    { label: 'Son 7 Gün',  start: '7daysAgo',   end: 'today', desc: 'Son 7 günlük' },
    { label: 'Son 14 Gün', start: '14daysAgo',  end: 'today', desc: 'Son 14 günlük' },
    { label: 'Son 30 Gün', start: '30daysAgo',  end: 'today', desc: 'Son 30 günlük' },
    { label: 'Son 90 Gün', start: '90daysAgo',  end: 'today', desc: 'Son 90 günlük' },
    { label: 'Son 6 Ay',   start: '180daysAgo', end: 'today', desc: 'Son 6 aylık' },
    { label: 'Son 1 Yıl',  start: '365daysAgo', end: 'today', desc: 'Son 1 yıllık' },
];

/** Panel bileşeni için desc alanı olmayan kısa preset listesi */
export const PANEL_PRESETS: Omit<DatePreset, 'desc'>[] = DATE_PRESETS.map(
    ({ label, start, end }) => ({ label, start, end }),
);

// ─── Formatlama yardımcıları ───────────────────────────────────────────────────

/**
 * Saniyeyi "Xdk Ysn" formatına çevirir.
 * @example formatDuration(125) → "2dk 5sn"
 */
export function formatDuration(secs: number): string {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}dk ${s}sn`;
}

/**
 * Büyük sayıları kısaltır.
 * @example formatNum(1500000) → "1.5M"
 * @example formatNum(2500) → "2.5K"
 * @example formatNum(42) → "42"
 */
export function formatNum(n: number): string {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return n.toLocaleString('tr-TR');
}

/**
 * Hemen çıkma oranından etkileşim oranını hesaplar (yüzde string).
 * @example computeEngagementRate(35.5) → "64.5"
 */
export function computeEngagementRate(bounceRate: number): string {
    return (100 - bounceRate).toFixed(1);
}

/**
 * Kullanıcı başına oturum sayısını hesaplar.
 * @example computeSessionsPerUser(300, 100) → "3.00"
 */
export function computeSessionsPerUser(sessions: number, totalUsers: number): string {
    if (totalUsers <= 0) return '0';
    return (sessions / totalUsers).toFixed(2);
}

// ─── Grafik veri dönüşümleri ──────────────────────────────────────────────────

/**
 * Trafik kaynağı listesini renk atanmış pie grafik verisine dönüştürür.
 */
export function buildSourcePieData(sources: GaNamedMetric[]): SourcePieEntry[] {
    return sources.map((s, i) => ({
        name: s.name,
        value: s.value,
        color: SOURCE_COLORS[i % SOURCE_COLORS.length],
    }));
}

/**
 * Ülke listesini renk atanmış bar grafik verisine dönüştürür.
 */
export function buildCountryBarData(countries: GaNamedMetric[]): CountryBarEntry[] {
    return countries.map((c, i) => ({
        name: c.name,
        value: c.value,
        fill: COUNTRY_COLORS[i % COUNTRY_COLORS.length],
    }));
}
