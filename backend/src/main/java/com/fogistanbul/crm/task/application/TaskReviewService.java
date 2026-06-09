package com.fogistanbul.crm.task.application;

import com.fogistanbul.crm.task.dto.CreateTaskReviewRequest;
import com.fogistanbul.crm.task.dto.TaskReviewResponse;
import com.fogistanbul.crm.entity.Task;
import com.fogistanbul.crm.entity.TaskReview;
import com.fogistanbul.crm.entity.UserProfile;
import com.fogistanbul.crm.repository.TaskRepository;
import com.fogistanbul.crm.repository.TaskReviewRepository;
import com.fogistanbul.crm.repository.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

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
                .orElseThrow(() -> new RuntimeException("Gorev bulunamadi"));

        UserProfile reviewer = userProfileRepository.findById(reviewerId)
                .orElseThrow(() -> new RuntimeException("Kullanici bulunamadi"));
        accessPolicy.requireRead(task, reviewer);

        if (reviewRepository.existsByTaskIdAndReviewerId(req.getTaskId(), reviewerId)) {
            throw new RuntimeException("Bu gorev icin zaten puanlama yapilmis");
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
                .orElseThrow(() -> new RuntimeException("Gorev bulunamadi"));
        UserProfile requester = userProfileRepository.findById(requesterId)
                .orElseThrow(() -> new RuntimeException("Kullanici bulunamadi"));
        accessPolicy.requireRead(task, requester);

        return reviewRepository.findByTaskId(taskId).stream()
                .map(mapper::toResponse)
                .toList();
    }
}
