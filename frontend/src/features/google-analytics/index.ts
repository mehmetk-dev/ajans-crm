// Tipler
export type {
    GaDailyRow,
    GaNamedMetric,
    GaOverviewResponse,
    GaStatusResponse,
    DatePreset,
    SourcePieEntry,
    CountryBarEntry,
} from './googleAnalytics.types';

// Key factory
export { analyticsKeys } from './googleAnalyticsKeys';

// API
export { googleAnalyticsApi } from './api/googleAnalyticsApi';

// Utils / model
export {
    SOURCE_COLORS,
    COUNTRY_COLORS,
    DATE_PRESETS,
    PANEL_PRESETS,
    formatDuration,
    formatNum,
    computeEngagementRate,
    computeSessionsPerUser,
    buildSourcePieData,
    buildCountryBarData,
} from './model/googleAnalytics.utils';

// UI bileşenleri
export { ChartTooltip, BigMetricCard, MetricCard, SectionHeader } from './ui/GoogleAnalyticsCards';
export { default as GoogleAnalyticsPanel } from './ui/GoogleAnalyticsPanel';
