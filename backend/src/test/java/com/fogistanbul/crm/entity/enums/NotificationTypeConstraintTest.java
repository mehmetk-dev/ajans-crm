package com.fogistanbul.crm.entity.enums;

import static org.assertj.core.api.Assertions.assertThat;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Arrays;

import org.junit.jupiter.api.Test;

class NotificationTypeConstraintTest {

    @Test
    void notificationConstraintIncludesEveryNotificationType() throws Exception {
        String migration = Files.readString(Path.of(
                "src/main/resources/db/migration/V38__sync_notification_type_constraint.sql"));

        Arrays.stream(NotificationType.values())
                .map(Enum::name)
                .forEach(type -> assertThat(migration).contains("'" + type + "'"));
    }
}
