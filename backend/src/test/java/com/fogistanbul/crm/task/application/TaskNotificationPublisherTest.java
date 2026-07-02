package com.fogistanbul.crm.task.application;

import com.fogistanbul.crm.entity.Task;
import com.fogistanbul.crm.entity.UserProfile;
import com.fogistanbul.crm.entity.enums.NotificationType;
import com.fogistanbul.crm.repository.CompanyMembershipRepository;
import com.fogistanbul.crm.service.NotificationService;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.UUID;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

class TaskNotificationPublisherTest {

    private final NotificationService notificationService = mock(NotificationService.class);
    private final CompanyMembershipRepository membershipRepository = mock(CompanyMembershipRepository.class);
    private final TaskNotificationPublisher publisher = new TaskNotificationPublisher(notificationService, membershipRepository);

    @Test
    void selectedRecipientsAreNotDuplicatedAndSkipCreatorAndAssignee() {
        UUID taskId = UUID.randomUUID();
        UUID creatorId = UUID.randomUUID();
        UUID assigneeId = UUID.randomUUID();
        UUID extraId = UUID.randomUUID();
        UserProfile creator = UserProfile.builder().id(creatorId).build();
        UserProfile assignee = UserProfile.builder().id(assigneeId).build();
        Task task = Task.builder()
                .id(taskId)
                .title("Yeni görev")
                .assignedTo(assignee)
                .build();

        publisher.notifySelectedRecipients(task, creator, assignee,
                List.of(extraId, extraId, creatorId, assigneeId));

        verify(notificationService).send(
                extraId,
                NotificationType.TASK_ASSIGNED,
                "Yeni görev oluşturuldu: Yeni görev",
                "Bilgilendirildiğiniz yeni bir görev oluşturuldu",
                "TASK",
                taskId);
        verify(notificationService, never()).send(
                creatorId,
                NotificationType.TASK_ASSIGNED,
                "Yeni görev oluşturuldu: Yeni görev",
                "Bilgilendirildiğiniz yeni bir görev oluşturuldu",
                "TASK",
                taskId);
        verify(notificationService, never()).send(
                assigneeId,
                NotificationType.TASK_ASSIGNED,
                "Yeni görev oluşturuldu: Yeni görev",
                "Bilgilendirildiğiniz yeni bir görev oluşturuldu",
                "TASK",
                taskId);
    }
}
