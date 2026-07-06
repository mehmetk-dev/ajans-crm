package com.fogistanbul.crm.shoot.application;

import com.fogistanbul.crm.entity.Shoot;
import com.fogistanbul.crm.entity.enums.NotificationType;
import com.fogistanbul.crm.entity.enums.ShootStatus;
import com.fogistanbul.crm.repository.CompanyMembershipRepository;
import com.fogistanbul.crm.repository.ShootRepository;
import com.fogistanbul.crm.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class ShootReminderScheduler {

    static final Duration REMINDER_OFFSET = Duration.ofHours(24);
    static final Duration REMINDER_WINDOW = Duration.ofHours(1);
    static final Duration MINIMUM_CREATION_AGE = Duration.ofHours(24);

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE
            .withZone(ZoneId.systemDefault());

    private final ShootRepository shootRepository;
    private final CompanyMembershipRepository membershipRepository;
    private final NotificationService notificationService;

    @Scheduled(fixedRateString = "${app.shoots.reminder-check-rate-ms:300000}")
    @Transactional
    public void sendOneDayReminders() {
        int count = sendDueReminders(Instant.now());
        if (count > 0) {
            log.info("Sent one-day reminders for {} shoots", count);
        }
    }

    int sendDueReminders(Instant now) {
        Instant startsAt = now.plus(REMINDER_OFFSET);
        Instant endsBefore = startsAt.plus(REMINDER_WINDOW);
        Instant createdBefore = now.minus(MINIMUM_CREATION_AGE);

        var shoots = shootRepository.findReminderCandidates(
                ShootStatus.PLANNED,
                startsAt,
                endsBefore,
                createdBefore);

        shoots.forEach(shoot -> {
            notifyCompanyMembers(shoot);
            shoot.setReminderSentAt(now);
        });

        return shoots.size();
    }

    private void notifyCompanyMembers(Shoot shoot) {
        UUID companyId = shoot.getCompany().getId();
        membershipRepository.findCompanyUserIdsByCompanyId(companyId)
                .forEach(memberId -> notificationService.send(
                        memberId,
                        NotificationType.SHOOT_REMINDER,
                        "Çekim yarın: " + shoot.getTitle(),
                        "Çekim tarihi: " + formatDate(shoot),
                        "SHOOT",
                        shoot.getId()));
    }

    private String formatDate(Shoot shoot) {
        if (shoot.getShootDate() == null) {
            return "Belirtilmedi";
        }
        return DATE_FORMATTER.format(shoot.getShootDate());
    }
}
