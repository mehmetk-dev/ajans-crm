package com.fogistanbul.crm.meeting.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class MeetingNoteRequest {
    @NotBlank
    private String content;
}
