package com.fogistanbul.crm.task.application;

import com.fogistanbul.crm.entity.Person;
import com.fogistanbul.crm.entity.Task;
import com.fogistanbul.crm.entity.TaskNote;
import com.fogistanbul.crm.entity.UserProfile;
import com.fogistanbul.crm.entity.enums.TaskStatus;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class TaskMapperTest {

    private final TaskMapper mapper = new TaskMapper();

    @Test
    void mapsAssigneeCreatorAndNoteAuthorAvatarUrls() {
        UserProfile assignee = user("assignee@test.com", "Ali Atanan", "/avatar/assignee.png");
        UserProfile creator = user("creator@test.com", "Ayse Olusturan", "/avatar/creator.png");
        Task task = Task.builder()
                .id(UUID.randomUUID())
                .assignedTo(assignee)
                .createdBy(creator)
                .title("Avatar gorevi")
                .status(TaskStatus.TODO)
                .createdAt(Instant.parse("2026-06-01T10:00:00Z"))
                .updatedAt(Instant.parse("2026-06-01T10:00:00Z"))
                .build();
        TaskNote note = TaskNote.builder()
                .id(UUID.randomUUID())
                .task(task)
                .author(creator)
                .content("Not")
                .createdAt(Instant.parse("2026-06-01T11:00:00Z"))
                .build();

        var response = mapper.toResponse(task);
        var noteResponse = mapper.toResponse(note);

        assertThat(response.getAssignedToAvatarUrl()).isEqualTo("/avatar/assignee.png");
        assertThat(response.getCreatedByAvatarUrl()).isEqualTo("/avatar/creator.png");
        assertThat(noteResponse.getAuthorAvatarUrl()).isEqualTo("/avatar/creator.png");
    }

    private UserProfile user(String email, String fullName, String avatarUrl) {
        return UserProfile.builder()
                .id(UUID.randomUUID())
                .email(email)
                .person(Person.builder()
                        .fullName(fullName)
                        .avatarUrl(avatarUrl)
                        .build())
                .build();
    }
}
