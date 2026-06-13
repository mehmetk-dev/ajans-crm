package com.fogistanbul.crm.controller;

import com.fogistanbul.crm.dto.ChangePasswordRequest;
import com.fogistanbul.crm.dto.UpdateProfileRequest;
import com.fogistanbul.crm.security.CurrentUser;
import com.fogistanbul.crm.user.application.UserSettingsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/client/settings")
@RequiredArgsConstructor
public class ClientSettingsController {

    private final UserSettingsService settingsService;
    private final CurrentUser currentUser;

    @PutMapping("/profile")
    public ResponseEntity<Map<String, String>> updateProfile(
            @Valid @RequestBody UpdateProfileRequest request, Authentication auth) {
        String fullName = settingsService.updateProfile(currentUser.id(auth), request.getFullName());
        return ResponseEntity.ok(Map.of("fullName", fullName));
    }

    @PutMapping("/password")
    public ResponseEntity<Map<String, String>> changePassword(
            @Valid @RequestBody ChangePasswordRequest request, Authentication auth) {
        settingsService.changePassword(
                currentUser.id(auth),
                request.getCurrentPassword(),
                request.getNewPassword()
        );
        return ResponseEntity.ok(Map.of("message", "Şifre başarıyla değiştirildi"));
    }
}
