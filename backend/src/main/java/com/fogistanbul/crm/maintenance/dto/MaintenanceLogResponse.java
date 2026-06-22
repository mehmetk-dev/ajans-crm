package com.fogistanbul.crm.maintenance.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
public class MaintenanceLogResponse {
    private UUID id;
    private UUID companyId;
    private String title;
    private String description;
    private String category;
    private Instant performedAt;
    private UUID performedById;
    private String performedByName;
    private String performedByAvatarUrl;
    private Instant createdAt;
    private Instant updatedAt;
}
