package com.fogistanbul.crm.prproject.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class CreatePrProjectRequest {
    private UUID companyId;

    @NotBlank
    @Size(max = 255)
    private String name;

    @Size(max = 5000)
    private String purpose;
    private UUID responsibleId;
    private String startDate;
    private String endDate;

    @Size(max = 5000)
    private String notes;
    private Integer totalPhases;

    @Valid
    private List<PhaseRequest> phases;
    private List<UUID> memberIds;

    @Data
    public static class PhaseRequest {
        @NotBlank
        @Size(max = 255)
        private String name;
        private UUID assignedToId;
        private String startDate;
        private String endDate;

        @Size(max = 5000)
        private String notes;
    }
}
