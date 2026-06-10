package com.fogistanbul.crm.files.web;

import com.fogistanbul.crm.entity.FileAttachment;
import com.fogistanbul.crm.files.application.FileService;
import com.fogistanbul.crm.files.dto.FileAttachmentResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.data.domain.Page;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.MalformedURLException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
public class FileController {

    private final FileService fileService;

    @PostMapping("/upload")
    public ResponseEntity<FileAttachmentResponse> upload(
            @RequestParam("file") MultipartFile file,
            @RequestParam("entityType") String entityType,
            @RequestParam("entityId") UUID entityId,
            Authentication auth) {
        return ResponseEntity.ok(fileService.upload(file, entityType, entityId, userId(auth)));
    }

    @GetMapping("/entity/{entityType}/{entityId}")
    public List<FileAttachmentResponse> getByEntity(
            @PathVariable String entityType,
            @PathVariable UUID entityId,
            Authentication auth) {
        return fileService.getByEntity(entityType, entityId, userId(auth));
    }

    @GetMapping("/download/{fileId}")
    public ResponseEntity<Resource> download(@PathVariable UUID fileId, Authentication auth) {
        FileAttachment attachment = fileService.getAttachment(fileId, userId(auth));
        Path filePath = Path.of(attachment.getStoragePath());
        try {
            Resource resource = new UrlResource(filePath.toUri());
            if (!resource.exists()) {
                throw new RuntimeException("Dosya bulunamadi");
            }
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(
                            attachment.getContentType() != null
                                    ? attachment.getContentType()
                                    : "application/octet-stream"))
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            ContentDisposition.attachment()
                                    .filename(sanitizeFilename(attachment.getOriginalName()), StandardCharsets.UTF_8)
                                    .build()
                                    .toString())
                    .body(resource);
        } catch (MalformedURLException e) {
            throw new RuntimeException("Dosya okunamadi", e);
        }
    }

    @DeleteMapping("/{fileId}")
    public ResponseEntity<Void> delete(@PathVariable UUID fileId, Authentication auth) {
        fileService.delete(fileId, userId(auth));
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/media/company/{companyId}")
    public Page<FileAttachmentResponse> getCompanyMedia(
            @PathVariable UUID companyId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "24") int size,
            @RequestParam(required = false) String filter,
            Authentication auth) {
        return fileService.getCompanyMedia(companyId, filter, page, size, userId(auth));
    }

    @GetMapping("/media/company-counts")
    public Map<UUID, Long> getCompanyMediaCounts(Authentication auth) {
        boolean admin = auth.getAuthorities().stream()
                .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));
        return fileService.getCompanyMediaCounts(userId(auth), admin);
    }

    private UUID userId(Authentication auth) {
        return (UUID) auth.getPrincipal();
    }

    private String sanitizeFilename(String filename) {
        if (filename == null || filename.isBlank()) {
            return "file";
        }
        return filename
                .replace("\r", "_")
                .replace("\n", "_")
                .replace("\"", "_");
    }
}
