package com.fogistanbul.crm.files.application;

import com.fogistanbul.crm.entity.FileAttachment;
import com.fogistanbul.crm.entity.UserProfile;
import com.fogistanbul.crm.exception.ApiException;
import com.fogistanbul.crm.files.dto.FileAttachmentResponse;
import com.fogistanbul.crm.repository.FileAttachmentRepository;
import com.fogistanbul.crm.repository.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class FileService {

    private static final long MAX_FILE_SIZE = 50 * 1024 * 1024;
    private static final Set<String> ALLOWED_ENTITY_TYPES = Set.of("MESSAGE", "TASK", "NOTE", "COMPANY");
    private static final List<String> BLOCKED_EXTENSIONS = List.of(
            ".exe", ".bat", ".cmd", ".sh", ".ps1", ".vbs", ".js", ".jar", ".war");

    private final FileAttachmentRepository fileAttachmentRepository;
    private final UserProfileRepository userProfileRepository;
    private final FileAccessPolicy accessPolicy;
    private final FileMapper mapper;

    @Value("${app.file.upload-dir:uploads}")
    private String uploadDir;

    @Transactional
    public FileAttachmentResponse upload(MultipartFile file, String entityType, UUID entityId, UUID userId) {
        if (file.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "FILE_EMPTY", "Boş dosya yüklenemez");
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new ApiException(HttpStatus.PAYLOAD_TOO_LARGE, "FILE_TOO_LARGE", "Dosya boyutu 50MB'i aşamaz");
        }

        String normalizedEntityType = normalizeEntityType(entityType);
        UserProfile uploader = getUserOrThrow(userId);
        accessPolicy.requireEntityAccess(normalizedEntityType, entityId, uploader);

        String originalName = file.getOriginalFilename();
        if (originalName != null) {
            String lowerName = originalName.toLowerCase();
            for (String ext : BLOCKED_EXTENSIONS) {
                if (lowerName.endsWith(ext)) {
                    throw new ApiException(HttpStatus.BAD_REQUEST, "FILE_TYPE_BLOCKED", "Bu dosya türü yüklenemez: " + ext);
                }
            }
        }

        String storedName = UUID.randomUUID() + "_" + (originalName != null ? originalName : "file");
        Path uploadPath = Path.of(uploadDir, normalizedEntityType.toLowerCase(), entityId.toString());

        try {
            Files.createDirectories(uploadPath);
            Path filePath = uploadPath.resolve(storedName);
            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, filePath, StandardCopyOption.REPLACE_EXISTING);
            }
        } catch (IOException e) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "FILE_SAVE_FAILED", "Dosya kaydedilemedi");
        }

        FileAttachment attachment = FileAttachment.builder()
                .originalName(originalName != null ? originalName : "file")
                .storedName(storedName)
                .contentType(file.getContentType())
                .fileSize(file.getSize())
                .storagePath(uploadPath.resolve(storedName).toString())
                .uploadedBy(uploader)
                .entityType(normalizedEntityType)
                .entityId(entityId)
                .build();

        attachment = fileAttachmentRepository.save(attachment);
        log.info("File uploaded: {} for {}/{}", originalName, normalizedEntityType, entityId);
        return mapper.toResponse(attachment);
    }

    @Transactional(readOnly = true)
    public List<FileAttachmentResponse> getByEntity(String entityType, UUID entityId, UUID userId) {
        String normalizedEntityType = normalizeEntityType(entityType);
        UserProfile user = getUserOrThrow(userId);
        accessPolicy.requireEntityAccess(normalizedEntityType, entityId, user);
        return fileAttachmentRepository
                .findByEntityTypeAndEntityIdOrderByCreatedAtDesc(normalizedEntityType, entityId)
                .stream()
                .map(mapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public FileAttachment getAttachment(UUID fileId, UUID userId) {
        FileAttachment attachment = fileAttachmentRepository.findById(fileId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "FILE_NOT_FOUND", "Dosya bulunamadı"));
        UserProfile user = getUserOrThrow(userId);
        accessPolicy.requireEntityAccess(attachment.getEntityType(), attachment.getEntityId(), user);
        return attachment;
    }

    @Transactional
    public void delete(UUID fileId, UUID userId) {
        FileAttachment attachment = fileAttachmentRepository.findById(fileId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "FILE_NOT_FOUND", "Dosya bulunamadı"));
        UserProfile user = getUserOrThrow(userId);
        UUID uploadedById = attachment.getUploadedBy() != null ? attachment.getUploadedBy().getId() : null;
        accessPolicy.requireDeleteAccess(user, uploadedById);

        try {
            Files.deleteIfExists(Path.of(attachment.getStoragePath()));
        } catch (IOException e) {
            log.warn("Could not delete file from disk: {}", attachment.getStoragePath(), e);
        }

        fileAttachmentRepository.delete(attachment);
        log.info("File deleted: {} by user {}", attachment.getOriginalName(), userId);
    }

    @Transactional(readOnly = true)
    public Page<FileAttachmentResponse> getCompanyMedia(UUID companyId, String filter, int page, int size, UUID userId) {
        UserProfile user = getUserOrThrow(userId);
        accessPolicy.requireCompanyAccess(user, companyId);

        PageRequest pageable = PageRequest.of(page, size);
        Page<FileAttachment> result;

        if (filter != null && !filter.isBlank()) {
            result = fileAttachmentRepository
                    .findByEntityTypeAndEntityIdAndContentTypeStartingWithOrderByCreatedAtDesc(
                            "COMPANY", companyId, filter, pageable);
        } else {
            result = fileAttachmentRepository
                    .findByEntityTypeAndEntityIdOrderByCreatedAtDesc("COMPANY", companyId, pageable);
        }

        return result.map(mapper::toResponse);
    }

    @Transactional(readOnly = true)
    public Map<UUID, Long> getCompanyMediaCounts(UUID userId, boolean admin) {
        List<UUID> accessibleIds = admin ? null : accessPolicy.accessibleCompanyIds(userId);

        Map<UUID, Long> counts = new HashMap<>();
        for (Object[] row : fileAttachmentRepository.countByCompanyGrouped()) {
            UUID companyId = (UUID) row[0];
            Long count = (Long) row[1];
            if (admin || accessibleIds.contains(companyId)) {
                counts.put(companyId, count);
            }
        }
        return counts;
    }

    private String normalizeEntityType(String entityType) {
        if (entityType == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "ENTITY_TYPE_REQUIRED", "Entity type zorunludur");
        }
        String normalized = entityType.trim().toUpperCase();
        if (!ALLOWED_ENTITY_TYPES.contains(normalized)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_ENTITY_TYPE", "Geçersiz entity type");
        }
        return normalized;
    }

    private UserProfile getUserOrThrow(UUID userId) {
        return userProfileRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "Kullanıcı bulunamadı"));
    }
}
