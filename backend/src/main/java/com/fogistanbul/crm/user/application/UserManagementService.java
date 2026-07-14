package com.fogistanbul.crm.user.application;

import com.fogistanbul.crm.entity.CompanyMembership;
import com.fogistanbul.crm.entity.Person;
import com.fogistanbul.crm.entity.UserProfile;
import com.fogistanbul.crm.entity.enums.GlobalRole;
import com.fogistanbul.crm.exception.ApiException;
import com.fogistanbul.crm.repository.CompanyMembershipRepository;
import com.fogistanbul.crm.repository.PersonRepository;
import com.fogistanbul.crm.repository.RefreshTokenRepository;
import com.fogistanbul.crm.repository.UserProfileRepository;
import com.fogistanbul.crm.user.infrastructure.UserAccountCleanupRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
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
    private final PersonRepository personRepository;
    private final PasswordEncoder passwordEncoder;
    private final RefreshTokenRepository refreshTokenRepository;

    @Transactional
    public UserResponse updateUser(UUID userId, UpdateUserRequest req) {
        UserProfile user = requireUser(userId);
        List<CompanyMembership> memberships = membershipRepository.findByUserId(userId);
        Person person = user.getPerson();
        if (person == null) {
            person = new Person();
            person.setEmail(user.getEmail());
            if (!memberships.isEmpty()) {
                person.setCompany(memberships.get(0).getCompany());
            }
        }
        if (req.fullName() != null && !req.fullName().isBlank()) {
            person.setFullName(req.fullName());
        }
        person.setPhone(req.phone());
        person.setPositionTitle(req.position());
        person.setDepartment(req.department());
        person = personRepository.save(person);
        user.setPerson(person);
        userProfileRepository.save(user);
        return toResponse(user, memberships);
    }

    public record UpdateUserRequest(
            String fullName,
            String phone,
            String position,
            String department
    ) {}

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

    @Transactional
    public void resetPassword(UUID actingAdminId, UUID targetUserId,
            String adminPassword, String newPassword) {
        UserProfile actingAdmin = requireUser(actingAdminId);
        if (actingAdmin.getGlobalRole() != GlobalRole.ADMIN) {
            throw passwordResetForbidden();
        }
        if (!passwordEncoder.matches(adminPassword, actingAdmin.getPasswordHash())) {
            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "ADMIN_PASSWORD_INVALID",
                    "Admin şifresi hatalı"
            );
        }
        if (actingAdminId.equals(targetUserId)) {
            throw passwordResetForbidden();
        }

        UserProfile target = requireUser(targetUserId);
        if (target.getGlobalRole() == GlobalRole.ADMIN) {
            throw passwordResetForbidden();
        }

        target.setPasswordHash(passwordEncoder.encode(newPassword));
        userProfileRepository.save(target);
        refreshTokenRepository.revokeAllByUserId(targetUserId);
    }

    private ApiException passwordResetForbidden() {
        return new ApiException(
                HttpStatus.FORBIDDEN,
                "ADMIN_PASSWORD_RESET_FORBIDDEN",
                "Bu kullanıcının şifresi admin panelinden değiştirilemez"
        );
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
