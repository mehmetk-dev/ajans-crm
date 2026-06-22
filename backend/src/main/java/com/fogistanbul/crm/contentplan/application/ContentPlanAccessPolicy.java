package com.fogistanbul.crm.contentplan.application;

import com.fogistanbul.crm.company.application.CompanyAccessPolicy;
import com.fogistanbul.crm.company.application.CompanyServiceAccessGuard;
import com.fogistanbul.crm.entity.ContentPlan;
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
public class ContentPlanAccessPolicy {

    private final CompanyAccessPolicy companyAccessPolicy;
    private final CompanyServiceAccessGuard serviceAccessGuard;
    private final CompanyMembershipRepository membershipRepository;

    public void requireRead(ContentPlan plan, UserProfile user) {
        companyAccessPolicy.requireAccess(user, plan.getCompany().getId());
    }

    public void requireManage(ContentPlan plan, UserProfile user) {
        requireRead(plan, user);
        if (user.getGlobalRole() == GlobalRole.ADMIN
                || user.getGlobalRole() == GlobalRole.AGENCY_STAFF) {
            return;
        }
        throw new AccessDeniedException("Bu içerik planını yönetme yetkiniz yok");
    }

    public void requireCompanyAccess(UserProfile user, UUID companyId) {
        companyAccessPolicy.requireAccess(user, companyId);
    }

    public void requireClientService(UUID userId, UUID companyId) {
        serviceAccessGuard.requireService(userId, companyId, ServiceCategory.CONTENT_MARKETING);
    }

    public List<UUID> accessibleCompanyIds(UserProfile user) {
        return membershipRepository.findCompanyIdsByUserId(user.getId());
    }
}
