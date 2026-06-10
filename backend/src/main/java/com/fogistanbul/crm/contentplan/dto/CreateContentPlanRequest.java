package com.fogistanbul.crm.contentplan.dto;

import com.fogistanbul.crm.entity.enums.ContentPlatform;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class CreateContentPlanRequest {
    @NotNull
    private UUID companyId;

    @NotBlank
    private String title;

    private String description;

    @NotBlank
    private String authorName;

    @NotNull
    private ContentPlatform platform;

    private String contentSize;
    private String direction;
    private String speakerModel;
    private String plannedDate;
}
