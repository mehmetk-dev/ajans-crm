package com.fogistanbul.crm.calendar.web;

import com.fogistanbul.crm.calendar.application.CalendarExportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/calendar")
@RequiredArgsConstructor
public class CalendarExportController {

    private final CalendarExportService calendarExportService;

    @GetMapping("/export.ics")
    public ResponseEntity<String> exportCalendar(Authentication authentication) {
        UUID userId = (UUID) authentication.getPrincipal();
        boolean admin = authentication.getAuthorities().stream()
                .anyMatch(authority -> "ROLE_ADMIN".equals(authority.getAuthority()));

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("text/calendar"))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"fog-calendar.ics\"")
                .body(calendarExportService.export(userId, admin));
    }
}
