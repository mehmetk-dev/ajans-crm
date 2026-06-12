package com.fogistanbul.crm.googleanalytics.application;

import com.fogistanbul.crm.company.application.CompanyServiceAccessGuard;
import com.fogistanbul.crm.entity.enums.ServiceCategory;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.UUID;

/**
 * Google Analytics endpointleri için yetkilendirme kuralları.
 * Tüm GA endpointleri DIGITAL_MARKETING servis aktivasyonu gerektirir.
 */
@Component
@RequiredArgsConstructor
public class GoogleAnalyticsAccessPolicy {

    private final CompanyServiceAccessGuard serviceAccessGuard;

    /**
     * Client kullanıcının belirtilen şirkete ait GA verilerine erişip erişemeyeceğini kontrol eder.
     * DIGITAL_MARKETING servisi aktif olmalıdır.
     */
    public void requireClientAccess(UUID userId, UUID companyId) {
        serviceAccessGuard.requireService(userId, companyId, ServiceCategory.DIGITAL_MARKETING);
    }
}
