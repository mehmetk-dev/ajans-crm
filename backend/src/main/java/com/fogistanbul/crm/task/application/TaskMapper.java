package com.fogistanbul.crm.task.application;

import com.fogistanbul.crm.entity.Task;
import com.fogistanbul.crm.entity.TaskNote;
import com.fogistanbul.crm.entity.TaskReview;
import com.fogistanbul.crm.entity.UserProfile;
import com.fogistanbul.crm.task.dto.TaskNoteResponse;
import com.fogistanbul.crm.task.dto.TaskResponse;
import com.fogistanbul.crm.task.dto.TaskReviewResponse;
import org.springframework.stereotype.Component;

@Component
public class TaskMapper {

    public TaskResponse toResponse(Task task) {
        return TaskResponse.builder()
                .id(task.getId())
                .companyId(task.getCompany() != null ? task.getCompany().getId() : null)
                .companyName(task.getCompany() != null ? task.getCompany().getName() : null)
                .assignedToId(task.getAssignedTo().getId())
                .assignedToName(displayName(task.getAssignedTo()))
                .assignedToAvatarUrl(avatarUrl(task.getAssignedTo()))
                .createdById(task.getCreatedBy().getId())
                .createdByName(displayName(task.getCreatedBy()))
                .createdByAvatarUrl(avatarUrl(task.getCreatedBy()))
                .title(task.getTitle())
                .description(task.getDescription())
                .category(task.getCategory())
                .priority(task.getPriority())
                .status(task.getStatus())
                .startDate(task.getStartDate())
                .startTime(task.getStartTime())
                .endDate(task.getEndDate())
                .endTime(task.getEndTime())
                .completedAt(task.getCompletedAt())
                .createdAt(task.getCreatedAt())
                .updatedAt(task.getUpdatedAt())
                .build();
    }

    public TaskNoteResponse toResponse(TaskNote note) {
        return TaskNoteResponse.builder()
                .id(note.getId())
                .taskId(note.getTask().getId())
                .authorId(note.getAuthor().getId())
                .authorName(displayName(note.getAuthor()))
                .authorAvatarUrl(avatarUrl(note.getAuthor()))
                .content(note.getContent())
                .createdAt(note.getCreatedAt())
                .build();
    }

    public TaskReviewResponse toResponse(TaskReview review) {
        return TaskReviewResponse.builder()
                .id(review.getId())
                .taskId(review.getTask().getId())
                .taskTitle(review.getTask().getTitle())
                .reviewerId(review.getReviewer().getId())
                .reviewerName(displayName(review.getReviewer()))
                .reviewerAvatarUrl(avatarUrl(review.getReviewer()))
                .score(review.getScore())
                .comment(review.getComment())
                .createdAt(review.getCreatedAt())
                .build();
    }

    private String displayName(UserProfile user) {
        return user.getPerson() != null ? user.getPerson().getFullName() : user.getEmail();
    }

    private String avatarUrl(UserProfile user) {
        return user.getPerson() != null ? user.getPerson().getAvatarUrl() : null;
    }
}
