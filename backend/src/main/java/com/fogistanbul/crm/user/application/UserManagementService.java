package com.fogistanbul.crm.user.application;

import com.fogistanbul.crm.entity.CompanyMembership;
import com.fogistanbul.crm.entity.UserProfile;
import com.fogistanbul.crm.entity.enums.GlobalRole;
import com.fogistanbul.crm.exception.ApiException;
import com.fogistanbul.crm.repository.CompanyMembershipRepository;
import com.fogistanbul.crm.repository.UserProfileRepository;
import com.fogistanbul.crm.user.infrastructure.UserAccountCleanupRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserManagementService {

    private final UserProfileRepository userProfileRepository;
    private final CompanyMembershipRepository membershipRepository;
    private final UserAccountCleanupRepository cleanupRepository;

    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers() {
        List<UserProfile> users = userProfileRepository.findAll();
        List<UUID> userIds = users.stream().map(UserProfile::getId).toList();
        Map<UUID, List<CompanyMembership>> membershipMap = userIds.isEmpty()
                ? Map.of()
                : membershipRepository.findByUserIdIn(userIds).stream()
                        .collect(Collectors.groupingBy(membership -> membership.getUser().getId()));

        return users.stream()
                .map(user -> toResponse(user, membershipMap.getOrDefault(user.getId(), List.of())))
                .toList();
    }

    @Transactional
    public void updateRole(UUID userId, String globalRole) {
        UserProfile user = requireUser(userId);
        GlobalRole newRole;
        try {
            newRole = GlobalRole.valueOf(globalRole);
        } catch (IllegalArgumentException | NullPointerException ex) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_GLOBAL_ROLE", "Geçersiz rol");
        }
        user.setGlobalRole(newRole);
        userProfileRepository.save(user);
    }

    @Transactional
    public void deleteUser(UUID userId) {
        UserProfile user = requireUser(userId);
        if (user.getGlobalRole() == GlobalRole.ADMIN) {
            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "ADMIN_DELETE_FORBIDDEN",
                    "Admin kullanıcıları silinemez"
            );
        }

        cleanupRepository.deleteReferences(user);
        userProfileRepository.delete(user);
    }

    private UserProfile requireUser(UUID userId) {
        return userProfileRepository.findById(userId)
                .orElseThrow(() -> new ApiException(
                        HttpStatus.NOT_FOUND,
                        "USER_NOT_FOUND",
                        "Kullanıcı bulunamadı"
                ));
    }

    private UserResponse toResponse(UserProfile user, List<CompanyMembership> memberships) {
        List<UserCompanyInfo> companies = memberships.stream()
                .map(membership -> new UserCompanyInfo(
                        membership.getCompany().getId().toString(),
                        membership.getCompany().getName(),
                        membership.getMembershipRole().name()
                ))
                .toList();
        String membershipRole = memberships.isEmpty()
                ? null
                : memberships.get(0).getMembershipRole().name();

        return new UserResponse(
                user.getId().toString(),
                user.getPerson() != null ? user.getPerson().getFullName() : user.getEmail(),
                user.getEmail(),
                user.getGlobalRole().name(),
                membershipRole,
                user.getPerson() != null ? user.getPerson().getAvatarUrl() : null,
                user.getPerson() != null ? user.getPerson().getPhone() : null,
                user.getPerson() != null ? user.getPerson().getPositionTitle() : null,
                user.getPerson() != null ? user.getPerson().getDepartment() : null,
                companies,
                user.getCreatedAt()
        );
    }

    public record UserResponse(
            String id,
            String fullName,
            String email,
            String globalRole,
            String membershipRole,
            String avatarUrl,
            String phone,
            String position,
            String department,
            List<UserCompanyInfo> companies,
            Instant createdAt
    ) {
    }

    public record UserCompanyInfo(
            String companyId,
            String companyName,
            String membershipRole
    ) {
    }
}
