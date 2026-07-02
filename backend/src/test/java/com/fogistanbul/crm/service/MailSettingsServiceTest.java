package com.fogistanbul.crm.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import java.util.Optional;

import com.fogistanbul.crm.dto.UpdateMailSettingsRequest;
import com.fogistanbul.crm.entity.MailSettings;
import com.fogistanbul.crm.repository.MailSettingsRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
class MailSettingsServiceTest {

    @Mock
    private MailSettingsRepository repository;

    @InjectMocks
    private MailSettingsService service;

    @Test
    void updateSettingsPreservesExistingPasswordWhenPasswordIsBlank() {
        MailSettings existing = MailSettings.builder()
                .id(MailSettings.SINGLETON_ID)
                .enabled(false)
                .host("old.smtp.test")
                .port(587)
                .username("old-user")
                .password("secret")
                .fromAddress("old@example.com")
                .smtpAuth(true)
                .startTls(true)
                .build();
        when(repository.findById(MailSettings.SINGLETON_ID)).thenReturn(Optional.of(existing));
        when(repository.save(any(MailSettings.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UpdateMailSettingsRequest request = new UpdateMailSettingsRequest();
        request.setEnabled(true);
        request.setHost("smtp.example.com");
        request.setPort(2525);
        request.setUsername("new-user");
        request.setPassword("");
        request.setFromAddress("noreply@example.com");
        request.setSmtpAuth(true);
        request.setStartTls(false);

        var response = service.updateSettings(request);

        assertThat(existing.getPassword()).isEqualTo("secret");
        assertThat(response.isPasswordConfigured()).isTrue();
        assertThat(response.getHost()).isEqualTo("smtp.example.com");
        assertThat(response.isStartTls()).isFalse();
    }

    @Test
    void getSettingsDoesNotExposePassword() {
        ReflectionTestUtils.setField(service, "defaultEnabled", true);
        ReflectionTestUtils.setField(service, "defaultHost", "smtp.example.com");
        ReflectionTestUtils.setField(service, "defaultPort", 587);
        ReflectionTestUtils.setField(service, "defaultUsername", "user");
        ReflectionTestUtils.setField(service, "defaultPassword", "secret");
        ReflectionTestUtils.setField(service, "defaultFromAddress", "noreply@example.com");
        when(repository.findById(MailSettings.SINGLETON_ID)).thenReturn(Optional.empty());

        var response = service.getSettings();

        assertThat(response.isPasswordConfigured()).isTrue();
        assertThat(response).hasNoNullFieldsOrPropertiesExcept("username");
    }
}
