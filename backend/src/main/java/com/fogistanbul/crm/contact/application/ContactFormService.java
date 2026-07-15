package com.fogistanbul.crm.contact.application;

import com.fogistanbul.crm.contact.dto.ContactFormRequest;
import com.fogistanbul.crm.exception.ApiException;
import com.fogistanbul.crm.service.EmailService;
import jakarta.mail.MessagingException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.mail.MailException;
import org.springframework.stereotype.Service;

import java.util.Locale;

@Service
@RequiredArgsConstructor
public class ContactFormService {

    private final EmailService emailService;
    private final ContactRequestRateLimiter rateLimiter;

    @Value("${app.contact.recipient:info@fogistanbul.com}")
    private String recipient;

    public void submit(ContactFormRequest request, String clientIp) {
        if (request.website() != null && !request.website().isBlank()) {
            return;
        }

        String key = safe(clientIp) + ":" + request.email().strip().toLowerCase(Locale.ROOT);
        if (!rateLimiter.tryAcquire(key)) {
            throw new ApiException(
                    HttpStatus.TOO_MANY_REQUESTS,
                    "CONTACT_RATE_LIMITED",
                    "Çok fazla iletişim talebi gönderdiniz. Lütfen daha sonra tekrar deneyin"
            );
        }

        String name = request.name().strip();
        String subject = "Yeni web iletişim talebi - " + sanitizeSubject(name);
        String html = buildHtml(request);
        try {
            emailService.sendContactEmail(recipient, request.email().strip(), subject, html);
        } catch (MessagingException | MailException | IllegalStateException exception) {
            throw new ApiException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "CONTACT_DELIVERY_FAILED",
                    "Mesaj şu anda gönderilemedi. Lütfen daha sonra tekrar deneyin"
            );
        }
    }

    private String buildHtml(ContactFormRequest request) {
        return """
                <h2>Yeni web iletişim talebi</h2>
                <p><strong>Ad Soyad:</strong> %s</p>
                <p><strong>E-posta:</strong> %s</p>
                <p><strong>Telefon:</strong> %s</p>
                <p><strong>Marka / Şirket:</strong> %s</p>
                <p><strong>İlgilendiği hizmet:</strong> %s</p>
                <p><strong>Mesaj:</strong></p>
                <p style="white-space:pre-wrap">%s</p>
                """.formatted(
                escapeHtml(request.name()),
                escapeHtml(request.email()),
                escapeHtml(request.phone()),
                escapeHtml(request.company()),
                escapeHtml(request.service()),
                escapeHtml(request.message())
        );
    }

    private String sanitizeSubject(String value) {
        return value.replaceAll("[\\r\\n\\t]", " ");
    }

    private String safe(String value) {
        return value == null || value.isBlank() ? "unknown" : value;
    }

    private String escapeHtml(String value) {
        if (value == null) {
            return "-";
        }
        return value
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }
}
