/**
 * @deprecated Yeni kod için `features/search-console` modülünü kullanın.
 * Bu dosya geriye uyumluluk için korunmaktadır.
 */
export type {
    ScDailyRow,
    ScNamedMetric,
    ScOverviewResponse,
    ScPageRow,
    ScQueryRow,
    ScSite,
    ScStatusResponse,
} from '../features/search-console/searchConsole.types';

export { searchConsoleApi as scApi } from '../features/search-console/api/searchConsoleApi';
