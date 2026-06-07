import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../store/AuthContext';
import { clientApi } from '../api/clientPanel';
import { SERVICE_CATEGORIES, type ServiceCategory } from '../features/serviceCatalog';

export { SERVICE_CATEGORIES };
export type { ServiceCategory };

export function useActiveServices() {
    const { user } = useAuth();
    // Only fetch for client users — admins/staff don't have company-scoped services
    const isClientUser = user?.globalRole === 'COMPANY_USER';

    const { data, isLoading } = useQuery({
        queryKey: ['active-services', user?.companyId],
        queryFn: () => clientApi.getActiveServices(),
        enabled: isClientUser,
        staleTime: 0,              // Her zaman backend'den taze veri al
        gcTime: 5 * 60_000,       // 5 dakika cache'de tut
        refetchOnWindowFocus: true, // Tab'a dönünce yenile
    });

    const activeServices: string[] = data?.activeServices ?? [];

    return {
        isLoading: isClientUser ? isLoading : false,
        activeServices,
        hasService: (category: ServiceCategory | string) => !isClientUser || activeServices.includes(category),
        hasDigitalMarketing: !isClientUser || activeServices.includes('DIGITAL_MARKETING'),
        hasWebDesign: !isClientUser || activeServices.includes('WEB_DESIGN'),
        hasAdManagement: !isClientUser || activeServices.includes('AD_MANAGEMENT'),
        hasSocialMedia: !isClientUser || activeServices.includes('SOCIAL_MEDIA'),
        hasProduction: !isClientUser || activeServices.includes('PRODUCTION'),
        hasContentMarketing: !isClientUser || activeServices.includes('CONTENT_MARKETING'),
    };
}
