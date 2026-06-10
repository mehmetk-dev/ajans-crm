package com.fogistanbul.crm.company.application;

import com.fogistanbul.crm.company.dto.AddEmployeeRequest;
import com.fogistanbul.crm.company.dto.CompanyInfrastructureRequest;
import com.fogistanbul.crm.company.dto.CompanyResponse;
import com.fogistanbul.crm.company.dto.CreateCompanyRequest;
import com.fogistanbul.crm.company.dto.UpdateCompanyRequest;
import com.fogistanbul.crm.company.infrastructure.CompanyDataCleanup;
import com.fogistanbul.crm.entity.Company;
import com.fogistanbul.crm.entity.CompanyMembership;
import com.fogistanbul.crm.entity.Person;
import com.fogistanbul.crm.entity.UserProfile;
import com.fogistanbul.crm.entity.enums.CompanyKind;
import com.fogistanbul.crm.entity.enums.ContractStatus;
import com.fogistanbul.crm.entity.enums.GlobalRole;
import com.fogistanbul.crm.entity.enums.MembershipRole;
import com.fogistanbul.crm.repository.CompanyMembershipRepository;
import com.fogistanbul.crm.repository.CompanyRepository;
import com.fogistanbul.crm.repository.PersonRepository;
import com.fogistanbul.crm.repository.TaskRepository;
import com.fogistanbul.crm.repository.UserProfileRepository;
import com.fogistanbul.crm.service.CompanyServicesManager;
import com.fogistanbul.crm.messaging.application.GroupMessagingService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CompanyService {

    private final CompanyRepository companyRepository;
    private final PersonRepository personRepository;
    private final UserProfileRepository userProfileRepository;
    private final CompanyMembershipRepository membershipRepository;
    private final TaskRepository taskRepository;
    private final PasswordEncoder passwordEncoder;
    private final PermissionService permissionService;
    private final GroupMessagingService groupMessagingService;
    private final CompanyDataCleanup dataCleanup;
    private final CompanyServicesManager companyServicesManager;
    private final CompanyAccessPolicy companyAccessPolicy;


    @Transactional
    public CompanyResponse createCompanyWithOwner(CreateCompanyRequest req) {
        if (userProfileRepository.existsByEmail(req.getOwnerEmail())) {
            throw new RuntimeException("Bu email ile kayitli bir kullanici zaten var: " + req.getOwnerEmail());
        }

        Company company = new Company();
        company.setKind(CompanyKind.CLIENT);
        company.setName(req.getName());
        company.setIndustry(req.getIndustry());
        company.setTaxId(req.getTaxId());
        company.setFoundedYear(req.getFoundedYear());
        company.setVision(req.getVision());
        company.setMission(req.getMission());
        company.setEmployeeCount(req.getEmployeeCount());
        company.setEmail(req.getEmail());
        company.setPhone(req.getPhone());
        company.setAddress(req.getAddress());
        company.setWebsite(req.getWebsite());
        company.setSocialInstagram(req.getSocialInstagram());
        company.setSocialFacebook(req.getSocialFacebook());
        company.setSocialTwitter(req.getSocialTwitter());
        company.setSocialLinkedin(req.getSocialLinkedin());
        company.setSocialYoutube(req.getSocialYoutube());
        company.setSocialTiktok(req.getSocialTiktok());
        company.setNotes(req.getNotes());
        company.setContractStatus(ContractStatus.ACTIVE);
        company = companyRepository.save(company);

        Person person = new Person();
        person.setCompany(company);
        person.setFullName(req.getOwnerFullName());
        person.setEmail(req.getOwnerEmail());
        person.setPhone(req.getOwnerPhone());
        person.setPositionTitle(req.getOwnerPosition());
        person = personRepository.save(person);

        UserProfile userProfile = new UserProfile();
        userProfile.setPerson(person);
        userProfile.setGlobalRole(GlobalRole.COMPANY_USER);
        userProfile.setEmail(req.getOwnerEmail());
        userProfile.setPasswordHash(passwordEncoder.encode(req.getOwnerPassword()));
        userProfile = userProfileRepository.save(userProfile);

        CompanyMembership membership = new CompanyMembership();
        membership.setUser(userProfile);
        membership.setCompany(company);
        membership.setMembershipRole(MembershipRole.OWNER);
        membershipRepository.save(membership);

        permissionService.setDefaultPermissions(userProfile.getId(), company.getId(), "OWNER");

        // Auto-create company group chat and add owner
        groupMessagingService.createCompanyGroup(company, userProfile);

        // Initialize service categories (selected or all false)
        companyServicesManager.initializeServicesForCompany(company.getId(), req.getSelectedServices());

        return toResponse(company);
    }

    @Transactional(readOnly = true)
    public List<CompanyResponse> getAllClients() {
        return companyRepository.findByKind(CompanyKind.CLIENT).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CompanyResponse> getAllClientsForUser(UUID userId) {
        UserProfile user = getUser(userId);
        if (user.getGlobalRole() == GlobalRole.ADMIN) {
            return getAllClients();
        }

        List<UUID> companyIds = companyAccessPolicy.accessibleClientCompanyIds(user);
        if (companyIds.isEmpty()) {
            return List.of();
        }

        return companyRepository.findByIdInAndKind(companyIds, CompanyKind.CLIENT).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CompanyResponse getById(UUID id) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sirket bulunamadi"));
        return toDetailedResponse(company);
    }

    @Transactional(readOnly = true)
    public CompanyResponse getByIdForUser(UUID id, UUID userId) {
        companyAccessPolicy.requireAccess(getUser(userId), id);
        return getById(id);
    }

    @Transactional
    public CompanyResponse update(UUID id, UpdateCompanyRequest req) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sirket bulunamadi"));

        company.setName(req.getName());
        company.setIndustry(req.getIndustry());
        company.setTaxId(req.getTaxId());
        company.setFoundedYear(req.getFoundedYear());
        company.setVision(req.getVision());
        company.setMission(req.getMission());
        company.setEmployeeCount(req.getEmployeeCount());
        company.setEmail(req.getEmail());
        company.setPhone(req.getPhone());
        company.setAddress(req.getAddress());
        company.setWebsite(req.getWebsite());
        company.setSocialInstagram(req.getSocialInstagram());
        company.setSocialFacebook(req.getSocialFacebook());
        company.setSocialTwitter(req.getSocialTwitter());
        company.setSocialLinkedin(req.getSocialLinkedin());
        company.setSocialYoutube(req.getSocialYoutube());
        company.setSocialTiktok(req.getSocialTiktok());
        company.setNotes(req.getNotes());
        company.setHostingProvider(req.getHostingProvider());
        company.setDomainExpiry(req.getDomainExpiry());
        company.setSslExpiry(req.getSslExpiry());
        company.setCmsType(req.getCmsType());
        company.setCmsVersion(req.getCmsVersion());
        company.setThemeName(req.getThemeName());
        company = companyRepository.save(company);

        return toResponse(company);
    }

    @Transactional
    public CompanyResponse updateInfrastructure(UUID id, CompanyInfrastructureRequest req) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sirket bulunamadi"));
        company.setHostingProvider(req.getHostingProvider());
        company.setDomainExpiry(req.getDomainExpiry());
        company.setSslExpiry(req.getSslExpiry());
        company.setCmsType(req.getCmsType());
        company.setCmsVersion(req.getCmsVersion());
        company.setThemeName(req.getThemeName());
        company = companyRepository.save(company);
        return toDetailedResponse(company);
    }

    @Transactional
    public void addEmployeeToCompany(UUID companyId, AddEmployeeRequest req) {
        if (userProfileRepository.existsByEmail(req.getEmail())) {
            throw new RuntimeException("Bu email ile kayitli bir kullanici zaten var: " + req.getEmail());
        }

        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new RuntimeException("Sirket bulunamadi"));

        Person person = new Person();
        person.setCompany(company);
        person.setFullName(req.getFullName());
        person.setEmail(req.getEmail());
        person.setPhone(req.getPhone());
        person.setPositionTitle(req.getPosition());
        person.setDepartment(req.getDepartment());
        person = personRepository.save(person);

        UserProfile userProfile = new UserProfile();
        userProfile.setPerson(person);
        userProfile.setGlobalRole(GlobalRole.COMPANY_USER);
        userProfile.setEmail(req.getEmail());
        userProfile.setPasswordHash(passwordEncoder.encode(req.getPassword()));
        userProfile = userProfileRepository.save(userProfile);

        CompanyMembership membership = new CompanyMembership();
        membership.setUser(userProfile);
        membership.setCompany(company);
        membership.setMembershipRole(MembershipRole.EMPLOYEE);
        membershipRepository.save(membership);

        permissionService.setDefaultPermissions(userProfile.getId(), companyId, "EMPLOYEE");

        // Auto-add employee to company group chat
        groupMessagingService.addMemberToCompanyGroup(companyId, userProfile.getId());
    }

    @Transactional
    public void removeEmployeeFromCompany(UUID companyId, UUID userId) {
        CompanyMembership membership = membershipRepository.findByUserIdAndCompanyId(userId, companyId)
                .orElseThrow(() -> new RuntimeException("Bu kullanici bu sirkette bulunamadi"));
        if (membership.getMembershipRole() != MembershipRole.EMPLOYEE) {
            throw new org.springframework.security.access.AccessDeniedException(
                    "Bu endpoint yalnizca sirket calisanlarini kaldirabilir"
            );
        }
        membershipRepository.delete(membership);

        // Remove employee from company group chat
        groupMessagingService.removeMemberFromCompanyGroup(companyId, userId);
    }

    @Transactional
    public void deleteCompany(UUID companyId) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new RuntimeException("Sirket bulunamadi"));

        // Collect company-only users (not agency staff) to delete after cleanup
        List<CompanyMembership> memberships = membershipRepository.findByCompanyId(companyId);
        List<UUID> companyUserIds = memberships.stream()
                .map(m -> m.getUser())
                .filter(u -> u.getGlobalRole() == GlobalRole.COMPANY_USER)
                .map(u -> u.getId())
                .collect(Collectors.toList());

        // Remove all memberships and their group chat associations
        for (CompanyMembership m : memberships) {
            groupMessagingService.removeMemberFromCompanyGroup(companyId, m.getUser().getId());
        }
        membershipRepository.deleteAll(memberships);

        for (UUID uid : companyUserIds) {
            dataCleanup.cleanUserReferences(uid);
        }
        dataCleanup.deleteCompanyData(companyId, companyUserIds);
    }

    private CompanyResponse toResponse(Company company) {
        List<CompanyMembership> memberships = membershipRepository.findByCompanyId(company.getId());
        long taskCount = taskRepository.countByCompanyId(company.getId());
        int employeeCount = (int) memberships.stream().filter(m -> m.getMembershipRole().name().equals("OWNER") || m.getMembershipRole().name().equals("EMPLOYEE")).count();
        int staffCount = (int) memberships.stream().filter(m -> m.getMembershipRole().name().equals("AGENCY_STAFF")).count();

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

    private UserProfile getUser(UUID userId) {
        return userProfileRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Kullanici bulunamadi"));
    }

    private CompanyResponse toDetailedResponse(Company company) {
        List<CompanyMembership> memberships = membershipRepository.findByCompanyId(company.getId());
        long taskCount = taskRepository.countByCompanyId(company.getId());

        List<CompanyResponse.MembershipInfo> memberInfos = memberships.stream().map(m -> {
            Person p = m.getUser().getPerson();
            return CompanyResponse.MembershipInfo.builder()
                    .id(m.getId().toString())
                    .userId(m.getUser().getId().toString())
                    .fullName(p != null ? p.getFullName() : m.getUser().getEmail())
                    .email(m.getUser().getEmail())
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
                .employeeCount((int) memberships.stream().filter(m -> m.getMembershipRole().name().equals("OWNER") || m.getMembershipRole().name().equals("EMPLOYEE")).count())
                .staffCount((int) memberships.stream().filter(m -> m.getMembershipRole().name().equals("AGENCY_STAFF")).count())
                .taskCount((int) taskCount)
                .members(memberInfos)
                .build();
    }
}
