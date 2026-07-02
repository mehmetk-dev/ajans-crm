package com.fogistanbul.crm.service;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import java.util.Optional;
import java.util.UUID;

import com.fogistanbul.crm.entity.Notification;
import com.fogistanbul.crm.entity.NotificationPreference;
import com.fogistanbul.crm.entity.UserProfile;
import com.fogistanbul.crm.entity.enums.NotificationType;
import com.fogistanbul.crm.repository.NotificationPreferenceRepository;
import com.fogistanbul.crm.repository.NotificationRepository;
import com.fogistanbul.crm.repository.UserProfileRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock
    private NotificationRepository notificationRepository;
    @Mock
    private NotificationPreferenceRepository preferenceRepository;
    @Mock
    private UserProfileRepository userProfileRepository;
    @Mock
    private SimpMessagingTemplate messagingTemplate;
    @Mock
    private EmailService emailService;

    @InjectMocks
    private NotificationService notificationService;

    @Test
    void sendUsesInAppNotificationByDefault() {
        UUID userId = UUID.randomUUID();
        when(userProfileRepository.findById(userId)).thenReturn(Optional.of(user(userId)));
        when(preferenceRepository.findByUserIdAndNotificationType(userId, NotificationType.TASK_ASSIGNED.name()))
                .thenReturn(Optional.empty());
        when(notificationRepository.save(any(Notification.class))).thenAnswer(invocation -> {
            Notification notification = invocation.getArgument(0);
            notification.setId(UUID.randomUUID());
            return notification;
        });

        notificationService.send(userId, NotificationType.TASK_ASSIGNED,
                "Yeni görev", "Detay", "TASK", UUID.randomUUID());

        verify(notificationRepository).save(any(Notification.class));
        verify(messagingTemplate).convertAndSendToUser(eq(userId.toString()), eq("/queue/notifications"), any());
        verifyNoInteractions(emailService);
    }

    @Test
    void sendEmailsWhenEmailPreferenceIsEnabled() {
        UUID userId = UUID.randomUUID();
        when(userProfileRepository.findById(userId)).thenReturn(Optional.of(user(userId)));
        when(preferenceRepository.findByUserIdAndNotificationType(userId, NotificationType.SHOOT_UPDATED.name()))
                .thenReturn(Optional.of(preference(true, true)));
        when(notificationRepository.save(any(Notification.class))).thenAnswer(invocation -> {
            Notification notification = invocation.getArgument(0);
            notification.setId(UUID.randomUUID());
            return notification;
        });

        notificationService.send(userId, NotificationType.SHOOT_UPDATED,
                "Çekim tamamlandı", null, "SHOOT", UUID.randomUUID());

        verify(emailService).sendNotificationEmail(
                "user@example.com",
                NotificationType.SHOOT_UPDATED,
                "Çekim tamamlandı",
                null,
                "SHOOT");
        verify(notificationRepository).save(any(Notification.class));
        verify(messagingTemplate).convertAndSendToUser(eq(userId.toString()), eq("/queue/notifications"), any());
    }

    @Test
    void sendSkipsInAppNotificationWhenPreferenceDisablesIt() {
        UUID userId = UUID.randomUUID();
        when(userProfileRepository.findById(userId)).thenReturn(Optional.of(user(userId)));
        when(preferenceRepository.findByUserIdAndNotificationType(userId, NotificationType.TASK_COMPLETED.name()))
                .thenReturn(Optional.of(preference(false, false)));

        notificationService.send(userId, NotificationType.TASK_COMPLETED,
                "Görev tamamlandı", null, "TASK", UUID.randomUUID());

        verify(notificationRepository, never()).save(any(Notification.class));
        verifyNoInteractions(messagingTemplate);
        verifyNoInteractions(emailService);
    }

    private UserProfile user(UUID userId) {
        return UserProfile.builder()
                .id(userId)
                .email("user@example.com")
                .build();
    }

    private NotificationPreference preference(boolean inApp, boolean email) {
        return NotificationPreference.builder()
                .inApp(inApp)
                .email(email)
                .build();
    }
}
