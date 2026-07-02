package com.fogistanbul.crm.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;

import com.fogistanbul.crm.entity.enums.NotificationType;
import org.junit.jupiter.api.Test;

class EmailServiceTemplateTest {

    private final EmailService emailService = new EmailService(mock(MailSettingsService.class));

    @Test
    void taskTemplateUsesTaskSpecificContent() {
        var template = emailService.buildNotificationTemplate(
                NotificationType.TASK_ASSIGNED,
                "Rapor hazırla",
                "Ali size yeni bir görev atadı",
                "TASK");

        assertThat(template.subject()).isEqualTo("Yeni görev atandı: Rapor hazırla");
        assertThat(template.html()).contains("Yeni görev atandı", "Görev", "Ali size yeni bir görev atadı", "CRM panelini aç");
    }

    @Test
    void shootTemplateUsesShootSpecificContent() {
        var template = emailService.buildNotificationTemplate(
                NotificationType.SHOOT_UPDATED,
                "Aydınlife Drone Çekimi",
                null,
                "SHOOT");

        assertThat(template.subject()).isEqualTo("Çekim güncellendi: Aydınlife Drone Çekimi");
        assertThat(template.html()).contains("Çekim güncellendi", "Çekim", "Çekimi incele");
    }

    @Test
    void messageTemplateUsesMessageSpecificContent() {
        var template = emailService.buildNotificationTemplate(
                NotificationType.MESSAGE_RECEIVED,
                "Yeni müşteri mesajı",
                "CRM içinde yeni bir mesajınız var",
                "MESSAGE");

        assertThat(template.subject()).isEqualTo("Yeni mesaj: Yeni müşteri mesajı");
        assertThat(template.html()).contains("Yeni mesaj aldınız", "Mesaj", "Mesajı aç");
    }
}
