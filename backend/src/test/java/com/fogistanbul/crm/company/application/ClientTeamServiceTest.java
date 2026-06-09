package com.fogistanbul.crm.company.application;

import com.fogistanbul.crm.entity.Company;
import com.fogistanbul.crm.entity.CompanyMembership;
import com.fogistanbul.crm.entity.Person;
import com.fogistanbul.crm.entity.UserProfile;
import com.fogistanbul.crm.entity.enums.MembershipRole;
import com.fogistanbul.crm.repository.CompanyMembershipRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ClientTeamServiceTest {

    @Mock
    private CompanyMembershipRepository membershipRepository;

    @InjectMocks
    private ClientTeamService clientTeamService;

    @Test
    void teamAggregatesAllClientCompaniesAndExcludesCurrentUser() {
        UUID currentUserId = UUID.randomUUID();
        UUID firstCompanyId = UUID.randomUUID();
        UUID secondCompanyId = UUID.randomUUID();
        when(membershipRepository.findClientCompanyIdsForUser(currentUserId))
                .thenReturn(List.of(firstCompanyId, secondCompanyId));
        when(membershipRepository.findByCompanyIdWithDetails(firstCompanyId))
                .thenReturn(List.of(
                        membership(currentUserId, firstCompanyId, "First", MembershipRole.OWNER),
                        membership(UUID.randomUUID(), firstCompanyId, "First", MembershipRole.AGENCY_STAFF)
                ));
        when(membershipRepository.findByCompanyIdWithDetails(secondCompanyId))
                .thenReturn(List.of(
                        membership(UUID.randomUUID(), secondCompanyId, "Second", MembershipRole.EMPLOYEE)
                ));

        var team = clientTeamService.getTeam(currentUserId);

        assertEquals(1, team.agencyStaff().size());
        assertEquals(1, team.employees().size());
        assertEquals("First", team.agencyStaff().get(0).companyName());
        assertEquals("Second", team.employees().get(0).companyName());
    }

    private CompanyMembership membership(
            UUID userId,
            UUID companyId,
            String companyName,
            MembershipRole role
    ) {
        Person person = Person.builder().fullName(role.name()).build();
        UserProfile user = UserProfile.builder()
                .id(userId)
                .email(role.name().toLowerCase() + "@example.com")
                .person(person)
                .build();
        Company company = Company.builder().id(companyId).name(companyName).build();
        return CompanyMembership.builder()
                .user(user)
                .company(company)
                .membershipRole(role)
                .build();
    }
}
