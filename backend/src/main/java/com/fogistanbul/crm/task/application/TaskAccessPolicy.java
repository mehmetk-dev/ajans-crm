package com.fogistanbul.crm.task.application;

import com.fogistanbul.crm.company.application.CompanyAccessPolicy;
import com.fogistanbul.crm.entity.Task;
import com.fogistanbul.crm.entity.UserProfile;
import com.fogistanbul.crm.entity.enums.GlobalRole;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Component;

import java.util.UUID;
import java.util.List;

@Component
@RequiredArgsConstructor
public class TaskAccessPolicy {

    private final CompanyAccessPolicy companyAccessPolicy;

    public void requireRead(Task task, UserProfile user) {
        if (user.getGlobalRole() == GlobalRole.ADMIN || isParticipant(task, user.getId())) {
            return;
        }
        if (task.getCompany() != null) {
            companyAccessPolicy.requireAccess(user, task.getCompany().getId());
            return;
        }
        throw new AccessDeniedException("Bu görevi görüntüleme yetkiniz yok");
    }

    public void requireUpdate(Task task, UserProfile user) {
        requireRead(task, user);
    }

    public void requireDelete(Task task, UserProfile user) {
        if (user.getGlobalRole() == GlobalRole.ADMIN
                || task.getCreatedBy().getId().equals(user.getId())) {
            return;
        }
        throw new AccessDeniedException("Bu görevi silme yetkiniz yok");
    }

    public void requireCompanyAccess(UserProfile user, UUID companyId) {
        companyAccessPolicy.requireAccess(user, companyId);
    }

    public List<UUID> accessibleCompanyIds(UserProfile user) {
        return companyAccessPolicy.accessibleClientCompanyIds(user);
    }

    public void requireAssignable(UserProfile creator, UserProfile assignee, UUID companyId) {
        if (companyId != null) {
            companyAccessPolicy.requireAccess(creator, companyId);
        }
        if (creator.getGlobalRole() != GlobalRole.COMPANY_USER) {
            return;
        }
        if (assignee.getId().equals(creator.getId())) {
            return;
        }
        if (assignee.getGlobalRole() != GlobalRole.AGENCY_STAFF || companyId == null) {
            throw new AccessDeniedException("Sadece bağlı ajans çalışanlarına görev atayabilirsiniz");
        }
        companyAccessPolicy.requireMembership(assignee.getId(), companyId);
    }

    private boolean isParticipant(Task task, UUID userId) {
        return task.getAssignedTo() != null && task.getAssignedTo().getId().equals(userId)
                || task.getCreatedBy() != null && task.getCreatedBy().getId().equals(userId);
    }
}
