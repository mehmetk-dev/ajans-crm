package com.fogistanbul.crm.calendar.application;

import com.fogistanbul.crm.entity.Meeting;
import com.fogistanbul.crm.entity.Shoot;
import com.fogistanbul.crm.entity.Task;
import com.fogistanbul.crm.repository.CompanyMembershipRepository;
import com.fogistanbul.crm.repository.MeetingRepository;
import com.fogistanbul.crm.repository.ShootRepository;
import com.fogistanbul.crm.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CalendarExportService {

    private static final DateTimeFormatter ICAL_DT = DateTimeFormatter.ofPattern("yyyyMMdd'T'HHmmss'Z'")
            .withZone(ZoneId.of("UTC"));

    private final MeetingRepository meetingRepository;
    private final ShootRepository shootRepository;
    private final TaskRepository taskRepository;
    private final CompanyMembershipRepository membershipRepository;

    @Transactional(readOnly = true)
    public String export(UUID userId, boolean admin) {
        CalendarEntries entries = loadEntries(userId, admin);
        StringBuilder calendar = new StringBuilder()
                .append("BEGIN:VCALENDAR\r\n")
                .append("VERSION:2.0\r\n")
                .append("PRODID:-//FOG Istanbul CRM//TR\r\n")
                .append("CALSCALE:GREGORIAN\r\n")
                .append("METHOD:PUBLISH\r\n");

        entries.meetings().forEach(meeting -> appendMeeting(calendar, meeting));
        entries.shoots().forEach(shoot -> appendShoot(calendar, shoot));
        entries.tasks().forEach(task -> appendTask(calendar, task));
        return calendar.append("END:VCALENDAR\r\n").toString();
    }

    private CalendarEntries loadEntries(UUID userId, boolean admin) {
        if (admin) {
            return new CalendarEntries(
                    meetingRepository.findAll(),
                    shootRepository.findAll(),
                    taskRepository.findAll()
            );
        }
        List<UUID> companyIds = membershipRepository.findCompanyIdsByUserId(userId);
        if (companyIds.isEmpty()) {
            return new CalendarEntries(List.of(), List.of(), List.of());
        }
        return new CalendarEntries(
                meetingRepository.findByCompanyIdIn(companyIds),
                shootRepository.findByCompanyIdIn(companyIds),
                taskRepository.findByCompanyIdIn(companyIds)
        );
    }

    private void appendMeeting(StringBuilder calendar, Meeting meeting) {
        if (meeting.getMeetingDate() == null) return;
        calendar.append("BEGIN:VEVENT\r\n")
                .append("UID:meeting-").append(meeting.getId()).append("@fogistanbul.com\r\n")
                .append("DTSTART:").append(ICAL_DT.format(meeting.getMeetingDate())).append("\r\n");
        if (meeting.getDurationMinutes() != null) {
            Instant endTime = meeting.getMeetingDate().plusSeconds(meeting.getDurationMinutes() * 60L);
            calendar.append("DTEND:").append(ICAL_DT.format(endTime)).append("\r\n");
        }
        appendText(calendar, "SUMMARY", meeting.getTitle());
        appendText(calendar, "LOCATION", meeting.getLocation());
        appendText(calendar, "DESCRIPTION", meeting.getDescription());
        calendar.append("STATUS:").append(meeting.getStatus().name()).append("\r\n")
                .append("END:VEVENT\r\n");
    }

    private void appendShoot(StringBuilder calendar, Shoot shoot) {
        if (shoot.getShootDate() == null) return;
        calendar.append("BEGIN:VEVENT\r\n")
                .append("UID:shoot-").append(shoot.getId()).append("@fogistanbul.com\r\n")
                .append("DTSTART:").append(ICAL_DT.format(shoot.getShootDate())).append("\r\n");
        appendText(calendar, "SUMMARY", "Çekim " + shoot.getTitle());
        appendText(calendar, "LOCATION", shoot.getLocation());
        appendText(calendar, "DESCRIPTION", shoot.getDescription());
        calendar.append("END:VEVENT\r\n");
    }

    private void appendTask(StringBuilder calendar, Task task) {
        if (task.getStartDate() == null && task.getEndDate() == null) return;
        calendar.append("BEGIN:VEVENT\r\n")
                .append("UID:task-").append(task.getId()).append("@fogistanbul.com\r\n");
        if (task.getStartDate() != null) {
            calendar.append("DTSTART:").append(ICAL_DT.format(task.getStartDate())).append("\r\n");
        }
        if (task.getEndDate() != null) {
            calendar.append("DTEND:").append(ICAL_DT.format(task.getEndDate())).append("\r\n");
        }
        appendText(calendar, "SUMMARY", "Görev " + task.getTitle());
        appendText(calendar, "DESCRIPTION", task.getDescription());
        calendar.append("END:VEVENT\r\n");
    }

    private void appendText(StringBuilder calendar, String property, String value) {
        if (value != null && !value.isBlank()) {
            calendar.append(property).append(':').append(escapeIcal(value)).append("\r\n");
        }
    }

    private String escapeIcal(String text) {
        return text.replace("\\", "\\\\")
                .replace(",", "\\,")
                .replace(";", "\\;")
                .replace("\r\n", "\\n")
                .replace("\n", "\\n");
    }

    private record CalendarEntries(List<Meeting> meetings, List<Shoot> shoots, List<Task> tasks) {
    }
}
