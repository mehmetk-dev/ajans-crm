package com.fogistanbul.crm.maintenance.application;

import com.fogistanbul.crm.entity.UserProfile;
import com.fogistanbul.crm.entity.enums.GlobalRole;
import com.fogistanbul.crm.maintenance.domain.MaintenanceLogEntry;
import com.fogistanbul.crm.repository.CompanyMembershipRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
@RequiredArgsConstructor
public class MaintenanceLogAccessPolicy {

    private final CompanyMembershipRepository membershipRepository;

    public void requireCompanyAccess(UserProfile user, UUID companyId) {
        if (user.getGlobalRole() == GlobalRole.ADMIN) {
            return;
        }
        if (!membershipRepository.existsByUserIdAndCompanyId(user.getId(), companyId)) {
            throw new AccessDeniedException("Bu sirketin bakim gunlugune erisim yetkiniz yok");
        }
    }

    public void requireManageAccess(UserProfile user, UUID companyId) {
        if (user.getGlobalRole() == GlobalRole.COMPANY_USER) {
            throw new AccessDeniedException("Bakim gunlugunu degistirme yetkiniz yok");
        }
        requireCompanyAccess(user, companyId);
    }

    public void requireEntryCompany(MaintenanceLogEntry entry, UUID companyId) {
        if (!entry.getCompany().getId().equals(companyId)) {
            throw new AccessDeniedException("Bakim kaydi bu sirkete ait degil");
        }
    }
}
