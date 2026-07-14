package com.fogistanbul.crm.user.application;

import com.fogistanbul.crm.entity.UserProfile;
import com.fogistanbul.crm.entity.enums.GlobalRole;
import com.fogistanbul.crm.exception.ApiException;
import com.fogistanbul.crm.repository.CompanyMembershipRepository;
import com.fogistanbul.crm.repository.PersonRepository;
import com.fogistanbul.crm.repository.RefreshTokenRepository;
import com.fogistanbul.crm.repository.UserProfileRepository;
import com.fogistanbul.crm.user.infrastructure.UserAccountCleanupRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
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
    @Mock
    private PersonRepository personRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private RefreshTokenRepository refreshTokenRepository;

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

    @Test
    void validAdminPasswordResetsTargetAndRevokesRefreshTokens() {
        UUID adminId = UUID.randomUUID();
        UUID targetId = UUID.randomUUID();
        UserProfile admin = user(adminId, GlobalRole.ADMIN, "admin-hash");
        UserProfile target = user(targetId, GlobalRole.COMPANY_USER, "old-hash");
        when(userProfileRepository.findById(adminId)).thenReturn(Optional.of(admin));
        when(userProfileRepository.findById(targetId)).thenReturn(Optional.of(target));
        when(passwordEncoder.matches("admin-current", "admin-hash")).thenReturn(true);
        when(passwordEncoder.encode("target-new")).thenReturn("new-hash");

        service.resetPassword(adminId, targetId, "admin-current", "target-new");

        assertEquals("new-hash", target.getPasswordHash());
        verify(userProfileRepository).save(target);
        verify(refreshTokenRepository).revokeAllByUserId(targetId);
    }

    @Test
    void wrongAdminPasswordLeavesTargetUnchanged() {
        UUID adminId = UUID.randomUUID();
        UUID targetId = UUID.randomUUID();
        UserProfile admin = user(adminId, GlobalRole.ADMIN, "admin-hash");
        when(userProfileRepository.findById(adminId)).thenReturn(Optional.of(admin));
        when(passwordEncoder.matches("wrong", "admin-hash")).thenReturn(false);

        ApiException exception = assertThrows(
                ApiException.class,
                () -> service.resetPassword(adminId, targetId, "wrong", "target-new")
        );

        assertEquals("ADMIN_PASSWORD_INVALID", exception.getCode());
        verify(userProfileRepository, never()).save(any());
        verify(refreshTokenRepository, never()).revokeAllByUserId(any());
    }

    @Test
    void nonAdminActorIsRejectedBeforePasswordVerification() {
        UUID actorId = UUID.randomUUID();
        UUID targetId = UUID.randomUUID();
        when(userProfileRepository.findById(actorId)).thenReturn(Optional.of(
                user(actorId, GlobalRole.AGENCY_STAFF, "actor-hash")
        ));

        ApiException exception = assertThrows(
                ApiException.class,
                () -> service.resetPassword(actorId, targetId, "actor-current", "target-new")
        );

        assertEquals("ADMIN_PASSWORD_RESET_FORBIDDEN", exception.getCode());
        verify(passwordEncoder, never()).matches(anyString(), anyString());
        verify(userProfileRepository, never()).save(any());
        verify(refreshTokenRepository, never()).revokeAllByUserId(any());
    }

    @Test
    void actingAdminCannotResetOwnPassword() {
        UUID adminId = UUID.randomUUID();
        UserProfile admin = user(adminId, GlobalRole.ADMIN, "admin-hash");
        when(userProfileRepository.findById(adminId)).thenReturn(Optional.of(admin));
        when(passwordEncoder.matches("admin-current", "admin-hash")).thenReturn(true);

        ApiException exception = assertThrows(
                ApiException.class,
                () -> service.resetPassword(adminId, adminId, "admin-current", "target-new")
        );

        assertEquals("ADMIN_PASSWORD_RESET_FORBIDDEN", exception.getCode());
        verify(userProfileRepository, never()).save(any());
        verify(refreshTokenRepository, never()).revokeAllByUserId(any());
    }

    @Test
    void anotherAdminCannotBePasswordResetTarget() {
        UUID actingAdminId = UUID.randomUUID();
        UUID targetAdminId = UUID.randomUUID();
        UserProfile actingAdmin = user(actingAdminId, GlobalRole.ADMIN, "admin-hash");
        UserProfile targetAdmin = user(targetAdminId, GlobalRole.ADMIN, "target-hash");
        when(userProfileRepository.findById(actingAdminId)).thenReturn(Optional.of(actingAdmin));
        when(userProfileRepository.findById(targetAdminId)).thenReturn(Optional.of(targetAdmin));
        when(passwordEncoder.matches("admin-current", "admin-hash")).thenReturn(true);

        ApiException exception = assertThrows(
                ApiException.class,
                () -> service.resetPassword(actingAdminId, targetAdminId, "admin-current", "target-new")
        );

        assertEquals("ADMIN_PASSWORD_RESET_FORBIDDEN", exception.getCode());
        verify(userProfileRepository, never()).save(any());
        verify(refreshTokenRepository, never()).revokeAllByUserId(any());
    }

    @Test
    void missingPasswordResetTargetReturnsUserNotFound() {
        UUID adminId = UUID.randomUUID();
        UUID targetId = UUID.randomUUID();
        UserProfile admin = user(adminId, GlobalRole.ADMIN, "admin-hash");
        when(userProfileRepository.findById(adminId)).thenReturn(Optional.of(admin));
        when(userProfileRepository.findById(targetId)).thenReturn(Optional.empty());
        when(passwordEncoder.matches("admin-current", "admin-hash")).thenReturn(true);

        ApiException exception = assertThrows(
                ApiException.class,
                () -> service.resetPassword(adminId, targetId, "admin-current", "target-new")
        );

        assertEquals("USER_NOT_FOUND", exception.getCode());
        verify(userProfileRepository, never()).save(any());
        verify(refreshTokenRepository, never()).revokeAllByUserId(any());
    }

    private UserProfile user(UUID id, GlobalRole role, String passwordHash) {
        return UserProfile.builder()
                .id(id)
                .globalRole(role)
                .passwordHash(passwordHash)
                .build();
    }
}
