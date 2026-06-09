package com.fogistanbul.crm.task.application;

import com.fogistanbul.crm.dto.ContactResponse;
import com.fogistanbul.crm.entity.UserProfile;
import com.fogistanbul.crm.entity.enums.GlobalRole;
import com.fogistanbul.crm.repository.CompanyMembershipRepository;
import com.fogistanbul.crm.repository.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaskAssignableUserService {

    private final UserProfileRepository userProfileRepository;
    private final CompanyMembershipRepository membershipRepository;

    @Transactional(readOnly = true)
    public List<ContactResponse> getAssignableUsers(UUID userId, UUID companyId) {
        UserProfile user = userProfileRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Kullanici bulunamadi"));
        List<UserProfile> users = candidates(user);

        if (companyId != null) {
            var companyMemberIds = membershipRepository.findByCompanyId(companyId)
                    .stream()
                    .map(membership -> membership.getUser().getId())
                    .collect(Collectors.toSet());
            users = users.stream()
                    .filter(candidate -> companyMemberIds.contains(candidate.getId())
                            || candidate.getGlobalRole() == GlobalRole.ADMIN
                            || candidate.getGlobalRole() == GlobalRole.AGENCY_STAFF)
                    .toList();
        }

        return users.stream().map(this::toResponse).toList();
    }

    private List<UserProfile> candidates(UserProfile user) {
        if (user.getGlobalRole() == GlobalRole.ADMIN) {
            return userProfileRepository.findAll();
        }
        var companyIds = membershipRepository.findCompanyIdsByUserId(user.getId());
        if (user.getGlobalRole() == GlobalRole.COMPANY_USER) {
            return userProfileRepository.findAllById(
                    membershipRepository.findAgencyStaffUserIdsByCompanyIds(companyIds)
            );
        }

        var memberIds = membershipRepository.findDistinctUserIdsByCompanyIds(companyIds);
        List<UserProfile> users = new java.util.ArrayList<>(userProfileRepository.findAllById(memberIds));
        userProfileRepository.findByGlobalRole(GlobalRole.AGENCY_STAFF).stream()
                .filter(staff -> users.stream().noneMatch(existing -> existing.getId().equals(staff.getId())))
                .forEach(users::add);
        return users;
    }

    private ContactResponse toResponse(UserProfile user) {
        return ContactResponse.builder()
                .id(user.getId().toString())
                .fullName(user.getPerson() != null ? user.getPerson().getFullName() : user.getEmail())
                .email(user.getEmail())
                .globalRole(user.getGlobalRole().name())
                .avatarUrl(user.getPerson() != null ? user.getPerson().getAvatarUrl() : null)
                .build();
    }
}
