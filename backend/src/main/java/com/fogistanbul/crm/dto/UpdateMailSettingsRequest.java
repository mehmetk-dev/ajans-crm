package com.fogistanbul.crm.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UpdateMailSettingsRequest {
    private boolean enabled;

    @NotBlank(message = "SMTP sunucu zorunludur")
    private String host;

    @Min(1)
    @Max(65535)
    private int port = 587;

    private String username;
    private String password;

    @NotBlank(message = "Gönderici email zorunludur")
    @Email(message = "Geçerli bir gönderici email giriniz")
    private String fromAddress;

    private boolean smtpAuth = true;
    private boolean startTls = true;
    private boolean clearPassword;
}
