package com.fogistanbul.crm.prproject.dto;

import com.fogistanbul.crm.entity.enums.PrProjectStatus;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class UpdatePrProjectRequest {
    @Size(max = 255)
    private String name;

    @Size(max = 5000)
    private String purpose;
    private UUID companyId;
    private UUID responsibleId;
    private String startDate;
    private String endDate;

    @Size(max = 5000)
    private String notes;
    private PrProjectStatus status;

    @Valid
    private List<PhaseUpdateRequest> phases;

    @Data
    public static class PhaseUpdateRequest {
        private UUID id;

        @Size(max = 255)
        private String name;
        private UUID assignedToId;
        private String startDate;
        private String endDate;

        @Size(max = 5000)
        private String notes;
    }
}
