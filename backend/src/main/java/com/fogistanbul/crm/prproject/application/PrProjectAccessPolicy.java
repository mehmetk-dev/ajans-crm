package com.fogistanbul.crm.prproject.application;

import com.fogistanbul.crm.company.application.CompanyAccessPolicy;
import com.fogistanbul.crm.entity.PrProject;
import com.fogistanbul.crm.entity.UserProfile;
import com.fogistanbul.crm.entity.enums.GlobalRole;
import com.fogistanbul.crm.repository.CompanyMembershipRepository;
import com.fogistanbul.crm.repository.PrProjectMemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class PrProjectAccessPolicy {

    private final CompanyAccessPolicy companyAccessPolicy;
    private final CompanyMembershipRepository membershipRepository;
    private final PrProjectMemberRepository memberRepository;

    public void requireCreate(UserProfile user, UUID companyId) {
        if (companyId != null) {
            companyAccessPolicy.requireAccess(user, companyId);
        }
    }

    public void requireRead(PrProject project, UserProfile user) {
        if (isPrivilegedOrParticipant(project, user)) {
            return;
        }
        if (project.getCompany() != null) {
            companyAccessPolicy.requireAccess(user, project.getCompany().getId());
            return;
        }
        throw new AccessDeniedException("Bu PR projesini görüntüleme yetkiniz yok");
    }

    public void requireManage(PrProject project, UserProfile user) {
        if (isPrivilegedOrParticipant(project, user)) {
            return;
        }
        if (project.getCompany() != null) {
            companyAccessPolicy.requireAccess(user, project.getCompany().getId());
            return;
        }
        throw new AccessDeniedException("Bu PR projesini yönetme yetkiniz yok");
    }

    public void requireCompanyParticipant(UserProfile target, UUID companyId) {
        if (companyId == null || target.getGlobalRole() == GlobalRole.ADMIN) {
            return;
        }
        companyAccessPolicy.requireMembership(target.getId(), companyId);
    }

    public List<UUID> accessibleCompanyIds(UserProfile user) {
        return membershipRepository.findCompanyIdsByUserId(user.getId());
    }

    private boolean isPrivilegedOrParticipant(PrProject project, UserProfile user) {
        if (user.getGlobalRole() == GlobalRole.ADMIN) {
            return true;
        }
        UUID userId = user.getId();
        return project.getCreatedBy() != null && userId.equals(project.getCreatedBy().getId())
                || project.getResponsible() != null && userId.equals(project.getResponsible().getId())
                || project.getId() != null && memberRepository.existsByProjectIdAndUserId(project.getId(), userId);
    }
}
