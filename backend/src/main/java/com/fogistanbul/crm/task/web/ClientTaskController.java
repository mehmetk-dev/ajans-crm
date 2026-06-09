package com.fogistanbul.crm.task.web;

import com.fogistanbul.crm.task.dto.TaskResponse;
import com.fogistanbul.crm.entity.enums.TaskStatus;
import com.fogistanbul.crm.task.application.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/client/tasks")
@RequiredArgsConstructor
public class ClientTaskController {

    private final TaskService taskService;

    @GetMapping("/my")
    public ResponseEntity<Page<TaskResponse>> getMyTasks(
            Authentication auth,
            @RequestParam(required = false) TaskStatus status,
            @PageableDefault(size = 50) Pageable pageable) {

        UUID userId = (UUID) auth.getPrincipal();
        return ResponseEntity.ok(taskService.getClientTasks(userId, status, pageable));
    }

    @GetMapping("/{id}")
    public TaskResponse getById(@PathVariable UUID id, Authentication auth) {
        UUID userId = (UUID) auth.getPrincipal();
        return taskService.getTaskByIdForUser(id, userId);
    }
}
