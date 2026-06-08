package com.fogistanbul.crm.maintenance.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.Instant;

@Data
public class MaintenanceLogRequest {

    @NotBlank
    @Size(max = 255)
    private String title;

    @Size(max = 10_000)
    private String description;

    @NotBlank
    @Pattern(regexp = "update|fix|feature|security|content|seo|other")
    private String category;

    @NotNull
    private Instant performedAt;
}
