package com.fogistanbul.crm.company.application;

import com.fogistanbul.crm.company.dto.TeamResponse;
import com.fogistanbul.crm.company.dto.TeamResponse.TeamMemberResponse;
import com.fogistanbul.crm.entity.CompanyMembership;
import com.fogistanbul.crm.entity.enums.MembershipRole;
import com.fogistanbul.crm.repository.CompanyMembershipRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ClientTeamService {

    private final CompanyMembershipRepository membershipRepository;

    @Transactional(readOnly = true)
    public TeamResponse getTeam(UUID userId) {
        List<UUID> companyIds = membershipRepository.findClientCompanyIdsForUser(userId);
        if (companyIds.isEmpty()) {
            return new TeamResponse(List.of(), List.of());
        }

        List<CompanyMembership> memberships = companyIds.stream()
                .flatMap(companyId -> membershipRepository.findByCompanyIdWithDetails(companyId).stream())
                .toList();

        List<TeamMemberResponse> agencyStaff = memberships.stream()
                .filter(membership -> membership.getMembershipRole() == MembershipRole.AGENCY_STAFF)
                .map(this::toResponse)
                .toList();

        List<TeamMemberResponse> employees = memberships.stream()
                .filter(membership -> membership.getMembershipRole() == MembershipRole.OWNER
                        || membership.getMembershipRole() == MembershipRole.EMPLOYEE)
                .filter(membership -> !membership.getUser().getId().equals(userId))
                .map(this::toResponse)
                .toList();

        return new TeamResponse(agencyStaff, employees);
    }

    private TeamMemberResponse toResponse(CompanyMembership membership) {
        var person = membership.getUser().getPerson();
        return new TeamMemberResponse(
                membership.getUser().getId().toString(),
                person != null ? person.getFullName() : membership.getUser().getEmail(),
                membership.getUser().getEmail(),
                person != null ? person.getAvatarUrl() : null,
                person != null ? person.getPhone() : null,
                person != null ? person.getPositionTitle() : null,
                person != null ? person.getDepartment() : null,
                membership.getMembershipRole().name(),
                membership.getCompany().getName()
        );
    }
}
