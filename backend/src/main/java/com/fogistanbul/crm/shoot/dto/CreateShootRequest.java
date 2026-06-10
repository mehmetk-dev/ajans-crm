package com.fogistanbul.crm.shoot.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.Instant;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@Data
public class CreateShootRequest {
    @NotNull
    private UUID companyId;

    @NotBlank
    private String title;

    private String description;
    private Instant shootDate;
    private LocalTime shootTime;
    private String location;
    private UUID photographerId;
    private String notes;
    private List<@Valid ShootParticipantRequest> participants;
    private List<@Valid EquipmentRequest> equipment;

    @Data
    public static class ShootParticipantRequest {
        @NotNull
        private UUID userId;
        private String roleInShoot;
    }

    @Data
    public static class EquipmentRequest {
        @NotBlank
        private String name;
        @Min(1)
        private Integer quantity;
        private String notes;
    }
}
