package com.fogistanbul.crm.contentplan.dto;

import com.fogistanbul.crm.entity.enums.ContentPlatform;
import com.fogistanbul.crm.entity.enums.ContentStatus;
import lombok.Data;

@Data
public class UpdateContentPlanRequest {
    private String title;
    private String description;
    private String authorName;
    private ContentPlatform platform;
    private String contentSize;
    private String direction;
    private String speakerModel;
    private ContentStatus status;
    private String revisionNote;
    private String plannedDate;
}
