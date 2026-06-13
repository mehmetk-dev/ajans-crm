package com.fogistanbul.crm.user.application;

import com.fogistanbul.crm.entity.UserProfile;
import com.fogistanbul.crm.entity.enums.GlobalRole;
import com.fogistanbul.crm.exception.ApiException;
import com.fogistanbul.crm.repository.CompanyMembershipRepository;
import com.fogistanbul.crm.repository.UserProfileRepository;
import com.fogistanbul.crm.user.infrastructure.UserAccountCleanupRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserManagementServiceTest {

    @Mock
    private UserProfileRepository userProfileRepository;
    @Mock
    private CompanyMembershipRepository membershipRepository;
    @Mock
    private UserAccountCleanupRepository cleanupRepository;

    @InjectMocks
    private UserManagementService service;

    @Test
    void invalidGlobalRoleIsRejected() {
        UUID userId = UUID.randomUUID();
        when(userProfileRepository.findById(userId)).thenReturn(Optional.of(
                UserProfile.builder().id(userId).globalRole(GlobalRole.COMPANY_USER).build()
        ));

        ApiException exception = assertThrows(
                ApiException.class,
                () -> service.updateRole(userId, "ROOT")
        );

        assertEquals("INVALID_GLOBAL_ROLE", exception.getCode());
        verify(userProfileRepository, never()).save(org.mockito.ArgumentMatchers.any());
    }

    @Test
    void adminUsersCannotBeDeleted() {
        UUID userId = UUID.randomUUID();
        UserProfile admin = UserProfile.builder().id(userId).globalRole(GlobalRole.ADMIN).build();
        when(userProfileRepository.findById(userId)).thenReturn(Optional.of(admin));

        ApiException exception = assertThrows(
                ApiException.class,
                () -> service.deleteUser(userId)
        );

        assertEquals("ADMIN_DELETE_FORBIDDEN", exception.getCode());
        verify(cleanupRepository, never()).deleteReferences(admin);
        verify(userProfileRepository, never()).delete(admin);
    }

    @Test
    void nonAdminDeletionCleansReferencesBeforeDeletingTheProfile() {
        UUID userId = UUID.randomUUID();
        UserProfile user = UserProfile.builder()
                .id(userId)
                .globalRole(GlobalRole.COMPANY_USER)
                .build();
        when(userProfileRepository.findById(userId)).thenReturn(Optional.of(user));

        service.deleteUser(userId);

        var order = org.mockito.Mockito.inOrder(cleanupRepository, userProfileRepository);
        order.verify(cleanupRepository).deleteReferences(user);
        order.verify(userProfileRepository).delete(user);
    }
}
