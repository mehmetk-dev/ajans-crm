package com.fogistanbul.crm.calendar.application;

import com.fogistanbul.crm.entity.Shoot;
import com.fogistanbul.crm.repository.CompanyMembershipRepository;
import com.fogistanbul.crm.repository.MeetingRepository;
import com.fogistanbul.crm.repository.ShootRepository;
import com.fogistanbul.crm.repository.TaskRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CalendarExportServiceTest {

    @Mock
    private MeetingRepository meetingRepository;
    @Mock
    private ShootRepository shootRepository;
    @Mock
    private TaskRepository taskRepository;
    @Mock
    private CompanyMembershipRepository membershipRepository;

    private CalendarExportService service;

    @BeforeEach
    void setUp() {
        service = new CalendarExportService(
                meetingRepository,
                shootRepository,
                taskRepository,
                membershipRepository
        );
    }

    @Test
    void exportsOnlyEntriesFromAccessibleCompaniesAndEscapesText() {
        UUID userId = UUID.randomUUID();
        UUID companyId = UUID.randomUUID();
        Shoot shoot = Shoot.builder()
                .id(UUID.randomUUID())
                .title("Ürün, katalog; yaz")
                .description("Birinci satır\nİkinci satır")
                .shootDate(Instant.parse("2026-06-12T09:00:00Z"))
                .build();
        when(membershipRepository.findCompanyIdsByUserId(userId)).thenReturn(List.of(companyId));
        when(meetingRepository.findByCompanyIdIn(List.of(companyId))).thenReturn(List.of());
        when(shootRepository.findByCompanyIdIn(List.of(companyId))).thenReturn(List.of(shoot));
        when(taskRepository.findByCompanyIdIn(List.of(companyId))).thenReturn(List.of());

        String calendar = service.export(userId, false);

        assertThat(calendar)
                .contains("DTSTART:20260612T090000Z")
                .contains("SUMMARY:Çekim Ürün\\, katalog\\; yaz")
                .contains("DESCRIPTION:Birinci satır\\nİkinci satır")
                .endsWith("END:VCALENDAR\r\n");
        verify(shootRepository, never()).findAll();
    }

    @Test
    void adminExportLoadsAllEntries() {
        UUID userId = UUID.randomUUID();
        when(meetingRepository.findAll()).thenReturn(List.of());
        when(shootRepository.findAll()).thenReturn(List.of());
        when(taskRepository.findAll()).thenReturn(List.of());

        service.export(userId, true);

        verify(meetingRepository).findAll();
        verify(shootRepository).findAll();
        verify(taskRepository).findAll();
        verify(membershipRepository, never()).findCompanyIdsByUserId(userId);
    }
}
