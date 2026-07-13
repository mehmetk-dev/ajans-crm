package com.fogistanbul.crm.service;

import com.fogistanbul.crm.entity.enums.NotificationType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.util.Properties;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final MailSettingsService mailSettingsService;

    @Value("${app.frontend-url:https://crm.fogistanbul.com}")
    private String frontendUrl;

    @Async
    public void sendEmail(String to, String subject, String htmlContent) {
        deliverEmailQuietly(to, subject, htmlContent);
    }

    @Async
    public void sendNotificationEmail(
            String to,
            NotificationType type,
            String title,
            String message,
            String referenceType
    ) {
        NotificationMailTemplate template = buildNotificationTemplate(type, title, message, referenceType);
        deliverEmailQuietly(to, template.subject(), template.html());
    }

    @Async
    public void sendTaskAssignedEmail(String to, String assigneeName, String taskTitle, String companyName) {
        String html = buildLegacyTemplate(
                "Yeni Görev Atandı",
                "Merhaba " + escapeHtml(assigneeName) + ",",
                "<strong>" + escapeHtml(companyName) + "</strong> şirketi için yeni bir görev atandı:",
                escapeHtml(taskTitle),
                "Detayları CRM panelinden görebilirsiniz."
        );
        deliverEmailQuietly(to, "Yeni Görev: " + taskTitle, html);
    }

    @Async
    public void sendMeetingReminderEmail(String to, String userName, String meetingTitle, String meetingDate) {
        String html = buildLegacyTemplate(
                "Toplantı Hatırlatma",
                "Merhaba " + escapeHtml(userName) + ",",
                "Yaklaşan toplantınız var:",
                escapeHtml(meetingTitle),
                "Tarih: " + escapeHtml(meetingDate)
        );
        deliverEmailQuietly(to, "Toplantı Hatırlatma: " + meetingTitle, html);
    }

    @Async
    public void sendApprovalRequestEmail(String to, String approverName, String requesterName, String resourceType) {
        String html = buildLegacyTemplate(
                "Onay Talebi",
                "Merhaba " + escapeHtml(approverName) + ",",
                escapeHtml(requesterName) + " tarafından yeni bir onay talebi gönderildi.",
                escapeHtml(resourceType),
                "CRM panelinden onaylayabilir veya reddedebilirsiniz."
        );
        deliverEmailQuietly(to, "Yeni Onay Talebi", html);
    }

    public void sendTestEmail(String to) throws MessagingException {
        String html = buildLegacyTemplate(
                "SMTP Test Maili",
                "Merhaba,",
                "Bu mail CRM admin panelindeki SMTP ayarlarını test etmek için gönderildi.",
                "SMTP bağlantısı başarılı",
                "Bu mesajı aldıysanız mail gönderimi çalışıyor."
        );
        deliverEmailOrThrow(to, "CRM SMTP Test", html);
    }

    private void deliverEmailQuietly(String to, String subject, String htmlContent) {
        try {
            MailSettingsService.EffectiveMailSettings settings = mailSettingsService.loadEffectiveSettings();
            if (!settings.enabled()) {
                log.debug("Email delivery skipped because mail is disabled");
                return;
            }
            deliverEmail(to, subject, htmlContent, settings);
        } catch (IllegalStateException | MessagingException | MailException e) {
            log.error("Failed to send email to {}: {}", to, e.getMessage());
        }
    }

    private void deliverEmailOrThrow(String to, String subject, String htmlContent)
            throws MessagingException, MailException {
        MailSettingsService.EffectiveMailSettings settings = mailSettingsService.loadEffectiveSettings();
        if (!settings.enabled()) {
            throw new IllegalStateException("Mail sistemi pasif");
        }
        deliverEmail(to, subject, htmlContent, settings);
    }

    private void deliverEmail(
            String to,
            String subject,
            String htmlContent,
            MailSettingsService.EffectiveMailSettings settings
    ) throws MessagingException, MailException {
        if (to == null || to.isBlank()) {
            throw new IllegalStateException("Alıcı email boş");
        }

        JavaMailSenderImpl mailSender = createMailSender(settings);
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        helper.setFrom(settings.fromAddress());
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(htmlContent, true);
        mailSender.send(message);
        log.info("Email sent to {}: {}", to, subject);
    }

    private JavaMailSenderImpl createMailSender(MailSettingsService.EffectiveMailSettings settings) {
        JavaMailSenderImpl sender = new JavaMailSenderImpl();
        sender.setHost(settings.host());
        sender.setPort(settings.port());
        sender.setUsername(settings.username());
        sender.setPassword(settings.password());

        Properties props = sender.getJavaMailProperties();
        props.put("mail.smtp.auth", Boolean.toString(settings.smtpAuth()));
        props.put("mail.smtp.starttls.enable", Boolean.toString(settings.startTls()));
        props.put("mail.smtp.connectiontimeout", "10000");
        props.put("mail.smtp.timeout", "10000");
        props.put("mail.smtp.writetimeout", "10000");
        return sender;
    }

    NotificationMailTemplate buildNotificationTemplate(
            NotificationType type,
            String title,
            String message,
            String referenceType
    ) {
        String safeTitle = fallback(title, "Yeni bildirim");
        String safeMessage = fallback(message, defaultBody(type));
        String badge = badgeFor(type, referenceType);
        String heading = headingFor(type);
        String subject = subjectFor(type, safeTitle);
        String accent = accentFor(type);
        String cta = ctaFor(type);
        String detailLabel = detailLabelFor(type);

        String html = """
            <div style="margin:0;padding:0;background:#070709;font-family:Inter,Arial,sans-serif;color:#f4f4f5;">
              <table role="presentation" width="100%%" cellspacing="0" cellpadding="0" style="background:#070709;padding:28px 12px;">
                <tr>
                  <td align="center">
                    <table role="presentation" width="100%%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#0c0c0e;border:1px solid rgba(255,255,255,.08);border-radius:18px;overflow:hidden;">
                      <tr>
                        <td style="padding:28px 32px;background:linear-gradient(135deg,#111113 0%%,#19110d 100%%);border-bottom:1px solid rgba(255,255,255,.08);">
                          <div style="font-size:22px;font-weight:900;letter-spacing:0;color:#fff;">FOG<span style="font-weight:500;color:#a1a1aa;">istanbul</span></div>
                          <div style="margin-top:10px;display:inline-block;border:1px solid %s;background:%s;color:#fff;border-radius:999px;padding:6px 10px;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.04em;">%s</div>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:32px;">
                          <p style="margin:0 0 10px;color:#a1a1aa;font-size:13px;">CRM bildirimi</p>
                          <h1 style="margin:0;color:#fff;font-size:24px;line-height:1.25;font-weight:900;">%s</h1>
                          <p style="margin:18px 0 0;color:#d4d4d8;font-size:15px;line-height:1.65;">%s</p>
                          <div style="margin:24px 0;padding:18px 20px;background:#09090b;border:1px solid rgba(255,255,255,.08);border-left:4px solid %s;border-radius:12px;">
                            <p style="margin:0 0 6px;color:#71717a;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.08em;">%s</p>
                            <p style="margin:0;color:#fff;font-size:16px;line-height:1.45;font-weight:800;">%s</p>
                          </div>
                          <a href="%s" style="display:inline-block;background:%s;color:#fff;text-decoration:none;border-radius:10px;padding:12px 16px;font-size:13px;font-weight:900;">%s</a>
                          <p style="margin:20px 0 0;color:#71717a;font-size:12px;line-height:1.55;">Bu mail, CRM içindeki operasyonel bildirimler kapsamında gönderildi.</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:18px 32px;border-top:1px solid rgba(255,255,255,.08);background:#09090b;">
                          <p style="margin:0;color:#52525b;font-size:11px;">FOG İstanbul CRM</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </div>
            """.formatted(
                transparentBorder(accent),
                transparentBackground(accent),
                escapeHtml(badge),
                escapeHtml(heading),
                escapeHtml(safeMessage),
                accent,
                escapeHtml(detailLabel),
                escapeHtml(safeTitle),
                crmUrl(),
                accent,
                escapeHtml(cta)
        );

        return new NotificationMailTemplate(subject, html);
    }

    private String buildLegacyTemplate(String heading, String greeting, String body, String highlight, String footer) {
        return """
            <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #111113; color: #e4e4e7; border-radius: 12px; overflow: hidden;">
                <div style="background: linear-gradient(135deg, #f97316 0%%, #b45309 100%%); padding: 24px 32px;">
                    <h1 style="margin: 0; font-size: 20px; font-weight: 800; color: white;">FOG<span style="font-weight: 400; opacity: 0.8;">istanbul</span></h1>
                </div>
                <div style="padding: 32px;">
                    <h2 style="margin: 0 0 16px; font-size: 18px; color: white;">%s</h2>
                    <p style="margin: 0 0 12px; color: #a1a1aa;">%s</p>
                    <p style="margin: 0 0 12px; color: #d4d4d8;">%s</p>
                    <div style="background: #09090b; border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; padding: 16px; margin: 16px 0;">
                        <p style="margin: 0; color: #f97316; font-weight: 600;">%s</p>
                    </div>
                    <p style="margin: 16px 0 0; color: #71717a; font-size: 13px;">%s</p>
                </div>
                <div style="padding: 16px 32px; border-top: 1px solid rgba(255,255,255,0.06); text-align: center;">
                    <p style="margin: 0; color: #52525b; font-size: 11px;">© FOG İstanbul CRM</p>
                </div>
            </div>
            """.formatted(heading, greeting, body, highlight, footer);
    }

    private String subjectFor(NotificationType type, String title) {
        return switch (type) {
            case TASK_ASSIGNED -> "Yeni görev atandı: " + title;
            case TASK_COMPLETED -> "Görev tamamlandı: " + title;
            case TASK_OVERDUE -> "Görev gecikti: " + title;
            case TASK_STATUS_CHANGED -> "Görev durumu güncellendi: " + title;
            case SHOOT_CREATED -> "Yeni çekim oluşturuldu: " + title;
            case SHOOT_UPDATED -> "Çekim güncellendi: " + title;
            case SHOOT_REMINDER -> "Çekim hatırlatma: " + title;
            case MESSAGE_RECEIVED -> "Yeni mesaj: " + title;
            case CONTENT_PLAN_CREATED -> "Yeni içerik planı: " + title;
            case CONTENT_PLAN_UPDATED -> "İçerik planı güncellendi: " + title;
            case APPROVAL_REQUEST -> "Yeni onay talebi: " + title;
            case APPROVAL_DECIDED -> "Onay kararı: " + title;
            case MEETING_REMINDER -> "Toplantı hatırlatma: " + title;
            case SURVEY_REQUEST -> "Anket talebi: " + title;
            case FILE_SHARED -> "Dosya paylaşıldı: " + title;
            case SYSTEM -> "Sistem bildirimi: " + title;
        };
    }

    private String headingFor(NotificationType type) {
        return switch (type) {
            case TASK_ASSIGNED -> "Yeni görev atandı";
            case TASK_COMPLETED -> "Görev tamamlandı";
            case TASK_OVERDUE -> "Geciken görev var";
            case TASK_STATUS_CHANGED -> "Görev durumu değişti";
            case SHOOT_CREATED -> "Yeni çekim planlandı";
            case SHOOT_UPDATED -> "Çekim güncellendi";
            case SHOOT_REMINDER -> "Çekim hatırlatması";
            case MESSAGE_RECEIVED -> "Yeni mesaj aldınız";
            case CONTENT_PLAN_CREATED -> "Yeni içerik planı oluşturuldu";
            case CONTENT_PLAN_UPDATED -> "İçerik planı güncellendi";
            case APPROVAL_REQUEST -> "Onayınız bekleniyor";
            case APPROVAL_DECIDED -> "Onay sonucu güncellendi";
            case MEETING_REMINDER -> "Toplantı zamanı yaklaşıyor";
            case SURVEY_REQUEST -> "Yeni anket talebi";
            case FILE_SHARED -> "Sizinle dosya paylaşıldı";
            case SYSTEM -> "Sistem bildirimi";
        };
    }

    private String defaultBody(NotificationType type) {
        return switch (type) {
            case TASK_ASSIGNED -> "Size yeni bir görev atandı. Detayları CRM panelinden inceleyebilirsiniz.";
            case TASK_COMPLETED -> "Takip ettiğiniz görev tamamlandı.";
            case TASK_OVERDUE -> "Bir görev planlanan süreyi geçti. Aksiyon almanız gerekebilir.";
            case TASK_STATUS_CHANGED -> "Bir görevin durumu güncellendi.";
            case SHOOT_CREATED -> "Yeni bir çekim kaydı oluşturuldu.";
            case SHOOT_UPDATED -> "Çekim durumu veya detayları güncellendi.";
            case SHOOT_REMINDER -> "Yaklaşan çekim için hatırlatma.";
            case MESSAGE_RECEIVED -> "CRM içinde yeni bir mesajınız var.";
            case CONTENT_PLAN_CREATED -> "Yeni içerik planı ekip takvimine eklendi.";
            case CONTENT_PLAN_UPDATED -> "İçerik planında güncelleme yapıldı.";
            case APPROVAL_REQUEST -> "Yeni bir onay talebi sizi bekliyor.";
            case APPROVAL_DECIDED -> "Bir onay sürecinin sonucu güncellendi.";
            case MEETING_REMINDER -> "Yaklaşan toplantınız için hatırlatma.";
            case SURVEY_REQUEST -> "Doldurmanız beklenen yeni bir anket var.";
            case FILE_SHARED -> "CRM içinde sizinle yeni bir dosya paylaşıldı.";
            case SYSTEM -> "CRM sisteminden yeni bir bilgilendirme var.";
        };
    }

    private String badgeFor(NotificationType type, String referenceType) {
        return switch (type) {
            case TASK_ASSIGNED, TASK_COMPLETED, TASK_OVERDUE, TASK_STATUS_CHANGED -> "Görev";
            case SHOOT_CREATED, SHOOT_UPDATED, SHOOT_REMINDER -> "Çekim";
            case MESSAGE_RECEIVED -> "Mesaj";
            case CONTENT_PLAN_CREATED, CONTENT_PLAN_UPDATED -> "İçerik Planı";
            case APPROVAL_REQUEST, APPROVAL_DECIDED -> "Onay";
            case MEETING_REMINDER -> "Toplantı";
            case SURVEY_REQUEST -> "Anket";
            case FILE_SHARED -> "Dosya";
            case SYSTEM -> referenceType != null && !referenceType.isBlank() ? referenceType : "Sistem";
        };
    }

    private String detailLabelFor(NotificationType type) {
        return switch (type) {
            case MESSAGE_RECEIVED -> "Mesaj konusu";
            case SHOOT_CREATED, SHOOT_UPDATED, SHOOT_REMINDER -> "Çekim";
            case CONTENT_PLAN_CREATED, CONTENT_PLAN_UPDATED -> "İçerik";
            case MEETING_REMINDER -> "Toplantı";
            case APPROVAL_REQUEST, APPROVAL_DECIDED -> "Onay";
            case FILE_SHARED -> "Dosya";
            case SURVEY_REQUEST -> "Anket";
            case SYSTEM -> "Detay";
            default -> "Görev";
        };
    }

    private String ctaFor(NotificationType type) {
        return switch (type) {
            case MESSAGE_RECEIVED -> "Mesajı aç";
            case SHOOT_CREATED, SHOOT_UPDATED, SHOOT_REMINDER -> "Çekimi incele";
            case CONTENT_PLAN_CREATED, CONTENT_PLAN_UPDATED -> "İçerik planını aç";
            case APPROVAL_REQUEST, APPROVAL_DECIDED -> "Onay ekranına git";
            case MEETING_REMINDER -> "Toplantıyı görüntüle";
            case FILE_SHARED -> "Dosyayı görüntüle";
            case SURVEY_REQUEST -> "Anketi aç";
            default -> "CRM panelini aç";
        };
    }

    private String accentFor(NotificationType type) {
        return switch (type) {
            case TASK_ASSIGNED, TASK_COMPLETED, TASK_OVERDUE, TASK_STATUS_CHANGED -> "#f97316";
            case SHOOT_CREATED, SHOOT_UPDATED, SHOOT_REMINDER -> "#ec4899";
            case MESSAGE_RECEIVED -> "#38bdf8";
            case CONTENT_PLAN_CREATED, CONTENT_PLAN_UPDATED -> "#a855f7";
            case APPROVAL_REQUEST, APPROVAL_DECIDED -> "#22c55e";
            case MEETING_REMINDER -> "#eab308";
            case SURVEY_REQUEST -> "#14b8a6";
            case FILE_SHARED -> "#6366f1";
            case SYSTEM -> "#71717a";
        };
    }

    private String transparentBackground(String color) {
        return color + "22";
    }

    private String transparentBorder(String color) {
        return color + "55";
    }

    private String crmUrl() {
        if (frontendUrl == null || frontendUrl.isBlank()) {
            return "https://crm.fogistanbul.com";
        }
        return frontendUrl;
    }

    private String fallback(String value, String fallback) {
        if (value == null || value.isBlank()) {
            return fallback;
        }
        return value;
    }

    private String escapeHtml(String value) {
        if (value == null) {
            return "";
        }
        return value
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }

    record NotificationMailTemplate(String subject, String html) {
    }
}
