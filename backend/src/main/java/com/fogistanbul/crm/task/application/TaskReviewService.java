package com.fogistanbul.crm.task.application;

import com.fogistanbul.crm.task.dto.CreateTaskReviewRequest;
import com.fogistanbul.crm.task.dto.TaskReviewResponse;
import com.fogistanbul.crm.entity.Task;
import com.fogistanbul.crm.entity.TaskReview;
import com.fogistanbul.crm.entity.UserProfile;
import com.fogistanbul.crm.repository.TaskRepository;
import com.fogistanbul.crm.repository.TaskReviewRepository;
import com.fogistanbul.crm.repository.UserProfileRepository;
import com.fogistanbul.crm.exception.ApiException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TaskReviewService {

    private final TaskReviewRepository reviewRepository;
    private final TaskRepository taskRepository;
    private final UserProfileRepository userProfileRepository;
    private final TaskAccessPolicy accessPolicy;
    private final TaskMapper mapper;

    @Transactional
    public TaskReviewResponse createReview(CreateTaskReviewRequest req, UUID reviewerId) {
        Task task = taskRepository.findById(req.getTaskId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "TASK_NOT_FOUND", "Görev bulunamadı"));

        UserProfile reviewer = userProfileRepository.findById(reviewerId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "Kullanıcı bulunamadı"));
        accessPolicy.requireRead(task, reviewer);

        if (reviewRepository.existsByTaskIdAndReviewerId(req.getTaskId(), reviewerId)) {
            throw new ApiException(HttpStatus.CONFLICT, "TASK_ALREADY_REVIEWED", "Bu görev için zaten puanlama yapılmış");
        }

        TaskReview review = TaskReview.builder()
                .task(task)
                .reviewer(reviewer)
                .score(req.getScore())
                .comment(req.getComment())
                .build();

        review = reviewRepository.save(review);
        log.info("Task review created for task {} by user {}", task.getTitle(), reviewer.getEmail());
        return mapper.toResponse(review);
    }

    @Transactional(readOnly = true)
    public List<TaskReviewResponse> getReviewsByTask(UUID taskId, UUID requesterId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "TASK_NOT_FOUND", "Görev bulunamadı"));
        UserProfile requester = userProfileRepository.findById(requesterId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "Kullanıcı bulunamadı"));
        accessPolicy.requireRead(task, requester);

        return reviewRepository.findByTaskId(taskId).stream()
                .map(mapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public Map<UUID, List<TaskReviewResponse>> getReviewsByTasks(List<UUID> taskIds, UUID requesterId) {
        if (taskIds == null || taskIds.isEmpty()) {
            return Map.of();
        }

        List<UUID> distinctTaskIds = taskIds.stream().distinct().toList();
        UserProfile requester = userProfileRepository.findById(requesterId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "Kullanıcı bulunamadı"));

        List<Task> tasks = taskRepository.findAllById(distinctTaskIds);
        if (tasks.size() != distinctTaskIds.size()) {
            throw new ApiException(HttpStatus.NOT_FOUND, "TASK_NOT_FOUND", "Görev bulunamadı");
        }

        tasks.forEach(task -> accessPolicy.requireRead(task, requester));

        Map<UUID, List<TaskReviewResponse>> reviewsByTask = reviewRepository.findByTaskIdIn(distinctTaskIds).stream()
                .map(mapper::toResponse)
                .collect(Collectors.groupingBy(TaskReviewResponse::getTaskId));

        distinctTaskIds.forEach(taskId -> reviewsByTask.putIfAbsent(taskId, List.of()));
        return reviewsByTask;
    }
}
