package com.fogistanbul.crm.task.web;

import com.fogistanbul.crm.messaging.dto.ContactResponse;
import com.fogistanbul.crm.entity.enums.ActivityAction;
import com.fogistanbul.crm.entity.enums.TaskStatus;
import com.fogistanbul.crm.service.ActivityLogService;
import com.fogistanbul.crm.task.application.TaskNoteService;
import com.fogistanbul.crm.task.application.TaskAssignableUserService;
import com.fogistanbul.crm.task.application.TaskService;
import com.fogistanbul.crm.task.dto.CreateTaskNoteRequest;
import com.fogistanbul.crm.task.dto.CreateTaskRequest;
import com.fogistanbul.crm.task.dto.TaskNoteResponse;
import com.fogistanbul.crm.task.dto.TaskResponse;
import com.fogistanbul.crm.task.dto.UpdateTaskRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/staff/tasks")
@RequiredArgsConstructor
public class StaffTaskController {

    private final TaskService taskService;
    private final TaskNoteService taskNoteService;
    private final TaskAssignableUserService assignableUserService;
    private final ActivityLogService activityLogService;

    @PostMapping
    public ResponseEntity<TaskResponse> create(
            @Valid @RequestBody CreateTaskRequest request,
            Authentication auth) {
        UUID userId = (UUID) auth.getPrincipal();
        TaskResponse created = taskService.createTask(request, userId);
        activityLogService.log(userId, ActivityAction.CREATE, "TASK",
                created.getId(), created.getTitle(),
                Map.of("assignedTo", created.getAssignedToName(),
                        "company", created.getCompanyName() == null ? "" : created.getCompanyName()));
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(created);
    }

    @GetMapping
    public Page<TaskResponse> getAll(
            @RequestParam(required = false) TaskStatus status,
            @PageableDefault(size = 20) Pageable pageable,
            Authentication auth) {
        UUID userId = (UUID) auth.getPrincipal();
        if (status != null) {
            return taskService.getTasksByStatus(status, pageable, userId);
        }
        return taskService.getAllTasks(pageable, userId);
    }

    @GetMapping("/my")
    public Page<TaskResponse> getMyTasks(
            Authentication auth,
            @PageableDefault(size = 20) Pageable pageable) {
        UUID userId = (UUID) auth.getPrincipal();
        return taskService.getTasksByAssignee(userId, pageable);
    }

    @GetMapping("/company/{companyId}")
    public Page<TaskResponse> getByCompany(
            @PathVariable UUID companyId,
            @PageableDefault(size = 20) Pageable pageable,
            Authentication auth) {
        UUID userId = (UUID) auth.getPrincipal();
        return taskService.getTasksByCompany(companyId, pageable, userId);
    }

    @GetMapping("/{id}")
    public TaskResponse getById(@PathVariable UUID id, Authentication auth) {
        UUID userId = (UUID) auth.getPrincipal();
        return taskService.getTaskById(id, userId);
    }

    @PutMapping("/{id}")
    public TaskResponse update(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateTaskRequest request,
            Authentication auth) {
        UUID userId = (UUID) auth.getPrincipal();
        TaskResponse updated = taskService.updateTask(id, request, userId);
        ActivityAction action = request.getStatus() != null ? ActivityAction.STATUS_CHANGE : ActivityAction.UPDATE;
        Map<String, Object> details = request.getStatus() != null
                ? Map.of("status", request.getStatus().name(), "title", updated.getTitle())
                : Map.of("title", updated.getTitle());
        activityLogService.log(userId, action, "TASK",
                id, updated.getTitle(), details);
        return updated;
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id, Authentication auth) {
        UUID userId = (UUID) auth.getPrincipal();
        activityLogService.log(userId, ActivityAction.DELETE, "TASK", id, null, Map.of());
        taskService.deleteTask(id, userId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/assignable-users")
    public List<ContactResponse> getAssignableUsers(
            @RequestParam(required = false) UUID companyId,
            Authentication auth) {
        UUID userId = (UUID) auth.getPrincipal();
        return assignableUserService.getAssignableUsers(userId, companyId);
    }

    // ─── Task Notes ─────────────────────────────────────────────

    @GetMapping("/{taskId}/notes")
    public List<TaskNoteResponse> getNotes(@PathVariable UUID taskId, Authentication auth) {
        UUID userId = (UUID) auth.getPrincipal();
        return taskNoteService.getTaskNotes(taskId, userId);
    }

    @PostMapping("/{taskId}/notes")
    public ResponseEntity<TaskNoteResponse> addNote(
            @PathVariable UUID taskId,
            @Valid @RequestBody CreateTaskNoteRequest request,
            Authentication auth) {
        UUID userId = (UUID) auth.getPrincipal();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(taskNoteService.addTaskNote(taskId, request, userId));
    }

    @DeleteMapping("/notes/{noteId}")
    public ResponseEntity<Void> deleteNote(@PathVariable UUID noteId, Authentication auth) {
        UUID userId = (UUID) auth.getPrincipal();
        taskNoteService.deleteTaskNote(noteId, userId);
        return ResponseEntity.noContent().build();
    }
}
