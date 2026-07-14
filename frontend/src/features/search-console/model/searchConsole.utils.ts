import type {
    ScNamedMetric,
    SearchConsoleBarEntry,
    SearchConsoleDatePreset,
    SearchConsolePieEntry,
} from '../searchConsole.types';

export const DEVICE_COLORS = [
    '#3b82f6', '#f97316', '#8b5cf6', '#10b981', '#ec4899',
] as const;

export const COUNTRY_COLORS = [
    '#3b82f6', '#10b981', '#f97316', '#8b5cf6', '#ec4899', '#06b6d4', '#f43f5e', '#84cc16',
] as const;

export const DATE_PRESETS: SearchConsoleDatePreset[] = [
    { label: 'Son 7 Gün', start: '6daysAgo', end: 'today', desc: 'Son 7 günlük' },
    { label: 'Son 14 Gün', start: '13daysAgo', end: 'today', desc: 'Son 14 günlük' },
    { label: 'Son 30 Gün', start: '29daysAgo', end: 'today', desc: 'Son 30 günlük' },
    { label: 'Son 90 Gün', start: '89daysAgo', end: 'today', desc: 'Son 90 günlük' },
    { label: 'Son 6 Ay', start: '179daysAgo', end: 'today', desc: 'Son 6 aylık' },
    { label: 'Son 1 Yıl', start: '364daysAgo', end: 'today', desc: 'Son 1 yıllık' },
];

export const PANEL_PRESETS: Omit<SearchConsoleDatePreset, 'desc'>[] = DATE_PRESETS.map(
    ({ label, start, end }) => ({ label, start, end }),
);

export function formatNum(value: number): string {
    if (value >= 1_000_000) return (value / 1_000_000).toFixed(1) + 'M';
    if (value >= 1000) return (value / 1000).toFixed(1) + 'K';
    return value.toLocaleString('tr-TR');
}

export function buildDevicePieData(devices: ScNamedMetric[]): SearchConsolePieEntry[] {
    return devices.map((device, index) => ({
        name: device.name,
        value: device.clicks,
        color: DEVICE_COLORS[index % DEVICE_COLORS.length],
    }));
}

export function buildCountryBarData(countries: ScNamedMetric[]): SearchConsoleBarEntry[] {
    return countries.map((country, index) => ({
        name: country.name,
        value: country.clicks,
        fill: COUNTRY_COLORS[index % COUNTRY_COLORS.length],
    }));
}

export function computeClickThroughRate(clicks: number, impressions: number): string {
    if (impressions <= 0) return '0%';
    return `${((clicks / impressions) * 100).toFixed(2)}%`;
}

export function getPositionLabel(position: number): string {
    if (position <= 0) return 'Veri yok';
    if (position <= 3) return "Harika! İlk 3'te";
    if (position <= 10) return 'İlk sayfada';
    if (position <= 20) return 'İkinci sayfada';
    return 'Geliştirilebilir';
}

export function getSearchConsoleDateRangeError(start: string, end: string): string | null {
    if (!start || !end) return 'Başlangıç ve bitiş tarihlerini seçin.';

    const startDate = new Date(`${start}T00:00:00`);
    const endDate = new Date(`${end}T00:00:00`);
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
        return 'Geçerli bir tarih aralığı seçin.';
    }
    if (startDate > endDate) return 'Başlangıç tarihi bitiş tarihinden sonra olamaz.';

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (endDate > today) return 'Bitiş tarihi gelecekte olamaz.';

    const inclusiveDays = Math.floor((endDate.getTime() - startDate.getTime()) / 86_400_000) + 1;
    if (inclusiveDays > 500) return 'Tarih aralığı en fazla 500 gün olabilir.';
    return null;
}
