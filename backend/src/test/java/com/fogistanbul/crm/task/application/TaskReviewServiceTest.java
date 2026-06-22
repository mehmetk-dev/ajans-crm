package com.fogistanbul.crm.task.application;

import com.fogistanbul.crm.entity.Task;
import com.fogistanbul.crm.entity.TaskReview;
import com.fogistanbul.crm.entity.UserProfile;
import com.fogistanbul.crm.repository.TaskRepository;
import com.fogistanbul.crm.repository.TaskReviewRepository;
import com.fogistanbul.crm.repository.UserProfileRepository;
import com.fogistanbul.crm.task.dto.TaskReviewResponse;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TaskReviewServiceTest {

    @Mock
    private TaskReviewRepository reviewRepository;
    @Mock
    private TaskRepository taskRepository;
    @Mock
    private UserProfileRepository userProfileRepository;
    @Mock
    private TaskAccessPolicy accessPolicy;
    @Mock
    private TaskMapper mapper;

    @Test
    void batchesReviewsAfterCheckingAccessForEachTask() {
        UUID requesterId = UUID.randomUUID();
        UUID taskId = UUID.randomUUID();
        UserProfile requester = UserProfile.builder().id(requesterId).build();
        Task task = Task.builder().id(taskId).title("Done task").build();
        TaskReview review = TaskReview.builder().id(UUID.randomUUID()).task(task).score(5).build();
        TaskReviewResponse response = TaskReviewResponse.builder()
                .id(review.getId())
                .taskId(taskId)
                .score(5)
                .build();
        TaskReviewService service = new TaskReviewService(
                reviewRepository,
                taskRepository,
                userProfileRepository,
                accessPolicy,
                mapper
        );

        when(userProfileRepository.findById(requesterId)).thenReturn(Optional.of(requester));
        when(taskRepository.findAllById(List.of(taskId))).thenReturn(List.of(task));
        when(reviewRepository.findByTaskIdIn(List.of(taskId))).thenReturn(List.of(review));
        when(mapper.toResponse(review)).thenReturn(response);

        var result = service.getReviewsByTasks(List.of(taskId), requesterId);

        assertThat(result).containsKey(taskId);
        assertThat(result.get(taskId)).containsExactly(response);
        verify(accessPolicy).requireRead(task, requester);
        verify(reviewRepository).findByTaskIdIn(List.of(taskId));
    }
}
