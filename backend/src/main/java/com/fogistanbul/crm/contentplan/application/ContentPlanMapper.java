package com.fogistanbul.crm.contentplan.application;

import com.fogistanbul.crm.contentplan.dto.ContentPlanResponse;
import com.fogistanbul.crm.entity.ContentPlan;
import org.springframework.stereotype.Component;

@Component
public class ContentPlanMapper {

    public ContentPlanResponse toResponse(ContentPlan plan) {
        return ContentPlanResponse.builder()
                .id(plan.getId().toString())
                .companyId(plan.getCompany().getId().toString())
                .companyName(plan.getCompany().getName())
                .createdById(plan.getCreatedBy().getId().toString())
                .createdByName(displayName(plan))
                .title(plan.getTitle())
                .description(plan.getDescription())
                .authorName(plan.getAuthorName())
                .platform(plan.getPlatform().name())
                .contentSize(plan.getContentSize())
                .direction(plan.getDirection())
                .speakerModel(plan.getSpeakerModel())
                .status(plan.getStatus().name())
                .revisionNote(plan.getRevisionNote())
                .plannedDate(plan.getPlannedDate() != null ? plan.getPlannedDate().toString() : null)
                .shootId(plan.getShoot() != null ? plan.getShoot().getId().toString() : null)
                .shootDate(plan.getShoot() != null && plan.getShoot().getShootDate() != null
                        ? plan.getShoot().getShootDate().toString() : null)
                .shootTitle(plan.getShoot() != null ? plan.getShoot().getTitle() : null)
                .createdAt(plan.getCreatedAt() != null ? plan.getCreatedAt().toString() : null)
                .updatedAt(plan.getUpdatedAt() != null ? plan.getUpdatedAt().toString() : null)
                .build();
    }

    private String displayName(ContentPlan plan) {
        if (plan.getCreatedBy().getPerson() != null) {
            return plan.getCreatedBy().getPerson().getFullName();
        }
        return plan.getCreatedBy().getEmail();
    }
}
