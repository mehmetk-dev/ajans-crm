package com.fogistanbul.crm.prproject.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AddPrPhaseNoteRequest(
        @NotBlank
        @Size(max = 5000)
        String content
) {
}
