package com.fogistanbul.crm.contact.application;

import com.fogistanbul.crm.contact.dto.ContactFormRequest;
import com.fogistanbul.crm.exception.ApiException;
import com.fogistanbul.crm.service.EmailService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ContactFormServiceTest {

    @Mock
    private EmailService emailService;

    @Mock
    private ContactRequestRateLimiter rateLimiter;

    @InjectMocks
    private ContactFormService service;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(service, "recipient", "info@fogistanbul.com");
    }

    @Test
    void sendsEscapedContactEmailWithReplyTo() throws Exception {
        when(rateLimiter.tryAcquire("127.0.0.1:ayse@example.com")).thenReturn(true);

        service.submit(request("<script>alert('x')</script>", ""), "127.0.0.1");

        ArgumentCaptor<String> html = ArgumentCaptor.forClass(String.class);
        verify(emailService).sendContactEmail(
                eq("info@fogistanbul.com"),
                eq("ayse@example.com"),
                anyString(),
                html.capture()
        );
        assertThat(html.getValue())
                .contains("&lt;script&gt;alert(&#39;x&#39;)&lt;/script&gt;")
                .doesNotContain("<script>");
    }

    @Test
    void rejectsRequestsOverTheRateLimit() {
        when(rateLimiter.tryAcquire("127.0.0.1:ayse@example.com")).thenReturn(false);

        assertThatThrownBy(() -> service.submit(request("Merhaba, teklif almak istiyorum.", ""), "127.0.0.1"))
                .isInstanceOfSatisfying(ApiException.class, exception -> {
                    assertThat(exception.getStatus().value()).isEqualTo(429);
                    assertThat(exception.getCode()).isEqualTo("CONTACT_RATE_LIMITED");
                });
    }

    @Test
    void ignoresHoneypotSubmissions() throws Exception {
        service.submit(request("Merhaba, teklif almak istiyorum.", "https://spam.example"), "127.0.0.1");

        verify(rateLimiter, never()).tryAcquire(anyString());
        verify(emailService, never()).sendContactEmail(anyString(), anyString(), anyString(), anyString());
    }

    private ContactFormRequest request(String message, String website) {
        return new ContactFormRequest(
                "Ayşe Yılmaz",
                "ayse@example.com",
                "+90 555 000 00 00",
                "Örnek A.Ş.",
                "Dijital Pazarlama",
                message,
                website
        );
    }
}
