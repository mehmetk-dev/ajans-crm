package com.fogistanbul.crm.task.application;

import com.fogistanbul.crm.entity.Company;
import com.fogistanbul.crm.entity.Task;
import com.fogistanbul.crm.entity.UserProfile;
import com.fogistanbul.crm.entity.enums.GlobalRole;
import com.fogistanbul.crm.entity.enums.TaskCategory;
import com.fogistanbul.crm.entity.enums.TaskStatus;
import com.fogistanbul.crm.prproject.application.PrProjectProgressService;
import com.fogistanbul.crm.repository.CompanyRepository;
import com.fogistanbul.crm.repository.TaskNoteRepository;
import com.fogistanbul.crm.repository.TaskRepository;
import com.fogistanbul.crm.repository.TaskReviewRepository;
import com.fogistanbul.crm.repository.UserProfileRepository;
import com.fogistanbul.crm.task.dto.CreateTaskRequest;
import com.fogistanbul.crm.task.dto.TaskResponse;
import com.fogistanbul.crm.task.dto.UpdateTaskRequest;
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
    private final TaskNoteRepository taskNoteRepository;
    private final TaskReviewRepository taskReviewRepository;
    private final CompanyRepository companyRepository;
    private final UserProfileRepository userProfileRepository;
    private final TaskAccessPolicy accessPolicy;
    private final TaskMapper mapper;
    private final PrProjectProgressService prProjectProgressService;
    private final TaskNotificationPublisher notificationPublisher;

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

        Task task = taskRepository.save(Task.builder()
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
                .build());
        log.info("Task created: {} assigned to {}", task.getTitle(), assignee.getEmail());

        notificationPublisher.notifyAssignee(task, creator);
        notificationPublisher.notifyCompanyMembersAboutNew(task, assignee, createdById);

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
        return taskRepository.findByAssignedToId(userId, pageable).map(mapper::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<TaskResponse> getTasksByStatus(TaskStatus status, Pageable pageable, UUID userId) {
        UserProfile user = getUserOrThrow(userId);
        if (user.getGlobalRole() == GlobalRole.ADMIN) {
            return taskRepository.findByStatus(status, pageable).map(mapper::toResponse);
        }
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
        accessPolicy.requireRead(task, getUserOrThrow(userId));
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

        applyUpdates(task, req, user);

        if (req.getStatus() != null && task.getStatus() == TaskStatus.DONE) {
            task.setCompletedAt(Instant.now());
            prProjectProgressService.completeFromTask(task);
        } else if (req.getStatus() != null) {
            task.setCompletedAt(null);
        }

        if (req.getStatus() != null) {
            notificationPublisher.notifyStatusChange(task, userId);
        }

        task = taskRepository.save(task);
        log.info("Task updated: {}", task.getTitle());
        return mapper.toResponse(task);
    }

    private void applyUpdates(Task task, UpdateTaskRequest req, UserProfile user) {
        if (req.getTitle() != null) task.setTitle(req.getTitle());
        if (req.getDescription() != null) task.setDescription(req.getDescription());
        if (req.getStatus() != null) task.setStatus(req.getStatus());
        if (req.getCategory() != null) task.setCategory(req.getCategory());
        if (req.getPriority() != null) task.setPriority(req.getPriority());
        if (req.getStartDate() != null) task.setStartDate(req.getStartDate());
        if (req.getStartTime() != null) task.setStartTime(req.getStartTime());
        if (req.getEndDate() != null) task.setEndDate(req.getEndDate());
        if (req.getEndTime() != null) task.setEndTime(req.getEndTime());

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
    }

    @Transactional
    public void deleteTask(UUID taskId, UUID userId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Gorev bulunamadi"));
        accessPolicy.requireDelete(task, getUserOrThrow(userId));
        taskReviewRepository.deleteByTaskId(taskId);
        taskNoteRepository.deleteByTaskId(taskId);
        taskRepository.delete(task);
    }

    private UserProfile getUserOrThrow(UUID userId) {
        return userProfileRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Kullanici bulunamadi"));
    }
}
