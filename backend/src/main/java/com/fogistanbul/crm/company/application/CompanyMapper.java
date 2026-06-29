package com.fogistanbul.crm.company.application;

import com.fogistanbul.crm.company.dto.CompanyResponse;
import com.fogistanbul.crm.entity.Company;
import com.fogistanbul.crm.entity.CompanyMembership;
import com.fogistanbul.crm.entity.Person;
import com.fogistanbul.crm.repository.CompanyMembershipRepository;
import com.fogistanbul.crm.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class CompanyMapper {

    private final CompanyMembershipRepository membershipRepository;
    private final TaskRepository taskRepository;

    public CompanyResponse toResponse(Company company) {
        List<CompanyMembership> memberships = membershipRepository.findByCompanyId(company.getId());
        long taskCount = taskRepository.countByCompanyId(company.getId());
        int employeeCount = (int) memberships.stream()
                .filter(m -> m.getMembershipRole().name().equals("OWNER") || m.getMembershipRole().name().equals("EMPLOYEE"))
                .count();
        int staffCount = (int) memberships.stream()
                .filter(m -> m.getMembershipRole().name().equals("AGENCY_STAFF"))
                .count();

        return CompanyResponse.builder()
                .id(company.getId().toString())
                .kind(company.getKind().name())
                .name(company.getName())
                .industry(company.getIndustry())
                .email(company.getEmail())
                .phone(company.getPhone())
                .contractStatus(company.getContractStatus() != null ? company.getContractStatus().name() : null)
                .logoUrl(company.getLogoUrl())
                .createdAt(company.getCreatedAt())
                .memberCount(memberships.size())
                .employeeCount(employeeCount)
                .staffCount(staffCount)
                .taskCount((int) taskCount)
                .build();
    }

    public CompanyResponse toDetailedResponse(Company company) {
        List<CompanyMembership> memberships = membershipRepository.findByCompanyId(company.getId());
        long taskCount = taskRepository.countByCompanyId(company.getId());

        List<CompanyResponse.MembershipInfo> memberInfos = memberships.stream().map(m -> {
            Person p = m.getUser().getPerson();
            return CompanyResponse.MembershipInfo.builder()
                    .id(m.getId().toString())
                    .userId(m.getUser().getId().toString())
                    .fullName(p != null ? p.getFullName() : m.getUser().getEmail())
                    .email(m.getUser().getEmail())
                    .phone(p != null ? p.getPhone() : null)
                    .position(p != null ? p.getPositionTitle() : null)
                    .department(p != null ? p.getDepartment() : null)
                    .membershipRole(m.getMembershipRole().name())
                    .globalRole(m.getUser().getGlobalRole().name())
                    .avatarUrl(p != null ? p.getAvatarUrl() : null)
                    .build();
        }).collect(Collectors.toList());

        return CompanyResponse.builder()
                .id(company.getId().toString())
                .kind(company.getKind().name())
                .name(company.getName())
                .industry(company.getIndustry())
                .taxId(company.getTaxId())
                .foundedYear(company.getFoundedYear())
                .email(company.getEmail())
                .phone(company.getPhone())
                .address(company.getAddress())
                .website(company.getWebsite())
                .logoUrl(company.getLogoUrl())
                .contractStatus(company.getContractStatus() != null ? company.getContractStatus().name() : null)
                .notes(company.getNotes())
                .vision(company.getVision())
                .mission(company.getMission())
                .socialInstagram(company.getSocialInstagram())
                .socialFacebook(company.getSocialFacebook())
                .socialTwitter(company.getSocialTwitter())
                .socialLinkedin(company.getSocialLinkedin())
                .socialYoutube(company.getSocialYoutube())
                .socialTiktok(company.getSocialTiktok())
                .hostingProvider(company.getHostingProvider())
                .domainExpiry(company.getDomainExpiry())
                .sslExpiry(company.getSslExpiry())
                .cmsType(company.getCmsType())
                .cmsVersion(company.getCmsVersion())
                .themeName(company.getThemeName())
                .createdAt(company.getCreatedAt())
                .memberCount(memberInfos.size())
                .employeeCount((int) memberships.stream()
                        .filter(m -> m.getMembershipRole().name().equals("OWNER") || m.getMembershipRole().name().equals("EMPLOYEE"))
                        .count())
                .staffCount((int) memberships.stream()
                        .filter(m -> m.getMembershipRole().name().equals("AGENCY_STAFF"))
                        .count())
                .taskCount((int) taskCount)
                .members(memberInfos)
                .build();
    }
}