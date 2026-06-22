package com.fogistanbul.crm.contentplan.application;

import com.fogistanbul.crm.contentplan.dto.ApprovalRequestResponse;
import com.fogistanbul.crm.entity.ApprovalRequest;
import com.fogistanbul.crm.entity.UserProfile;
import org.springframework.stereotype.Component;

@Component
public class ApprovalRequestMapper {

    public ApprovalRequestResponse toResponse(ApprovalRequest request) {
        return ApprovalRequestResponse.builder()
                .id(request.getId())
                .type(request.getType().name())
                .referenceId(request.getReferenceId())
                .companyName(request.getCompany().getName())
                .companyId(request.getCompany().getId())
                .requestedByName(displayName(request.getRequestedBy()))
                .requestedById(request.getRequestedBy().getId())
                .requestedByAvatarUrl(avatarUrl(request.getRequestedBy()))
                .status(request.getStatus().name())
                .title(request.getTitle())
                .description(request.getDescription())
                .metadata(request.getMetadata())
                .reviewedByName(request.getReviewedBy() != null ? displayName(request.getReviewedBy()) : null)
                .reviewNote(request.getReviewNote())
                .createdAt(request.getCreatedAt())
                .reviewedAt(request.getReviewedAt())
                .build();
    }

    private String displayName(UserProfile user) {
        return user.getPerson() != null ? user.getPerson().getFullName() : user.getEmail();
    }

    private String avatarUrl(UserProfile user) {
        return user.getPerson() != null ? user.getPerson().getAvatarUrl() : null;
    }
}
