package com.fogistanbul.crm.shoot.application;

import com.fogistanbul.crm.entity.Company;
import com.fogistanbul.crm.entity.Shoot;
import com.fogistanbul.crm.entity.enums.NotificationType;
import com.fogistanbul.crm.entity.enums.ShootStatus;
import com.fogistanbul.crm.repository.CompanyMembershipRepository;
import com.fogistanbul.crm.repository.ShootRepository;
import com.fogistanbul.crm.service.NotificationService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ShootReminderSchedulerTest {

    @Mock
    private ShootRepository shootRepository;
    @Mock
    private CompanyMembershipRepository membershipRepository;
    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private ShootReminderScheduler scheduler;

    @Test
    void sendsOneDayReminderForOlderPlannedShootsAndMarksThemSent() {
        Instant now = Instant.parse("2026-07-03T09:00:00Z");
        UUID companyId = UUID.randomUUID();
        UUID shootId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        Shoot shoot = Shoot.builder()
                .id(shootId)
                .company(Company.builder().id(companyId).build())
                .title("Aydinlife showroom cekimi")
                .status(ShootStatus.PLANNED)
                .shootDate(now.plus(ShootReminderScheduler.REMINDER_OFFSET).plusSeconds(600))
                .createdAt(now.minusSeconds(172_800))
                .build();
        when(shootRepository.findReminderCandidates(
                eq(ShootStatus.PLANNED),
                eq(now.plus(ShootReminderScheduler.REMINDER_OFFSET)),
                eq(now.plus(ShootReminderScheduler.REMINDER_OFFSET).plus(ShootReminderScheduler.REMINDER_WINDOW)),
                eq(now.minus(ShootReminderScheduler.MINIMUM_CREATION_AGE))))
                .thenReturn(List.of(shoot));
        when(membershipRepository.findCompanyUserIdsByCompanyId(companyId)).thenReturn(List.of(userId));

        int sent = scheduler.sendDueReminders(now);

        assertEquals(1, sent);
        assertEquals(now, shoot.getReminderSentAt());
        verify(notificationService).send(
                userId,
                NotificationType.SHOOT_REMINDER,
                "Çekim yarın: Aydinlife showroom cekimi",
                "Çekim tarihi: 2026-07-04",
                "SHOOT",
                shootId);
    }

    @Test
    void reminderQueryRequiresShootToBeAtLeastOneDayOldToAvoidNearCreationDoubleMail() {
        Instant now = Instant.parse("2026-07-03T09:00:00Z");
        ArgumentCaptor<Instant> createdBeforeCaptor = ArgumentCaptor.forClass(Instant.class);
        when(shootRepository.findReminderCandidates(
                eq(ShootStatus.PLANNED),
                eq(now.plus(ShootReminderScheduler.REMINDER_OFFSET)),
                eq(now.plus(ShootReminderScheduler.REMINDER_OFFSET).plus(ShootReminderScheduler.REMINDER_WINDOW)),
                createdBeforeCaptor.capture()))
                .thenReturn(List.of());

        int sent = scheduler.sendDueReminders(now);

        assertEquals(0, sent);
        assertEquals(now.minus(ShootReminderScheduler.MINIMUM_CREATION_AGE), createdBeforeCaptor.getValue());
    }
}
