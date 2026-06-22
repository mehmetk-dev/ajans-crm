package com.fogistanbul.crm.task.web;

import com.fogistanbul.crm.task.application.TaskReviewService;
import com.fogistanbul.crm.task.dto.CreateTaskReviewRequest;
import com.fogistanbul.crm.task.dto.TaskReviewResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
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
public class ClientTaskReviewController {

    private final TaskReviewService taskReviewService;

    @PostMapping("/{taskId}/review")
    public ResponseEntity<TaskReviewResponse> reviewTask(
            @PathVariable UUID taskId,
            @Valid @RequestBody CreateTaskReviewRequest request,
            Authentication auth) {
        UUID userId = (UUID) auth.getPrincipal();
        request.setTaskId(taskId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(taskReviewService.createReview(request, userId));
    }

    @GetMapping("/{taskId}/reviews")
    public List<TaskReviewResponse> getReviews(@PathVariable UUID taskId, Authentication auth) {
        UUID userId = (UUID) auth.getPrincipal();
        return taskReviewService.getReviewsByTask(taskId, userId);
    }

    @GetMapping("/reviews/batch")
    public Map<UUID, List<TaskReviewResponse>> getReviewsBatch(
            @RequestParam List<UUID> taskIds,
            Authentication auth) {
        UUID userId = (UUID) auth.getPrincipal();
        return taskReviewService.getReviewsByTasks(taskIds, userId);
    }
}
