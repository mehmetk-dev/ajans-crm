package com.fogistanbul.crm.contentplan.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RequestRevisionRequest {
    @NotBlank
    private String note;
}
