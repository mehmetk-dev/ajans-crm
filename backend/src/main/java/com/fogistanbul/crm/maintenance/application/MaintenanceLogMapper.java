package com.fogistanbul.crm.maintenance.application;

import com.fogistanbul.crm.entity.Person;
import com.fogistanbul.crm.entity.UserProfile;
import com.fogistanbul.crm.maintenance.domain.MaintenanceLogEntry;
import com.fogistanbul.crm.maintenance.dto.MaintenanceLogResponse;
import org.springframework.stereotype.Component;

@Component
public class MaintenanceLogMapper {

    public MaintenanceLogResponse toResponse(MaintenanceLogEntry entry) {
        UserProfile author = entry.getPerformedBy();
        return MaintenanceLogResponse.builder()
                .id(entry.getId())
                .companyId(entry.getCompany().getId())
                .title(entry.getTitle())
                .description(entry.getDescription())
                .category(entry.getCategory())
                .performedAt(entry.getPerformedAt())
                .performedById(author != null ? author.getId() : null)
                .performedByName(authorName(author))
                .createdAt(entry.getCreatedAt())
                .updatedAt(entry.getUpdatedAt())
                .build();
    }

    private String authorName(UserProfile author) {
        if (author == null) {
            return null;
        }
        Person person = author.getPerson();
        return person != null && person.getFullName() != null
                ? person.getFullName()
                : author.getEmail();
    }
}
