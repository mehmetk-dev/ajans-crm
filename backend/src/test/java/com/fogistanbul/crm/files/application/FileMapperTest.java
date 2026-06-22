package com.fogistanbul.crm.files.application;

import com.fogistanbul.crm.entity.FileAttachment;
import com.fogistanbul.crm.entity.Person;
import com.fogistanbul.crm.entity.UserProfile;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class FileMapperTest {

    private final FileMapper mapper = new FileMapper();

    @Test
    void mapsUploaderAvatarUrl() {
        UserProfile uploader = UserProfile.builder()
                .id(UUID.randomUUID())
                .email("file@test.com")
                .person(Person.builder()
                        .fullName("Dosya Sahibi")
                        .avatarUrl("/avatar/file.png")
                        .build())
                .build();
        FileAttachment file = FileAttachment.builder()
                .id(UUID.randomUUID())
                .originalName("brief.pdf")
                .storedName("stored.pdf")
                .contentType("application/pdf")
                .fileSize(1024L)
                .storagePath("/tmp/stored.pdf")
                .uploadedBy(uploader)
                .entityType("TASK")
                .entityId(UUID.randomUUID())
                .createdAt(Instant.parse("2026-06-01T10:00:00Z"))
                .build();

        var response = mapper.toResponse(file);

        assertThat(response.getUploadedByAvatarUrl()).isEqualTo("/avatar/file.png");
    }
}
