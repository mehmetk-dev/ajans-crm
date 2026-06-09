package com.fogistanbul.crm.company.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdatePermissionRequest {

    @NotNull
    private UUID userId;

    @NotNull
    private UUID companyId;

    @NotBlank
    private String permissionKey;

    @NotBlank
    @jakarta.validation.constraints.Pattern(regexp = "NONE|RESTRICTED|FULL")
    private String level; // NONE, RESTRICTED, FULL
}
