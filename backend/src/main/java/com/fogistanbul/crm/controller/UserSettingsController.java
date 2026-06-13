package com.fogistanbul.crm.controller;

import com.fogistanbul.crm.dto.ChangePasswordRequest;
import com.fogistanbul.crm.dto.UpdateProfileRequest;
import com.fogistanbul.crm.security.CurrentUser;
import com.fogistanbul.crm.user.application.UserSettingsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/settings")
@RequiredArgsConstructor
public class UserSettingsController {

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

    @PostMapping(value = "/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, String>> uploadAvatar(
            @RequestParam("file") MultipartFile file, Authentication auth) throws IOException {
        String avatarUrl = settingsService.uploadAvatar(currentUser.id(auth), file);
        return ResponseEntity.ok(Map.of("avatarUrl", avatarUrl));
    }

    @GetMapping("/avatar/{userId}/{fileName}")
    public ResponseEntity<org.springframework.core.io.Resource> getAvatar(
            @PathVariable UUID userId, @PathVariable String fileName) throws IOException {
        var avatar = settingsService.getAvatar(userId, fileName);
        return ResponseEntity.ok()
                .contentType(avatar.mediaType())
                .body(avatar.resource());
    }
}
