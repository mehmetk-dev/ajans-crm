package com.fogistanbul.crm.instagram.application;

import com.fogistanbul.crm.company.application.CompanyServiceAccessGuard;
import com.fogistanbul.crm.entity.enums.ServiceCategory;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
@RequiredArgsConstructor
public class InstagramAccessPolicy {

    private final CompanyServiceAccessGuard serviceAccessGuard;

    public void requireClientAccess(UUID userId, UUID companyId) {
        serviceAccessGuard.requireService(
                userId, companyId, ServiceCategory.SOCIAL_MEDIA);
    }
}
