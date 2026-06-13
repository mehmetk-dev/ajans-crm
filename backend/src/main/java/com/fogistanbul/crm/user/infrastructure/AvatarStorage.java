package com.fogistanbul.crm.user.infrastructure;

import com.fogistanbul.crm.exception.ApiException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Component
public class AvatarStorage {

    private static final long MAX_AVATAR_SIZE = 5 * 1024 * 1024;
    private static final Map<String, Set<String>> ALLOWED_EXTENSIONS = Map.of(
            "image/jpeg", Set.of(".jpg", ".jpeg"),
            "image/png", Set.of(".png"),
            "image/webp", Set.of(".webp"),
            "image/gif", Set.of(".gif")
    );

    private final Path uploadRoot;

    public AvatarStorage(@Value("${app.file.upload-dir:uploads}") String uploadDir) {
        this.uploadRoot = Paths.get(uploadDir).toAbsolutePath().normalize();
    }

    public String store(UUID userId, MultipartFile file) throws IOException {
        validate(file);

        String contentType = file.getContentType();
        String extension = extensionOf(file.getOriginalFilename());
        if (!ALLOWED_EXTENSIONS.get(contentType).contains(extension)) {
            throw badRequest("AVATAR_EXTENSION_INVALID", "Dosya uzantısı içerik türüyle eşleşmiyor");
        }

        String storedName = UUID.randomUUID() + extension;
        Path avatarDir = avatarDirectory(userId);
        Files.createDirectories(avatarDir);

        Path target = avatarDir.resolve(storedName).normalize();
        if (!target.startsWith(avatarDir)) {
            throw badRequest("AVATAR_FILENAME_INVALID", "Geçersiz dosya adı");
        }
        Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
        return "/api/settings/avatar/" + userId + "/" + storedName;
    }

    public StoredAvatar load(UUID userId, String fileName) throws IOException {
        if (fileName == null || !fileName.equals(Paths.get(fileName).getFileName().toString())) {
            throw badRequest("AVATAR_FILENAME_INVALID", "Geçersiz dosya adı");
        }

        Path avatarDir = avatarDirectory(userId);
        Path filePath = avatarDir.resolve(fileName).normalize();
        if (!filePath.startsWith(avatarDir) || !Files.isRegularFile(filePath)) {
            throw new ApiException(HttpStatus.NOT_FOUND, "AVATAR_NOT_FOUND", "Avatar bulunamadı");
        }

        Resource resource = new UrlResource(filePath.toUri());
        if (!resource.isReadable()) {
            throw new ApiException(HttpStatus.NOT_FOUND, "AVATAR_NOT_FOUND", "Avatar bulunamadı");
        }

        String contentType = Files.probeContentType(filePath);
        MediaType mediaType = contentType == null
                ? MediaType.APPLICATION_OCTET_STREAM
                : MediaType.parseMediaType(contentType);
        return new StoredAvatar(resource, mediaType);
    }

    private void validate(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw badRequest("AVATAR_EMPTY", "Dosya boş");
        }
        if (file.getSize() > MAX_AVATAR_SIZE) {
            throw badRequest("AVATAR_TOO_LARGE", "Dosya 5MB'dan büyük olamaz");
        }
        if (file.getContentType() == null || !ALLOWED_EXTENSIONS.containsKey(file.getContentType())) {
            throw badRequest("AVATAR_TYPE_INVALID", "Sadece JPEG, PNG, WebP veya GIF yüklenebilir");
        }
    }

    private String extensionOf(String originalFilename) {
        if (originalFilename == null) {
            return "";
        }
        String normalized = Paths.get(originalFilename).getFileName().toString().toLowerCase(Locale.ROOT);
        int dotIndex = normalized.lastIndexOf('.');
        return dotIndex < 0 ? "" : normalized.substring(dotIndex);
    }

    private Path avatarDirectory(UUID userId) {
        return uploadRoot.resolve("avatar").resolve(userId.toString()).normalize();
    }

    private ApiException badRequest(String code, String message) {
        return new ApiException(HttpStatus.BAD_REQUEST, code, message);
    }

    public record StoredAvatar(Resource resource, MediaType mediaType) {
    }
}
