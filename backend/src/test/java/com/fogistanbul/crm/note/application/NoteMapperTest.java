package com.fogistanbul.crm.note.application;

import com.fogistanbul.crm.entity.Person;
import com.fogistanbul.crm.entity.UserProfile;
import com.fogistanbul.crm.note.domain.Note;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class NoteMapperTest {

    private final NoteMapper mapper = new NoteMapper();

    @Test
    void mapsUserAvatarUrl() {
        UserProfile user = UserProfile.builder()
                .id(UUID.randomUUID())
                .email("note@test.com")
                .person(Person.builder()
                        .fullName("Not Sahibi")
                        .avatarUrl("/avatar/note.png")
                        .build())
                .build();
        Note note = Note.builder()
                .id(UUID.randomUUID())
                .user(user)
                .content("Not")
                .isOpen(true)
                .noteDate(LocalDate.of(2026, 6, 1))
                .createdAt(Instant.parse("2026-06-01T10:00:00Z"))
                .build();

        var response = mapper.toResponse(note);

        assertThat(response.getUserAvatarUrl()).isEqualTo("/avatar/note.png");
    }
}
