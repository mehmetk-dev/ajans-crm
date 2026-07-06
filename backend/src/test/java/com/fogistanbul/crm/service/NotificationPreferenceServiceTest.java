package com.fogistanbul.crm.service;

import com.fogistanbul.crm.dto.UpdateNotificationPreferenceRequest;
import com.fogistanbul.crm.entity.enums.NotificationType;
import com.fogistanbul.crm.exception.ApiException;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class NotificationPreferenceServiceTest {

    private final NotificationPreferenceService service = new NotificationPreferenceService();

    @Test
    void emailPreferencesDefaultToEnabledForEveryNotificationType() {
        UUID userId = UUID.randomUUID();

        var preferences = service.getPreferences(userId);

        assertTrue(emailDefault(preferences, NotificationType.SHOOT_CREATED));
        assertTrue(emailDefault(preferences, NotificationType.SHOOT_REMINDER));
        assertTrue(emailDefault(preferences, NotificationType.TASK_ASSIGNED));
        assertTrue(inAppDefault(preferences, NotificationType.TASK_ASSIGNED));
    }

    @Test
    void updateReturnsMandatoryEnabledPreferenceWithoutPersistingDisabledValues() {
        UpdateNotificationPreferenceRequest request = new UpdateNotificationPreferenceRequest();
        request.setNotificationType(NotificationType.SHOOT_REMINDER.name());
        request.setInApp(false);
        request.setEmail(false);

        var response = service.updatePreference(UUID.randomUUID(), request);

        assertEquals(NotificationType.SHOOT_REMINDER.name(), response.getNotificationType());
        assertTrue(response.isInApp());
        assertTrue(response.isEmail());
    }

    @Test
    void updateRejectsInvalidNotificationTypeWithGlobalInvalidArgumentCode() {
        UpdateNotificationPreferenceRequest request = new UpdateNotificationPreferenceRequest();
        request.setNotificationType("UNKNOWN_TYPE");

        ApiException exception = assertThrows(
                ApiException.class,
                () -> service.updatePreference(UUID.randomUUID(), request)
        );

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatus());
        assertEquals("INVALID_ARGUMENT", exception.getCode());
        assertEquals("Geçersiz bildirim tipi", exception.getMessage());
    }

    private boolean emailDefault(
            List<com.fogistanbul.crm.dto.NotificationPreferenceResponse> preferences,
            NotificationType type
    ) {
        return preferences.stream()
                .filter(preference -> preference.getNotificationType().equals(type.name()))
                .findFirst()
                .orElseThrow()
                .isEmail();
    }

    private boolean inAppDefault(
            List<com.fogistanbul.crm.dto.NotificationPreferenceResponse> preferences,
            NotificationType type
    ) {
        return preferences.stream()
                .filter(preference -> preference.getNotificationType().equals(type.name()))
                .findFirst()
                .orElseThrow()
                .isInApp();
    }
}
