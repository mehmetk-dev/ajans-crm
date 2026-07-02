package com.fogistanbul.crm.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class MailTestResponse {
    private boolean success;
    private String to;
    private String message;
}
