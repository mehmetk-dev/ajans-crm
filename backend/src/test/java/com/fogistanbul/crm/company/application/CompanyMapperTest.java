package com.fogistanbul.crm.company.application;

import com.fogistanbul.crm.company.dto.CompanyResponse;
import com.fogistanbul.crm.entity.Company;
import com.fogistanbul.crm.entity.CompanyMembership;
import com.fogistanbul.crm.entity.Person;
import com.fogistanbul.crm.entity.UserProfile;
import com.fogistanbul.crm.entity.enums.CompanyKind;
import com.fogistanbul.crm.entity.enums.ContractStatus;
import com.fogistanbul.crm.entity.enums.GlobalRole;
import com.fogistanbul.crm.entity.enums.MembershipRole;
import com.fogistanbul.crm.repository.CompanyMembershipRepository;
import com.fogistanbul.crm.repository.TaskRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CompanyMapperTest {

    @Mock
    private CompanyMembershipRepository membershipRepository;

    @Mock
    private TaskRepository taskRepository;

    private CompanyMapper mapper;

    @BeforeEach
    void setUp() {
        mapper = new CompanyMapper(membershipRepository, taskRepository);
    }

    @Test
    void toResponse_mapsBasicFieldsAndCounts() {
        UUID companyId = UUID.randomUUID();
        Company company = baseCompany(companyId, CompanyKind.CLIENT, ContractStatus.ACTIVE);
        when(membershipRepository.findByCompanyId(companyId)).thenReturn(List.of(
                membership(company, MembershipRole.OWNER, "owner@test.com", "Owner User"),
                membership(company, MembershipRole.EMPLOYEE, "emp@test.com", "Employee User"),
                membership(company, MembershipRole.AGENCY_STAFF, "staff@test.com", "Staff User")));
        when(taskRepository.countByCompanyId(companyId)).thenReturn(7L);

        CompanyResponse result = mapper.toResponse(company);

        assertThat(result.getId()).isEqualTo(companyId.toString());
        assertThat(result.getKind()).isEqualTo("CLIENT");
        assertThat(result.getContractStatus()).isEqualTo("ACTIVE");
        assertThat(result.getMemberCount()).isEqualTo(3);
        assertThat(result.getEmployeeCount()).isEqualTo(2);
        assertThat(result.getStaffCount()).isEqualTo(1);
        assertThat(result.getTaskCount()).isEqualTo(7);
    }

    @Test
    void toResponse_nullContractStatus_isMappedAsNull() {
        UUID companyId = UUID.randomUUID();
        Company company = baseCompany(companyId, CompanyKind.AGENCY, null);
        when(membershipRepository.findByCompanyId(companyId)).thenReturn(List.of());
        when(taskRepository.countByCompanyId(companyId)).thenReturn(0L);

        CompanyResponse result = mapper.toResponse(company);

        assertThat(result.getContractStatus()).isNull();
        assertThat(result.getKind()).isEqualTo("AGENCY");
    }

    @Test
    void toResponse_zeroMemberships_yieldsZeroCounts() {
        UUID companyId = UUID.randomUUID();
        Company company = baseCompany(companyId, CompanyKind.CLIENT, ContractStatus.PENDING);
        when(membershipRepository.findByCompanyId(companyId)).thenReturn(List.of());
        when(taskRepository.countByCompanyId(companyId)).thenReturn(0L);

        CompanyResponse result = mapper.toResponse(company);

        assertThat(result.getMemberCount()).isZero();
        assertThat(result.getEmployeeCount()).isZero();
        assertThat(result.getStaffCount()).isZero();
        assertThat(result.getTaskCount()).isZero();
    }

    @Test
    void toDetailedResponse_includesMembersListAndSocialFields() {
        UUID companyId = UUID.randomUUID();
        Company company = detailedCompany(companyId);
        when(membershipRepository.findByCompanyId(companyId)).thenReturn(List.of(
                membership(company, MembershipRole.OWNER, "owner@test.com", "Owner User")));
        when(taskRepository.countByCompanyId(companyId)).thenReturn(2L);

        CompanyResponse result = mapper.toDetailedResponse(company);

        assertThat(result.getMembers()).hasSize(1);
        CompanyResponse.MembershipInfo info = result.getMembers().get(0);
        assertThat(info.getFullName()).isEqualTo("Owner User");
        assertThat(info.getEmail()).isEqualTo("owner@test.com");
        assertThat(info.getMembershipRole()).isEqualTo("OWNER");
        assertThat(info.getGlobalRole()).isEqualTo("COMPANY_USER");
        assertThat(result.getSocialInstagram()).isEqualTo("instagram.com/co");
        assertThat(result.getHostingProvider()).isEqualTo("Hetzner");
        assertThat(result.getCmsType()).isEqualTo("WordPress");
    }

    @Test
    void toDetailedResponse_fallsBackToEmailWhenPersonIsNull() {
        UUID companyId = UUID.randomUUID();
        Company company = detailedCompany(companyId);
        UserProfile user = UserProfile.builder()
                .id(UUID.randomUUID())
                .email("only@email.com")
                .passwordHash("hash")
                .globalRole(GlobalRole.COMPANY_USER)
                .person(null)
                .build();
        CompanyMembership m = CompanyMembership.builder()
                .id(UUID.randomUUID())
                .user(user)
                .company(company)
                .membershipRole(MembershipRole.EMPLOYEE)
                .build();
        when(membershipRepository.findByCompanyId(companyId)).thenReturn(List.of(m));
        when(taskRepository.countByCompanyId(companyId)).thenReturn(0L);

        CompanyResponse result = mapper.toDetailedResponse(company);

        assertThat(result.getMembers()).hasSize(1);
        assertThat(result.getMembers().get(0).getFullName()).isEqualTo("only@email.com");
        assertThat(result.getMembers().get(0).getAvatarUrl()).isNull();
    }

    @Test
    void toDetailedResponse_countsStaffAndEmployeeSeparately() {
        UUID companyId = UUID.randomUUID();
        Company company = detailedCompany(companyId);
        when(membershipRepository.findByCompanyId(companyId)).thenReturn(List.of(
                membership(company, MembershipRole.OWNER, "o@e.com", "Owner"),
                membership(company, MembershipRole.EMPLOYEE, "e1@e.com", "Emp1"),
                membership(company, MembershipRole.EMPLOYEE, "e2@e.com", "Emp2"),
                membership(company, MembershipRole.AGENCY_STAFF, "s@e.com", "Staff")));
        when(taskRepository.countByCompanyId(companyId)).thenReturn(5L);

        CompanyResponse result = mapper.toDetailedResponse(company);

        assertThat(result.getMemberCount()).isEqualTo(4);
        assertThat(result.getEmployeeCount()).isEqualTo(3);
        assertThat(result.getStaffCount()).isEqualTo(1);
    }

    private Company baseCompany(UUID id, CompanyKind kind, ContractStatus status) {
        return Company.builder()
                .id(id)
                .kind(kind)
                .name("Test Co")
                .industry("Tech")
                .email("test@co.com")
                .phone("+90 555 555 5555")
                .contractStatus(status)
                .logoUrl("https://logo.png")
                .createdAt(Instant.now())
                .build();
    }

    private Company detailedCompany(UUID id) {
        return Company.builder()
                .id(id)
                .kind(CompanyKind.CLIENT)
                .name("Detailed Co")
                .industry("Marketing")
                .taxId("1234567890")
                .foundedYear(2020)
                .email("info@co.com")
                .phone("+90 555 111 11 11")
                .address("Istanbul")
                .website("co.com")
                .socialInstagram("instagram.com/co")
                .socialFacebook("facebook.com/co")
                .socialTwitter("twitter.com/co")
                .socialLinkedin("linkedin.com/co")
                .socialYoutube("youtube.com/co")
                .socialTiktok("tiktok.com/co")
                .hostingProvider("Hetzner")
                .cmsType("WordPress")
                .cmsVersion("6.4")
                .themeName("Flavor")
                .contractStatus(ContractStatus.ACTIVE)
                .createdAt(Instant.now())
                .build();
    }

    private CompanyMembership membership(Company company, MembershipRole role, String email, String fullName) {
        Person person = Person.builder()
                .id(UUID.randomUUID())
                .fullName(fullName)
                .email(email)
                .avatarUrl("https://avatar.png")
                .build();
        UserProfile user = UserProfile.builder()
                .id(UUID.randomUUID())
                .email(email)
                .passwordHash("hash")
                .globalRole(GlobalRole.COMPANY_USER)
                .person(person)
                .build();
        return CompanyMembership.builder()
                .id(UUID.randomUUID())
                .user(user)
                .company(company)
                .membershipRole(role)
                .build();
    }
}
