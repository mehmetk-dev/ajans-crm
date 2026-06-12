/**
 * @deprecated Yeni kod için `features/google-analytics` modülünü kullanın.
 * Bu dosya geriye uyumluluk için korunmaktadır.
 */
export type {
  GaDailyRow,
  GaNamedMetric,
  GaOverviewResponse,
  GaStatusResponse,
} from "../features/google-analytics/googleAnalytics.types";

export { googleAnalyticsApi as gaApi } from "../features/google-analytics/api/googleAnalyticsApi";
