package com.fogistanbul.crm.contentplan.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class ApproveContentPlanRequest {
    @NotNull
    private UUID companyId;
    private String shootTitle;
    private String shootDescription;
    private String shootDate;
    private String shootTime;
    private String location;
}
