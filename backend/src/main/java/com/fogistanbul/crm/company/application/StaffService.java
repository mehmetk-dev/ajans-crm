package com.fogistanbul.crm.company.application;

import com.fogistanbul.crm.company.dto.CreateStaffRequest;
import com.fogistanbul.crm.company.dto.StaffResponse;
import com.fogistanbul.crm.company.infrastructure.CompanyDataCleanup;
import com.fogistanbul.crm.entity.*;
import com.fogistanbul.crm.entity.enums.GlobalRole;
import com.fogistanbul.crm.entity.enums.MembershipRole;
import com.fogistanbul.crm.exception.ApiException;
import com.fogistanbul.crm.repository.*;
import com.fogistanbul.crm.messaging.application.GroupMessagingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StaffService {

    private final PersonRepository personRepository;
    private final UserProfileRepository userProfileRepository;
    private final CompanyRepository companyRepository;
    private final CompanyMembershipRepository membershipRepository;
    private final PasswordEncoder passwordEncoder;
    private final GroupMessagingService groupMessagingService;
    private final CompanyDataCleanup dataCleanup;

    // FOG Istanbul agency company.
    private static final UUID AGENCY_ID = UUID.fromString("00000000-0000-0000-0000-000000000001");

    @Transactional
    public StaffResponse createStaff(CreateStaffRequest req) {
        if (userProfileRepository.existsByEmail(req.getEmail())) {
            throw new ApiException(HttpStatus.CONFLICT, "EMAIL_ALREADY_EXISTS", "Bu email ile kayıtlı bir kullanıcı zaten var");
        }

        Company agency = companyRepository.findById(AGENCY_ID)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "AGENCY_NOT_FOUND", "Ajans şirketi bulunamadı"));

        Person person = new Person();
        person.setCompany(agency);
        person.setFullName(req.getFullName());
        person.setEmail(req.getEmail());
        person.setPhone(req.getPhone());
        person.setPositionTitle(req.getPosition());
        person.setDepartment(req.getDepartment());
        person = personRepository.save(person);

        UserProfile userProfile = new UserProfile();
        userProfile.setPerson(person);
        userProfile.setGlobalRole(GlobalRole.AGENCY_STAFF);
        userProfile.setEmail(req.getEmail());
        userProfile.setPasswordHash(passwordEncoder.encode(req.getPassword()));
        userProfile = userProfileRepository.save(userProfile);

        CompanyMembership membership = new CompanyMembership();
        membership.setUser(userProfile);
        membership.setCompany(agency);
        membership.setMembershipRole(MembershipRole.AGENCY_STAFF);
        membershipRepository.save(membership);

        if (req.getInitialCompanyId() != null) {
            assignToCompany(userProfile.getId(), req.getInitialCompanyId());
        }

        return toResponse(userProfile);
    }

    @Transactional(readOnly = true)
    public List<StaffResponse> getAllStaff() {
        return userProfileRepository.findByGlobalRole(GlobalRole.AGENCY_STAFF).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public StaffResponse getStaffById(UUID id) {
        UserProfile user = userProfileRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "STAFF_NOT_FOUND", "Çalışan bulunamadı"));
        if (user.getGlobalRole() != GlobalRole.AGENCY_STAFF) {
            throw new ApiException(HttpStatus.FORBIDDEN, "NOT_AGENCY_STAFF", "Bu kullanıcı bir ajans çalışanı değil");
        }
        return toResponse(user);
    }

    @Transactional
    public void assignToCompany(UUID staffUserId, UUID companyId) {
        UserProfile staff = userProfileRepository.findById(staffUserId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "STAFF_NOT_FOUND", "Çalışan bulunamadı"));

        if (staff.getGlobalRole() != GlobalRole.AGENCY_STAFF) {
            throw new ApiException(HttpStatus.FORBIDDEN, "ONLY_AGENCY_STAFF", "Sadece ajans çalışanları şirketlere atanabilir");
        }

        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "COMPANY_NOT_FOUND", "Şirket bulunamadı"));

        if (membershipRepository.existsByUserIdAndCompanyId(staffUserId, companyId)) {
            throw new ApiException(HttpStatus.CONFLICT, "STAFF_ALREADY_ASSIGNED", "Bu çalışan zaten bu şirkete atanmış");
        }

        CompanyMembership membership = new CompanyMembership();
        membership.setUser(staff);
        membership.setCompany(company);
        membership.setMembershipRole(MembershipRole.AGENCY_STAFF);
        membershipRepository.save(membership);

        groupMessagingService.addMemberToCompanyGroup(companyId, staffUserId);
    }

    @Transactional
    public void unassignFromCompany(UUID membershipId) {
        CompanyMembership membership = membershipRepository.findById(membershipId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "MEMBERSHIP_NOT_FOUND", "Üyelik bulunamadı"));
        if (membership.getMembershipRole() != MembershipRole.AGENCY_STAFF
                || membership.getCompany().getId().equals(AGENCY_ID)) {
            throw new org.springframework.security.access.AccessDeniedException(
                    "Yalnızca müşteri şirketindeki ajans ataması kaldırılabilir"
            );
        }

        UUID companyId = membership.getCompany().getId();
        UUID userId = membership.getUser().getId();

        membershipRepository.delete(membership);

        groupMessagingService.removeMemberFromCompanyGroup(companyId, userId);
    }

    @Transactional
    public void deleteStaff(UUID staffId) {
        UserProfile user = userProfileRepository.findById(staffId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "STAFF_NOT_FOUND", "Çalışan bulunamadı"));
        if (user.getGlobalRole() != GlobalRole.AGENCY_STAFF) {
            throw new ApiException(HttpStatus.FORBIDDEN, "NOT_AGENCY_STAFF", "Bu kullanıcı bir ajans çalışanı değil");
        }

        // Remove all company memberships
        List<CompanyMembership> memberships = membershipRepository.findByUserId(staffId);
        for (CompanyMembership m : memberships) {
            groupMessagingService.removeMemberFromCompanyGroup(m.getCompany().getId(), staffId);
        }
        membershipRepository.deleteAll(memberships);

        dataCleanup.cleanUserReferences(staffId);

        // Delete user profile and person
        Person person = user.getPerson();
        userProfileRepository.delete(user);
        if (person != null) {
            personRepository.delete(person);
        }
    }

    private StaffResponse toResponse(UserProfile user) {
        Person p = user.getPerson();
        List<CompanyMembership> memberships = membershipRepository.findByUserId(user.getId());

        List<StaffResponse.AssignedCompany> assigned = memberships.stream()
                .filter(m -> m.getCompany().getId() != null && !m.getCompany().getId().equals(AGENCY_ID))
                .map(m -> StaffResponse.AssignedCompany.builder()
                        .membershipId(m.getId().toString())
                        .companyId(m.getCompany().getId().toString())
                        .companyName(m.getCompany().getName())
                        .membershipRole(m.getMembershipRole().name())
                        .build())
                .collect(Collectors.toList());

        return StaffResponse.builder()
                .id(user.getId().toString())
                .fullName(p != null ? p.getFullName() : user.getEmail())
                .email(user.getEmail())
                .phone(p != null ? p.getPhone() : null)
                .position(p != null ? p.getPositionTitle() : null)
                .department(p != null ? p.getDepartment() : null)
                .avatarUrl(p != null ? p.getAvatarUrl() : null)
                .globalRole(user.getGlobalRole().name())
                .assignedCompanies(assigned)
                .build();
    }
}
