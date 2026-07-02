package com.fogistanbul.crm.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class MailSettingsResponse {
    private boolean enabled;
    private String host;
    private int port;
    private String username;
    private String fromAddress;
    private boolean smtpAuth;
    private boolean startTls;
    private boolean passwordConfigured;
}
