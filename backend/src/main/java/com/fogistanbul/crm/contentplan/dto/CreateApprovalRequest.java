package com.fogistanbul.crm.contentplan.dto;

import com.fogistanbul.crm.entity.enums.RequestType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class CreateApprovalRequest {
    @NotNull
    private RequestType type;
    private UUID referenceId;
    @NotNull
    private UUID companyId;
    @NotBlank
    private String title;
    private String description;
    private String metadata;
}
