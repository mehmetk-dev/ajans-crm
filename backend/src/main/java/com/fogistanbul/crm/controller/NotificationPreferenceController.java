package com.fogistanbul.crm.controller;

import com.fogistanbul.crm.dto.NotificationPreferenceResponse;
import com.fogistanbul.crm.dto.UpdateNotificationPreferenceRequest;
import com.fogistanbul.crm.security.CurrentUser;
import com.fogistanbul.crm.service.NotificationPreferenceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notification-preferences")
@RequiredArgsConstructor
public class NotificationPreferenceController {

    private final NotificationPreferenceService preferenceService;
    private final CurrentUser currentUser;

    @GetMapping
    public List<NotificationPreferenceResponse> getPreferences(Authentication auth) {
        return preferenceService.getPreferences(currentUser.id(auth));
    }

    @PutMapping
    public NotificationPreferenceResponse update(
            @Valid @RequestBody UpdateNotificationPreferenceRequest request,
            Authentication auth) {
        return preferenceService.updatePreference(currentUser.id(auth), request);
    }
}
