package com.fogistanbul.crm.controller;

import com.fogistanbul.crm.user.application.UserManagementService;
import com.fogistanbul.crm.user.application.UserManagementService.UserResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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

    @GetMapping
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        return ResponseEntity.ok(userManagementService.getAllUsers());
    }

    @PutMapping("/{id}/role")
    public ResponseEntity<Map<String, String>> updateUserRole(
            @PathVariable UUID id,
            @RequestBody UpdateRoleRequest request
    ) {
        userManagementService.updateRole(id, request.globalRole());
        return ResponseEntity.ok(Map.of("message", "Rol güncellendi"));
    }

    public record UpdateRoleRequest(String globalRole) {}

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteUser(@PathVariable UUID id) {
        userManagementService.deleteUser(id);
        return ResponseEntity.ok(Map.of("message", "Kullanıcı silindi"));
    }
}
