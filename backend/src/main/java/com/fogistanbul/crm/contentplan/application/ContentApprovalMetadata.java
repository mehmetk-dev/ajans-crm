package com.fogistanbul.crm.contentplan.application;

import com.fogistanbul.crm.contentplan.dto.ReviewApprovalRequest;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class ContentApprovalMetadata {

    public Details parse(String metadata) {
        String[] parts = metadata == null ? new String[0] : metadata.split("\\|\\|", -1);
        return new Details(
                value(parts, 0),
                value(parts, 1),
                value(parts, 2),
                value(parts, 3),
                value(parts, 4),
                uuidValue(parts, 5)
        );
    }

    public Details merge(Details metadata, ReviewApprovalRequest review) {
        if (review == null) {
            return metadata;
        }
        return new Details(
                prefer(review.getShootTitle(), metadata.shootTitle()),
                prefer(review.getShootDescription(), metadata.shootDescription()),
                prefer(review.getShootDate(), metadata.shootDate()),
                prefer(review.getShootTime(), metadata.shootTime()),
                prefer(review.getLocation(), metadata.location()),
                review.getExistingShootId() != null ? review.getExistingShootId() : metadata.existingShootId()
        );
    }

    private String value(String[] parts, int index) {
        if (parts.length <= index || parts[index].isBlank()) {
            return null;
        }
        return parts[index];
    }

    private UUID uuidValue(String[] parts, int index) {
        String value = value(parts, index);
        return value != null ? UUID.fromString(value) : null;
    }

    private String prefer(String override, String fallback) {
        return override != null && !override.isBlank() ? override : fallback;
    }

    public record Details(
            String shootTitle,
            String shootDescription,
            String shootDate,
            String shootTime,
            String location,
            UUID existingShootId
    ) {
    }
}
