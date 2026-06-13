export { default as WebDesignPanel } from './ui/WebDesignPanel';
export { default as WebDesignAdminSection } from './ui/WebDesignAdminSection';
export {
    ConnectionCard,
    DeviceCompareCard,
    HealthSummary,
    ReadinessRow,
    ScoreInsightCard,
    VitalCard,
} from './ui/PageSpeedCards';
export { webDesignApi } from './api/webDesignApi';
export type { PageSpeedReport, PageSpeedScore, Strategy, HealthTone } from './webDesign.types';
export { toneStyles } from './webDesign.types';
export * from './model/webDesign.utils';
export { webDesignKeys } from './webDesignKeys';
