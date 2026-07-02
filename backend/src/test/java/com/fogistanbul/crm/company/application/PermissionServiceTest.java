package com.fogistanbul.crm.company.application;

import com.fogistanbul.crm.company.dto.UpdatePermissionRequest;
import com.fogistanbul.crm.entity.CompanyPermission;
import com.fogistanbul.crm.entity.CompanyMembership;
import com.fogistanbul.crm.entity.enums.PermissionLevel;
import com.fogistanbul.crm.entity.enums.MembershipRole;
import com.fogistanbul.crm.repository.CompanyMembershipRepository;
import com.fogistanbul.crm.repository.CompanyPermissionRepository;
import com.fogistanbul.crm.repository.CompanyRepository;
import com.fogistanbul.crm.repository.UserProfileRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PermissionServiceTest {

    @Mock
    private CompanyPermissionRepository permissionRepository;
    @Mock
    private UserProfileRepository userProfileRepository;
    @Mock
    private CompanyRepository companyRepository;
    @Mock
    private CompanyMembershipRepository membershipRepository;

    @InjectMocks
    private PermissionService permissionService;

    @Test
    void permissionsCannotBeReadForNonMember() {
        UUID userId = UUID.randomUUID();
        UUID companyId = UUID.randomUUID();
        when(membershipRepository.existsByUserIdAndCompanyId(userId, companyId)).thenReturn(false);

        assertThrows(RuntimeException.class, () -> permissionService.getPermissions(userId, companyId));
        verifyNoInteractions(permissionRepository);
    }

    @Test
    void invalidPermissionKeyIsRejectedBeforePersistenceLookup() {
        UUID userId = UUID.randomUUID();
        UUID companyId = UUID.randomUUID();
        when(membershipRepository.existsByUserIdAndCompanyId(userId, companyId)).thenReturn(true);
        UpdatePermissionRequest request = UpdatePermissionRequest.builder()
                .userId(userId)
                .companyId(companyId)
                .permissionKey("unknown.permission")
                .level("FULL")
                .build();

        assertThrows(RuntimeException.class, () -> permissionService.updatePermission(request));
        verifyNoInteractions(permissionRepository, userProfileRepository, companyRepository);
    }

    @Test
    void requestedDefaultRoleMustMatchMembershipRole() {
        UUID userId = UUID.randomUUID();
        UUID companyId = UUID.randomUUID();
        CompanyMembership membership = CompanyMembership.builder()
                .membershipRole(MembershipRole.EMPLOYEE)
                .build();
        when(membershipRepository.findByUserIdAndCompanyId(userId, companyId))
                .thenReturn(Optional.of(membership));

        assertThrows(
                RuntimeException.class,
                () -> permissionService.setDefaultPermissions(userId, companyId, "OWNER")
        );
        verifyNoInteractions(permissionRepository, userProfileRepository, companyRepository);
    }

    @Test
    void fullPermissionAllowsCompanyTaskCreation() {
        UUID userId = UUID.randomUUID();
        UUID companyId = UUID.randomUUID();
        when(membershipRepository.findByUserIdAndCompanyId(userId, companyId))
                .thenReturn(Optional.of(CompanyMembership.builder()
                        .membershipRole(MembershipRole.EMPLOYEE)
                        .build()));
        when(permissionRepository.findByUserIdAndCompanyIdAndPermissionKey(userId, companyId, "tasks.create"))
                .thenReturn(Optional.of(CompanyPermission.builder()
                        .permissionKey("tasks.create")
                        .level(PermissionLevel.FULL)
                        .build()));

        assertDoesNotThrow(() -> permissionService.requireFullPermission(userId, companyId, "tasks.create"));
    }

    @Test
    void missingPermissionRejectsCompanyTaskCreation() {
        UUID userId = UUID.randomUUID();
        UUID companyId = UUID.randomUUID();
        when(membershipRepository.findByUserIdAndCompanyId(userId, companyId))
                .thenReturn(Optional.of(CompanyMembership.builder()
                        .membershipRole(MembershipRole.EMPLOYEE)
                        .build()));
        when(permissionRepository.findByUserIdAndCompanyIdAndPermissionKey(userId, companyId, "tasks.create"))
                .thenReturn(Optional.empty());

        assertThrows(RuntimeException.class,
                () -> permissionService.requireFullPermission(userId, companyId, "tasks.create"));
    }

    @Test
    void companyOwnerCanCreateTaskWithoutStoredPermissionRow() {
        UUID userId = UUID.randomUUID();
        UUID companyId = UUID.randomUUID();
        when(membershipRepository.findByUserIdAndCompanyId(userId, companyId))
                .thenReturn(Optional.of(CompanyMembership.builder()
                        .membershipRole(MembershipRole.OWNER)
                        .build()));

        assertDoesNotThrow(() -> permissionService.requireFullPermission(userId, companyId, "tasks.create"));
        verifyNoInteractions(permissionRepository);
    }
}
