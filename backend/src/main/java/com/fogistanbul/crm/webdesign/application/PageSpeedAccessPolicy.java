package com.fogistanbul.crm.webdesign.application;

import com.fogistanbul.crm.company.application.CompanyServiceAccessGuard;
import com.fogistanbul.crm.entity.enums.ServiceCategory;
import com.fogistanbul.crm.repository.CompanyMembershipRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class PageSpeedAccessPolicy {

    private final CompanyMembershipRepository membershipRepository;
    private final CompanyServiceAccessGuard serviceAccessGuard;

    /**
     * ADMIN ve AGENCY_STAFF herhangi bir şirketin verilerini okuyabilir.
     */
    public void requireStaffReadAccess(String role) {
        if (!"ROLE_ADMIN".equals(role) && !"ROLE_AGENCY_STAFF".equals(role)) {
            throw new AccessDeniedException("Bu endpoint icin yeterli yetkiniz yok");
        }
    }

    /**
     * Client kullanıcı için önce üye olduğu şirketi çözer, ardından WEB_DESIGN
     * servisinin aktif olduğunu doğrular. Şirket bulunamazsa Optional.empty() döner.
     */
    public Optional<UUID> resolveClientCompanyWithAccess(UUID userId) {
        Optional<UUID> companyIdOpt = membershipRepository
                .findClientCompanyIdsForUser(userId)
                .stream()
                .findFirst();

        companyIdOpt.ifPresent(companyId ->
                serviceAccessGuard.requireService(userId, companyId, ServiceCategory.WEB_DESIGN));

        return companyIdOpt;
    }
}
