package com.fogistanbul.crm.files.application;

import com.fogistanbul.crm.entity.FileAttachment;
import com.fogistanbul.crm.entity.UserProfile;
import com.fogistanbul.crm.entity.enums.GlobalRole;
import com.fogistanbul.crm.files.dto.FileAttachmentResponse;
import com.fogistanbul.crm.repository.FileAttachmentRepository;
import com.fogistanbul.crm.repository.UserProfileRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FileServiceTest {

    @Mock FileAttachmentRepository fileAttachmentRepository;
    @Mock UserProfileRepository userProfileRepository;
    @Mock FileAccessPolicy accessPolicy;
    @Mock FileMapper mapper;

    @InjectMocks FileService fileService;

    @Test
    void getByEntity_delegates_to_repository_and_maps() {
        UUID userId = UUID.randomUUID();
        UUID entityId = UUID.randomUUID();
        UserProfile user = user(GlobalRole.AGENCY_STAFF, userId);
        FileAttachment attachment = attachment(entityId);
        FileAttachmentResponse expected = response(attachment.getId());

        when(userProfileRepository.findById(userId)).thenReturn(Optional.of(user));
        when(fileAttachmentRepository.findByEntityTypeAndEntityIdOrderByCreatedAtDesc("TASK", entityId))
                .thenReturn(List.of(attachment));
        when(mapper.toResponse(attachment)).thenReturn(expected);

        List<FileAttachmentResponse> result = fileService.getByEntity("TASK", entityId, userId);

        assertThat(result).containsExactly(expected);
        verify(accessPolicy).requireEntityAccess("TASK", entityId, user);
    }

    @Test
    void delete_calls_access_policy_and_removes_record() {
        UUID userId = UUID.randomUUID();
        UUID fileId = UUID.randomUUID();
        UserProfile user = user(GlobalRole.AGENCY_STAFF, userId);

        FileAttachment attachment = attachment(UUID.randomUUID());
        attachment.setId(fileId);
        attachment.setUploadedBy(user);
        attachment.setStoragePath("/tmp/nonexistent_test_file.txt");

        when(fileAttachmentRepository.findById(fileId)).thenReturn(Optional.of(attachment));
        when(userProfileRepository.findById(userId)).thenReturn(Optional.of(user));

        fileService.delete(fileId, userId);

        verify(accessPolicy).requireDeleteAccess(user, userId);
        verify(fileAttachmentRepository).delete(attachment);
    }

    private UserProfile user(GlobalRole role, UUID id) {
        UserProfile u = new UserProfile();
        u.setId(id);
        u.setGlobalRole(role);
        u.setEmail("test@example.com");
        return u;
    }

    private FileAttachment attachment(UUID entityId) {
        FileAttachment a = new FileAttachment();
        a.setId(UUID.randomUUID());
        a.setOriginalName("test.jpg");
        a.setContentType("image/jpeg");
        a.setFileSize(1024L);
        a.setEntityType("TASK");
        a.setEntityId(entityId);
        a.setCreatedAt(Instant.now());
        return a;
    }

    private FileAttachmentResponse response(UUID id) {
        return FileAttachmentResponse.builder()
                .id(id)
                .originalName("test.jpg")
                .contentType("image/jpeg")
                .fileSize(1024L)
                .entityType("TASK")
                .entityId(UUID.randomUUID())
                .createdAt(Instant.now())
                .build();
    }
}
