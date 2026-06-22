package com.fogistanbul.crm.maintenance.application;

import com.fogistanbul.crm.company.application.CompanyAccessPolicy;
import com.fogistanbul.crm.entity.UserProfile;
import com.fogistanbul.crm.entity.enums.GlobalRole;
import com.fogistanbul.crm.maintenance.domain.MaintenanceLogEntry;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
@RequiredArgsConstructor
public class MaintenanceLogAccessPolicy {

    private final CompanyAccessPolicy companyAccessPolicy;

    public void requireCompanyAccess(UserProfile user, UUID companyId) {
        companyAccessPolicy.requireAccess(user, companyId);
    }

    public void requireManageAccess(UserProfile user, UUID companyId) {
        if (user.getGlobalRole() == GlobalRole.COMPANY_USER) {
            throw new AccessDeniedException("Bakım günlüğünü değiştirme yetkiniz yok");
        }
        requireCompanyAccess(user, companyId);
    }

    public void requireEntryCompany(MaintenanceLogEntry entry, UUID companyId) {
        if (!entry.getCompany().getId().equals(companyId)) {
            throw new AccessDeniedException("Bakım kaydı bu şirkete ait değil");
        }
    }
}
