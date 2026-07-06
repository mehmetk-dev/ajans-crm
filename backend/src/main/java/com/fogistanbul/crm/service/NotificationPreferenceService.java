package com.fogistanbul.crm.service;

import com.fogistanbul.crm.dto.NotificationPreferenceResponse;
import com.fogistanbul.crm.dto.UpdateNotificationPreferenceRequest;
import com.fogistanbul.crm.entity.enums.NotificationType;
import com.fogistanbul.crm.exception.ApiErrorCode;
import com.fogistanbul.crm.exception.ApiException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
public class NotificationPreferenceService {

    @Transactional(readOnly = true)
    public List<NotificationPreferenceResponse> getPreferences(UUID userId) {
        return Arrays.stream(NotificationType.values())
                .map(this::effectivePreference)
                .toList();
    }

    @Transactional(readOnly = true)
    public NotificationPreferenceResponse updatePreference(UUID userId, UpdateNotificationPreferenceRequest request) {
        return effectivePreference(parseNotificationType(request.getNotificationType()));
    }

    private NotificationType parseNotificationType(String notificationType) {
        try {
            return NotificationType.valueOf(notificationType);
        } catch (IllegalArgumentException | NullPointerException e) {
            throw new ApiException(
                    ApiErrorCode.INVALID_ARGUMENT.getStatus(),
                    ApiErrorCode.INVALID_ARGUMENT.name(),
                    "Geçersiz bildirim tipi"
            );
        }
    }

    private NotificationPreferenceResponse effectivePreference(NotificationType type) {
        return NotificationPreferenceResponse.builder()
                .notificationType(type.name())
                .inApp(true)
                .email(true)
                .build();
    }

}
