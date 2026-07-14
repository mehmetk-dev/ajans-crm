package com.fogistanbul.crm.contentplan.dto;

import com.fogistanbul.crm.entity.enums.RequestType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
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
    @Size(max = 500)
    private String title;
    @Size(max = 5000)
    private String description;
    @Size(max = 10000)
    private String metadata;
}
