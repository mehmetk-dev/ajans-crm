package com.fogistanbul.crm.contentplan.dto;

import com.fogistanbul.crm.shoot.dto.CreateShootRequest;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class ReviewApprovalRequest {
    private String note;
    private String shootTitle;
    private String shootDescription;
    private String shootDate;
    private String shootTime;
    private String location;
    private UUID existingShootId;
    private UUID photographerId;
    private String notes;
    private List<CreateShootRequest.EquipmentRequest> equipment;
}
