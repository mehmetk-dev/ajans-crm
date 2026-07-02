package com.fogistanbul.crm.task.application;

import com.fogistanbul.crm.entity.CompanyMembership;
import com.fogistanbul.crm.entity.Task;
import com.fogistanbul.crm.entity.UserProfile;
import com.fogistanbul.crm.entity.enums.MembershipRole;
import com.fogistanbul.crm.entity.enums.NotificationType;
import com.fogistanbul.crm.repository.CompanyMembershipRepository;
import com.fogistanbul.crm.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class TaskNotificationPublisher {

    private final NotificationService notificationService;
    private final CompanyMembershipRepository membershipRepository;

    public void notifyAssignee(Task task, UserProfile creator) {
        if (task.getAssignedTo().getId().equals(creator.getId())) {
            return;
        }
        String creatorName = creator.getPerson() != null ? creator.getPerson().getFullName() : "Bir kullanıcı";
        notificationService.send(
                task.getAssignedTo().getId(),
                NotificationType.TASK_ASSIGNED,
                "Yeni görev atandı: " + task.getTitle(),
                creatorName + " size bir görev atadı",
                "TASK",
                task.getId());
    }

    public void notifyCompanyMembersAboutNew(Task task, UserProfile assignee, UUID excludeUserId) {
        if (task.getCompany() == null) {
            return;
        }
        String assigneeName = assignee.getPerson() != null ? assignee.getPerson().getFullName() : "Bir kullanıcı";
        broadcast(
                task.getCompany().getId(),
                excludeUserId,
                NotificationType.TASK_ASSIGNED,
                "Yeni görev oluşturuldu: " + task.getTitle(),
                assigneeName + " görevlendirildi",
                "TASK",
                task.getId());
    }

    public void notifySelectedRecipients(Task task, UserProfile creator, UserProfile assignee, List<UUID> recipientIds) {
        for (UUID recipientId : new LinkedHashSet<>(recipientIds)) {
            if (recipientId.equals(creator.getId()) || recipientId.equals(assignee.getId())) {
                continue;
            }
            notificationService.send(
                    recipientId,
                    NotificationType.TASK_ASSIGNED,
                    "Yeni görev oluşturuldu: " + task.getTitle(),
                    "Bilgilendirildiğiniz yeni bir görev oluşturuldu",
                    "TASK",
                    task.getId());
        }
    }

    public void notifyStatusChange(Task task, UUID actorUserId) {
        if (task.getCompany() == null) {
            return;
        }
        String statusLabel = labelFor(task.getStatus());
        NotificationType nType = task.getStatus() == com.fogistanbul.crm.entity.enums.TaskStatus.DONE
                ? NotificationType.TASK_COMPLETED
                : NotificationType.TASK_STATUS_CHANGED;

        broadcast(
                task.getCompany().getId(),
                actorUserId,
                nType,
                "Görev " + statusLabel + ": " + task.getTitle(),
                null,
                "TASK",
                task.getId());

        if (task.getCreatedBy() != null && !task.getCreatedBy().getId().equals(actorUserId)) {
            notificationService.send(
                    task.getCreatedBy().getId(),
                    nType,
                    "Görev " + statusLabel + ": " + task.getTitle(),
                    null,
                    "TASK",
                    task.getId());
        }
    }

    private void broadcast(UUID companyId, UUID excludeUserId, NotificationType type,
                            String title, String message, String refType, UUID refId) {
        for (CompanyMembership m : membershipRepository.findByCompanyId(companyId)) {
            if (m.getMembershipRole() == MembershipRole.AGENCY_STAFF) {
                continue;
            }
            if (m.getUser().getId().equals(excludeUserId)) {
                continue;
            }
            notificationService.send(m.getUser().getId(), type, title, message, refType, refId);
        }
    }

    private String labelFor(com.fogistanbul.crm.entity.enums.TaskStatus status) {
        return switch (status) {
            case DONE -> "tamamlandı";
            case IN_PROGRESS -> "başladı";
            case OVERDUE -> "gecikti";
            default -> status.name();
        };
    }
}
