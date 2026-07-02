package com.fogistanbul.crm.task.web;

import com.fogistanbul.crm.company.application.PermissionService;
import com.fogistanbul.crm.messaging.dto.ContactResponse;
import com.fogistanbul.crm.task.application.TaskAssignableUserService;
import com.fogistanbul.crm.task.dto.CreateTaskRequest;
import com.fogistanbul.crm.task.dto.TaskResponse;
import com.fogistanbul.crm.entity.enums.TaskStatus;
import com.fogistanbul.crm.task.application.TaskService;
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
@RequestMapping("/api/client/tasks")
@RequiredArgsConstructor
public class ClientTaskController {

    private final TaskService taskService;
    private final TaskAssignableUserService assignableUserService;
    private final PermissionService permissionService;

    @PostMapping
    public ResponseEntity<TaskResponse> create(
            @Valid @RequestBody CreateTaskRequest request,
            Authentication auth) {
        UUID userId = (UUID) auth.getPrincipal();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(taskService.createClientTask(request, userId));
    }

    @GetMapping("/my")
    public ResponseEntity<Page<TaskResponse>> getMyTasks(
            Authentication auth,
            @RequestParam(required = false) TaskStatus status,
            @PageableDefault(size = 50) Pageable pageable) {

        UUID userId = (UUID) auth.getPrincipal();
        return ResponseEntity.ok(taskService.getClientTasks(userId, status, pageable));
    }

    @GetMapping("/assignable-users")
    public List<ContactResponse> getAssignableUsers(
            @RequestParam(required = false) UUID companyId,
            Authentication auth) {
        UUID userId = (UUID) auth.getPrincipal();
        return assignableUserService.getAssignableUsers(userId, companyId);
    }

    @GetMapping("/notification-recipients")
    public List<ContactResponse> getNotificationRecipients(
            @RequestParam(required = false) UUID companyId,
            Authentication auth) {
        UUID userId = (UUID) auth.getPrincipal();
        return assignableUserService.getNotificationRecipients(userId, companyId);
    }

    @GetMapping("/can-create")
    public Map<String, Boolean> canCreate(
            @RequestParam UUID companyId,
            Authentication auth) {
        UUID userId = (UUID) auth.getPrincipal();
        return Map.of("canCreate", permissionService.hasFullPermission(userId, companyId, "tasks.create"));
    }

    @GetMapping("/{id}")
    public TaskResponse getById(@PathVariable UUID id, Authentication auth) {
        UUID userId = (UUID) auth.getPrincipal();
        return taskService.getTaskByIdForUser(id, userId);
    }
}
