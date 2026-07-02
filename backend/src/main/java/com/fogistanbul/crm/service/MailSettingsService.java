package com.fogistanbul.crm.service;

import com.fogistanbul.crm.dto.MailSettingsResponse;
import com.fogistanbul.crm.dto.UpdateMailSettingsRequest;
import com.fogistanbul.crm.entity.MailSettings;
import com.fogistanbul.crm.repository.MailSettingsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class MailSettingsService {

    private final MailSettingsRepository repository;

    @Value("${app.mail.enabled:false}")
    private boolean defaultEnabled;

    @Value("${spring.mail.host:smtp.gmail.com}")
    private String defaultHost;

    @Value("${spring.mail.port:587}")
    private int defaultPort;

    @Value("${spring.mail.username:}")
    private String defaultUsername;

    @Value("${spring.mail.password:}")
    private String defaultPassword;

    @Value("${app.mail.from:noreply@fogistanbul.com}")
    private String defaultFromAddress;

    @Transactional(readOnly = true)
    public MailSettingsResponse getSettings() {
        return toResponse(loadEffectiveSettings());
    }

    @Transactional
    public MailSettingsResponse updateSettings(UpdateMailSettingsRequest request) {
        MailSettings settings = repository.findById(MailSettings.SINGLETON_ID)
                .orElseGet(this::newDefaultSettings);

        settings.setEnabled(request.isEnabled());
        settings.setHost(request.getHost().trim());
        settings.setPort(request.getPort());
        settings.setUsername(blankToNull(request.getUsername()));
        settings.setFromAddress(request.getFromAddress().trim());
        settings.setSmtpAuth(request.isSmtpAuth());
        settings.setStartTls(request.isStartTls());

        if (request.isClearPassword()) {
            settings.setPassword(null);
        } else if (request.getPassword() != null && !request.getPassword().isBlank()) {
            settings.setPassword(request.getPassword());
        }

        return toResponse(repository.save(settings));
    }

    @Transactional(readOnly = true)
    public EffectiveMailSettings loadEffectiveSettings() {
        MailSettings settings = repository.findById(MailSettings.SINGLETON_ID)
                .orElseGet(this::newDefaultSettings);

        return new EffectiveMailSettings(
                Boolean.TRUE.equals(settings.getEnabled()),
                settings.getHost(),
                settings.getPort(),
                settings.getUsername(),
                settings.getPassword(),
                settings.getFromAddress(),
                Boolean.TRUE.equals(settings.getSmtpAuth()),
                Boolean.TRUE.equals(settings.getStartTls())
        );
    }

    private MailSettings newDefaultSettings() {
        return MailSettings.builder()
                .id(MailSettings.SINGLETON_ID)
                .enabled(defaultEnabled)
                .host(defaultHost)
                .port(defaultPort)
                .username(blankToNull(defaultUsername))
                .password(blankToNull(defaultPassword))
                .fromAddress(defaultFromAddress)
                .smtpAuth(true)
                .startTls(true)
                .build();
    }

    private MailSettingsResponse toResponse(EffectiveMailSettings settings) {
        return MailSettingsResponse.builder()
                .enabled(settings.enabled())
                .host(settings.host())
                .port(settings.port())
                .username(settings.username())
                .fromAddress(settings.fromAddress())
                .smtpAuth(settings.smtpAuth())
                .startTls(settings.startTls())
                .passwordConfigured(settings.password() != null && !settings.password().isBlank())
                .build();
    }

    private MailSettingsResponse toResponse(MailSettings settings) {
        return MailSettingsResponse.builder()
                .enabled(Boolean.TRUE.equals(settings.getEnabled()))
                .host(settings.getHost())
                .port(settings.getPort())
                .username(settings.getUsername())
                .fromAddress(settings.getFromAddress())
                .smtpAuth(Boolean.TRUE.equals(settings.getSmtpAuth()))
                .startTls(Boolean.TRUE.equals(settings.getStartTls()))
                .passwordConfigured(settings.getPassword() != null && !settings.getPassword().isBlank())
                .build();
    }

    private String blankToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }

    public record EffectiveMailSettings(
            boolean enabled,
            String host,
            int port,
            String username,
            String password,
            String fromAddress,
            boolean smtpAuth,
            boolean startTls
    ) {
    }
}
