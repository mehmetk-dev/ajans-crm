package com.fogistanbul.crm.user.infrastructure;

import com.fogistanbul.crm.exception.ApiException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.mock.web.MockMultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.UUID;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class AvatarStorageTest {

    @TempDir
    Path tempDir;

    @Test
    void allowedImageIsStoredUnderTheUsersAvatarDirectory() throws Exception {
        UUID userId = UUID.randomUUID();
        AvatarStorage storage = new AvatarStorage(tempDir.toString());
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "profile.PNG",
                "image/png",
                new byte[]{1, 2, 3}
        );

        String avatarUrl = storage.store(userId, file);

        assertTrue(avatarUrl.matches("/api/settings/avatar/" + userId + "/[a-f0-9-]+\\.png"));
        try (Stream<Path> storedFiles = Files.list(tempDir.resolve("avatar").resolve(userId.toString()))) {
            assertEquals(1, storedFiles.count());
        }
    }

    @Test
    void extensionMustMatchTheDeclaredImageType() {
        AvatarStorage storage = new AvatarStorage(tempDir.toString());
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "profile.svg",
                "image/png",
                new byte[]{1, 2, 3}
        );

        ApiException exception = assertThrows(
                ApiException.class,
                () -> storage.store(UUID.randomUUID(), file)
        );

        assertEquals("AVATAR_EXTENSION_INVALID", exception.getCode());
    }

    @Test
    void traversalFileNamesCannotBeLoaded() {
        AvatarStorage storage = new AvatarStorage(tempDir.toString());

        ApiException exception = assertThrows(
                ApiException.class,
                () -> storage.load(UUID.randomUUID(), "../secret.png")
        );

        assertEquals("AVATAR_FILENAME_INVALID", exception.getCode());
    }
}
