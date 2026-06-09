package com.fogistanbul.crm.task.application;

import com.fogistanbul.crm.task.dto.CreateTaskRequest;
import com.fogistanbul.crm.task.dto.TaskResponse;
import com.fogistanbul.crm.task.dto.UpdateTaskRequest;
import com.fogistanbul.crm.entity.Company;
import com.fogistanbul.crm.entity.Task;
import com.fogistanbul.crm.entity.UserProfile;
import com.fogistanbul.crm.entity.enums.GlobalRole;
import com.fogistanbul.crm.entity.enums.NotificationType;
import com.fogistanbul.crm.entity.enums.TaskCategory;
import com.fogistanbul.crm.entity.enums.TaskStatus;
import com.fogistanbul.crm.repository.CompanyMembershipRepository;
import com.fogistanbul.crm.repository.CompanyRepository;
import com.fogistanbul.crm.repository.TaskRepository;
import com.fogistanbul.crm.repository.UserProfileRepository;
import com.fogistanbul.crm.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class TaskService {

    private final TaskRepository taskRepository;
    private final CompanyRepository companyRepository;
    private final UserProfileRepository userProfileRepository;
    private final CompanyMembershipRepository membershipRepository;
    private final NotificationService notificationService;
    private final TaskAccessPolicy accessPolicy;
    private final TaskMapper mapper;
    private final TaskPhaseCompletionService phaseCompletionService;

    @Transactional
    public TaskResponse createTask(CreateTaskRequest req, UUID createdById) {
        UserProfile creator = getUserOrThrow(createdById);
        UserProfile assignee = getUserOrThrow(req.getAssignedToId());

        Company company = null;
        if (req.getCompanyId() != null) {
            company = companyRepository.findById(req.getCompanyId())
                    .orElseThrow(() -> new RuntimeException("Sirket bulunamadi"));
        }
        accessPolicy.requireAssignable(creator, assignee, company != null ? company.getId() : null);

        Task task = Task.builder()
                .company(company)
                .createdBy(creator)
                .assignedTo(assignee)
                .title(req.getTitle())
                .description(req.getDescription())
                .category(req.getCategory() != null ? req.getCategory() : TaskCategory.OTHER)
                .priority(req.getPriority())
                .startDate(req.getStartDate())
                .startTime(req.getStartTime())
                .endDate(req.getEndDate())
                .endTime(req.getEndTime())
                .build();

        task = taskRepository.save(task);
        log.info("Task created: {} assigned to {}", task.getTitle(), assignee.getEmail());

        // Notify assignee
        if (!assignee.getId().equals(createdById)) {
            notificationService.send(assignee.getId(), NotificationType.TASK_ASSIGNED,
                    "Yeni görev atandı: " + task.getTitle(),
                    creator.getPerson() != null ? creator.getPerson().getFullName() + " size bir görev atadı" : "Size bir görev atandı",
                    "TASK", task.getId());
        }

        // Notify company owners
        if (company != null) {
            notifyCompanyMembers(company.getId(), createdById, NotificationType.TASK_ASSIGNED,
                    "Yeni görev oluşturuldu: " + task.getTitle(),
                    (assignee.getPerson() != null ? assignee.getPerson().getFullName() : "Bir kullanıcı") + " görevlendirildi",
                    "TASK", task.getId());
        }

        return mapper.toResponse(task);
    }

    @Transactional(readOnly = true)
    public Page<TaskResponse> getTasksByCompany(UUID companyId, Pageable pageable, UUID userId) {
        accessPolicy.requireCompanyAccess(getUserOrThrow(userId), companyId);
        return taskRepository.findByCompanyId(companyId, pageable).map(mapper::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<TaskResponse> getTasksByCompanyAndStatus(UUID companyId, TaskStatus status, Pageable pageable, UUID userId) {
        accessPolicy.requireCompanyAccess(getUserOrThrow(userId), companyId);
        return taskRepository.findByCompanyIdAndStatus(companyId, status, pageable).map(mapper::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<TaskResponse> getTasksByAssignee(UUID userId, Pageable pageable) {
        return taskRepository.findByAssignedToId(userId, pageable).map(mapper::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<TaskResponse> getAllTasks(Pageable pageable, UUID userId) {
        UserProfile user = getUserOrThrow(userId);
        if (user.getGlobalRole() == GlobalRole.ADMIN) {
            return taskRepository.findAll(pageable).map(mapper::toResponse);
        }
        // Non-admin users only see tasks assigned to them
        return taskRepository.findByAssignedToId(userId, pageable).map(mapper::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<TaskResponse> getTasksByStatus(TaskStatus status, Pageable pageable, UUID userId) {
        UserProfile user = getUserOrThrow(userId);
        if (user.getGlobalRole() == GlobalRole.ADMIN) {
            return taskRepository.findByStatus(status, pageable).map(mapper::toResponse);
        }
        // Non-admin users only see their own tasks with given status
        return taskRepository.findByAssignedToIdAndStatus(userId, status, pageable).map(mapper::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<TaskResponse> getTasksByAssigneeAndStatus(UUID userId, TaskStatus status, Pageable pageable) {
        return taskRepository.findByAssignedToIdAndStatus(userId, status, pageable).map(mapper::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<TaskResponse> getClientTasks(UUID userId, TaskStatus status, Pageable pageable) {
        UserProfile user = getUserOrThrow(userId);
        List<UUID> companyIds = accessPolicy.accessibleCompanyIds(user);
        if (companyIds.isEmpty()) {
            return Page.empty(pageable);
        }
        Page<Task> tasks = status == null
                ? taskRepository.findByCompanyIdIn(companyIds, pageable)
                : taskRepository.findByCompanyIdInAndStatus(companyIds, status, pageable);
        return tasks.map(mapper::toResponse);
    }

    @Transactional(readOnly = true)
    public TaskResponse getTaskById(UUID taskId, UUID userId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Gorev bulunamadi"));
        UserProfile user = getUserOrThrow(userId);
        accessPolicy.requireRead(task, user);
        return mapper.toResponse(task);
    }

    @Transactional(readOnly = true)
    public TaskResponse getTaskByIdForUser(UUID taskId, UUID userId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Gorev bulunamadi"));
        accessPolicy.requireRead(task, getUserOrThrow(userId));
        return mapper.toResponse(task);
    }

    @Transactional
    public TaskResponse updateTask(UUID taskId, UpdateTaskRequest req, UUID userId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Gorev bulunamadi"));
        UserProfile user = getUserOrThrow(userId);
        accessPolicy.requireUpdate(task, user);

        if (req.getTitle() != null) {
            task.setTitle(req.getTitle());
        }
        if (req.getDescription() != null) {
            task.setDescription(req.getDescription());
        }
        if (req.getStatus() != null) {
            TaskStatus oldStatus = task.getStatus();
            task.setStatus(req.getStatus());
            if (req.getStatus() == TaskStatus.DONE) {
                task.setCompletedAt(Instant.now());
                // Auto-complete linked PR project phase
                phaseCompletionService.completeLinkedPhase(task);
            } else {
                task.setCompletedAt(null);
            }

            // Notify on status change
            if (oldStatus != req.getStatus() && task.getCompany() != null) {
                String statusLabel = switch (req.getStatus()) {
                    case DONE -> "tamamlandı";
                    case IN_PROGRESS -> "başladı";
                    case OVERDUE -> "gecikti";
                    default -> req.getStatus().name();
                };
                NotificationType nType = req.getStatus() == TaskStatus.DONE ? NotificationType.TASK_COMPLETED : NotificationType.TASK_STATUS_CHANGED;
                notifyCompanyMembers(task.getCompany().getId(), userId, nType,
                        "Görev " + statusLabel + ": " + task.getTitle(), null,
                        "TASK", task.getId());

                // Also notify task creator if different
                if (!task.getCreatedBy().getId().equals(userId)) {
                    notificationService.send(task.getCreatedBy().getId(), nType,
                            "Görev " + statusLabel + ": " + task.getTitle(), null,
                            "TASK", task.getId());
                }
            }
        }
        if (req.getCategory() != null) {
            task.setCategory(req.getCategory());
        }
        if (req.getPriority() != null) {
            task.setPriority(req.getPriority());
        }
        if (req.getAssignedToId() != null) {
            UserProfile assignee = getUserOrThrow(req.getAssignedToId());
            UUID companyId = req.getCompanyId() != null
                    ? req.getCompanyId()
                    : task.getCompany() != null ? task.getCompany().getId() : null;
            accessPolicy.requireAssignable(user, assignee, companyId);
            task.setAssignedTo(assignee);
        }
        if (req.getCompanyId() != null) {
            Company company = companyRepository.findById(req.getCompanyId())
                    .orElseThrow(() -> new RuntimeException("Sirket bulunamadi"));
            accessPolicy.requireCompanyAccess(user, company.getId());
            accessPolicy.requireAssignable(user, task.getAssignedTo(), company.getId());
            task.setCompany(company);
        }
        if (req.getStartDate() != null) {
            task.setStartDate(req.getStartDate());
        }
        if (req.getStartTime() != null) {
            task.setStartTime(req.getStartTime());
        }
        if (req.getEndDate() != null) {
            task.setEndDate(req.getEndDate());
        }
        if (req.getEndTime() != null) {
            task.setEndTime(req.getEndTime());
        }

        task = taskRepository.save(task);
        log.info("Task updated: {}", task.getTitle());
        return mapper.toResponse(task);
    }

    @Transactional
    public void deleteTask(UUID taskId, UUID userId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Gorev bulunamadi"));
        UserProfile user = getUserOrThrow(userId);
        accessPolicy.requireDelete(task, user);
        taskRepository.delete(task);
    }

    private void notifyCompanyMembers(UUID companyId, UUID excludeUserId, NotificationType type,
                                       String title, String message, String refType, UUID refId) {
        List<UUID> memberIds = membershipRepository.findCompanyUserIdsByCompanyId(companyId);
        for (UUID memberId : memberIds) {
            if (!memberId.equals(excludeUserId)) {
                notificationService.send(memberId, type, title, message, refType, refId);
            }
        }
    }

    private UserProfile getUserOrThrow(UUID userId) {
        return userProfileRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Kullanici bulunamadi"));
    }

}
