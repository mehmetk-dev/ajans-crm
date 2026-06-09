package com.fogistanbul.crm.company.application;

import com.fogistanbul.crm.entity.UserProfile;
import com.fogistanbul.crm.entity.enums.GlobalRole;
import com.fogistanbul.crm.repository.CompanyMembershipRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class CompanyAccessPolicy {

    private final CompanyMembershipRepository membershipRepository;

    public void requireAccess(UserProfile user, UUID companyId) {
        if (user.getGlobalRole() == GlobalRole.ADMIN) {
            return;
        }
        requireMembership(user.getId(), companyId);
    }

    public void requireMembership(UUID userId, UUID companyId) {
        if (!membershipRepository.existsByUserIdAndCompanyId(userId, companyId)) {
            throw new AccessDeniedException("Bu sirket verilerine erisim yetkiniz yok");
        }
    }

    public List<UUID> accessibleClientCompanyIds(UserProfile user) {
        return membershipRepository.findClientCompanyIdsForUser(user.getId());
    }
}
