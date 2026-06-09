package com.fogistanbul.crm.company.application;

import com.fogistanbul.crm.company.dto.UpdatePermissionRequest;
import com.fogistanbul.crm.entity.CompanyMembership;
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
}
