package com.fogistanbul.crm.note.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
public class NoteResponse {
    private UUID id;
    private UUID userId;
    private String userName;
    private String userAvatarUrl;
    private UUID companyId;
    private String companyName;
    private String content;
    private Boolean isOpen;
    private LocalDate noteDate;
    private Instant createdAt;
}
