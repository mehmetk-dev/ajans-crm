package com.fogistanbul.crm.controller;

import com.fogistanbul.crm.entity.enums.ActivityAction;
import com.fogistanbul.crm.service.ActivityLogService;
import com.fogistanbul.crm.user.application.AdminResetPasswordRequest;
import com.fogistanbul.crm.user.application.UserManagementService;
import com.fogistanbul.crm.user.application.UserManagementService.UserResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/users")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class UserManagementController {

    private final UserManagementService userManagementService;
    private final ActivityLogService activityLogService;

    private UUID actorId(Authentication auth) {
        return auth != null ? (UUID) auth.getPrincipal() : null;
    }

    @GetMapping
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        return ResponseEntity.ok(userManagementService.getAllUsers());
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserResponse> updateUser(@PathVariable UUID id,
            @Valid @RequestBody UserManagementService.UpdateUserRequest request,
            Authentication auth) {
        UserResponse updated = userManagementService.updateUser(id, request);
        activityLogService.log(actorId(auth), ActivityAction.UPDATE, "USER",
                id, updated.fullName(), Map.of());
        return ResponseEntity.ok(updated);
    }

    @PutMapping("/{id}/role")
    public ResponseEntity<Map<String, String>> updateUserRole(
            @PathVariable UUID id,
            @RequestBody UpdateRoleRequest request,
            Authentication auth
    ) {
        userManagementService.updateRole(id, request.globalRole());
        activityLogService.log(actorId(auth), ActivityAction.PERMISSION_CHANGE, "USER",
                id, null, Map.of("globalRole", request.globalRole()));
        return ResponseEntity.ok(Map.of("message", "Rol güncellendi"));
    }

    public record UpdateRoleRequest(String globalRole) {}

    @PutMapping("/{id}/password")
    public ResponseEntity<Map<String, String>> resetPassword(
            @PathVariable UUID id,
            @Valid @RequestBody AdminResetPasswordRequest request,
            Authentication auth
    ) {
        UUID actingAdminId = actorId(auth);
        userManagementService.resetPassword(
                actingAdminId,
                id,
                request.adminPassword(),
                request.newPassword()
        );
        activityLogService.log(
                actingAdminId,
                ActivityAction.UPDATE,
                "USER",
                id,
                null,
                Map.of("operation", "password_reset")
        );
        return ResponseEntity.ok(Map.of(
                "message",
                "Kullanıcı şifresi başarıyla değiştirildi"
        ));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteUser(@PathVariable UUID id, Authentication auth) {
        activityLogService.log(actorId(auth), ActivityAction.DELETE, "USER", id, null, Map.of());
        userManagementService.deleteUser(id);
        return ResponseEntity.ok(Map.of("message", "Kullanıcı silindi"));
    }
}
