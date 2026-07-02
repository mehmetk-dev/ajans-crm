package com.fogistanbul.crm.controller;

import com.fogistanbul.crm.dto.MailSettingsResponse;
import com.fogistanbul.crm.dto.MailTestResponse;
import com.fogistanbul.crm.dto.UpdateMailSettingsRequest;
import com.fogistanbul.crm.service.EmailService;
import com.fogistanbul.crm.service.MailSettingsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/mail-settings")
@RequiredArgsConstructor
public class AdminMailSettingsController {

    private static final String DEFAULT_TEST_RECIPIENT = "mehmetkerem2109@gmail.com";

    private final MailSettingsService mailSettingsService;
    private final EmailService emailService;

    @GetMapping
    public MailSettingsResponse getSettings() {
        return mailSettingsService.getSettings();
    }

    @PutMapping
    public MailSettingsResponse updateSettings(@Valid @RequestBody UpdateMailSettingsRequest request) {
        return mailSettingsService.updateSettings(request);
    }

    @PostMapping("/test")
    public MailTestResponse testSettings() {
        try {
            emailService.sendTestEmail(DEFAULT_TEST_RECIPIENT);
            return MailTestResponse.builder()
                    .success(true)
                    .to(DEFAULT_TEST_RECIPIENT)
                    .message("Test maili gönderildi")
                    .build();
        } catch (Exception e) {
            return MailTestResponse.builder()
                    .success(false)
                    .to(DEFAULT_TEST_RECIPIENT)
                    .message("Test maili gönderilemedi: " + e.getMessage())
                    .build();
        }
    }
}
