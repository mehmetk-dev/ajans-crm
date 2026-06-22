package com.fogistanbul.crm.files.application;

import com.fogistanbul.crm.entity.FileAttachment;
import com.fogistanbul.crm.files.dto.FileAttachmentResponse;
import org.springframework.stereotype.Component;

@Component
public class FileMapper {

    public FileAttachmentResponse toResponse(FileAttachment f) {
        return FileAttachmentResponse.builder()
                .id(f.getId())
                .originalName(f.getOriginalName())
                .contentType(f.getContentType())
                .fileSize(f.getFileSize())
                .uploadedById(f.getUploadedBy().getId())
                .uploadedByName(f.getUploadedBy().getPerson() != null
                        ? f.getUploadedBy().getPerson().getFullName()
                        : f.getUploadedBy().getEmail())
                .uploadedByAvatarUrl(f.getUploadedBy().getPerson() != null
                        ? f.getUploadedBy().getPerson().getAvatarUrl()
                        : null)
                .entityType(f.getEntityType())
                .entityId(f.getEntityId())
                .createdAt(f.getCreatedAt())
                .build();
    }
}
