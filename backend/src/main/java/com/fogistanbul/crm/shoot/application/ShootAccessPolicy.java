package com.fogistanbul.crm.shoot.application;

import com.fogistanbul.crm.company.application.CompanyAccessPolicy;
import com.fogistanbul.crm.company.application.CompanyServiceAccessGuard;
import com.fogistanbul.crm.entity.Shoot;
import com.fogistanbul.crm.entity.UserProfile;
import com.fogistanbul.crm.entity.enums.GlobalRole;
import com.fogistanbul.crm.entity.enums.ServiceCategory;
import com.fogistanbul.crm.repository.CompanyMembershipRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class ShootAccessPolicy {

    private final CompanyAccessPolicy companyAccessPolicy;
    private final CompanyServiceAccessGuard serviceAccessGuard;
    private final CompanyMembershipRepository membershipRepository;

    public void requireRead(Shoot shoot, UserProfile user) {
        companyAccessPolicy.requireAccess(user, shoot.getCompany().getId());
    }

    public void requireManage(Shoot shoot, UserProfile user) {
        requireRead(shoot, user);
        if (user.getGlobalRole() == GlobalRole.ADMIN
                || user.getGlobalRole() == GlobalRole.AGENCY_STAFF
                || shoot.getCreatedBy().getId().equals(user.getId())) {
            return;
        }
        throw new AccessDeniedException("Bu çekimi güncelleme yetkiniz yok");
    }

    public void requireDelete(Shoot shoot, UserProfile user) {
        requireRead(shoot, user);
        if (user.getGlobalRole() == GlobalRole.ADMIN
                || shoot.getCreatedBy().getId().equals(user.getId())) {
            return;
        }
        throw new AccessDeniedException("Bu çekimi silme yetkiniz yok");
    }

    public void requireCompanyAccess(UserProfile user, UUID companyId) {
        companyAccessPolicy.requireAccess(user, companyId);
    }

    public void requireResourceAccess(UserProfile user, UUID companyId) {
        companyAccessPolicy.requireAccess(user, companyId);
    }

    public List<UUID> accessibleCompanyIds(UserProfile user) {
        return membershipRepository.findCompanyIdsByUserId(user.getId());
    }

    public List<UUID> accessibleClientCompanyIds(UUID userId) {
        return serviceAccessGuard.accessibleClientCompanies(userId, ServiceCategory.PRODUCTION);
    }
}
