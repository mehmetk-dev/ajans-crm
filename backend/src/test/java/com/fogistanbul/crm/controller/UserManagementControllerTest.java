package com.fogistanbul.crm.controller;

import com.fogistanbul.crm.entity.enums.ActivityAction;
import com.fogistanbul.crm.service.ActivityLogService;
import com.fogistanbul.crm.user.application.AdminResetPasswordRequest;
import com.fogistanbul.crm.user.application.UserManagementService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;

import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserManagementControllerTest {

    @Mock
    private UserManagementService userManagementService;
    @Mock
    private ActivityLogService activityLogService;
    @Mock
    private Authentication authentication;

    @InjectMocks
    private UserManagementController controller;

    @Test
    void resetPasswordPassesActorAndLogsOnlySafeMetadata() {
        UUID actorId = UUID.randomUUID();
        UUID targetId = UUID.randomUUID();
        when(authentication.getPrincipal()).thenReturn(actorId);
        AdminResetPasswordRequest request = new AdminResetPasswordRequest(
                "admin-current",
                "target-new"
        );

        ResponseEntity<Map<String, String>> response = controller.resetPassword(
                targetId,
                request,
                authentication
        );

        verify(userManagementService).resetPassword(
                actorId,
                targetId,
                "admin-current",
                "target-new"
        );
        verify(activityLogService).log(
                actorId,
                ActivityAction.UPDATE,
                "USER",
                targetId,
                null,
                Map.of("operation", "password_reset")
        );
        assertNotNull(response.getBody());
        assertEquals(
                "Kullanıcı şifresi başarıyla değiştirildi",
                response.getBody().get("message")
        );
    }
}
