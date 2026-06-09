package com.fogistanbul.crm.meeting.web;

import com.fogistanbul.crm.entity.enums.MeetingStatus;
import com.fogistanbul.crm.meeting.application.MeetingService;
import com.fogistanbul.crm.meeting.dto.CreateMeetingRequest;
import com.fogistanbul.crm.meeting.dto.MeetingNoteRequest;
import com.fogistanbul.crm.meeting.dto.MeetingResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/staff/meetings")
@RequiredArgsConstructor
public class MeetingController {

    private final MeetingService meetingService;

    @PostMapping
    public ResponseEntity<MeetingResponse> create(
            @Valid @RequestBody CreateMeetingRequest request,
            Authentication auth) {
        UUID userId = (UUID) auth.getPrincipal();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(meetingService.createMeeting(request, userId));
    }

    @GetMapping
    public Page<MeetingResponse> getAll(
            @PageableDefault(size = 20) Pageable pageable,
            Authentication auth) {
        return meetingService.getAllMeetings(pageable, (UUID) auth.getPrincipal());
    }

    @GetMapping("/company/{companyId}")
    public Page<MeetingResponse> getByCompany(
            @PathVariable UUID companyId,
            @PageableDefault(size = 20) Pageable pageable,
            Authentication auth) {
        return meetingService.getMeetingsByCompany(companyId, pageable, (UUID) auth.getPrincipal());
    }

    @GetMapping("/{id}")
    public MeetingResponse getById(@PathVariable UUID id, Authentication auth) {
        return meetingService.getMeetingById(id, (UUID) auth.getPrincipal());
    }

    @PutMapping("/{id}/status")
    public MeetingResponse updateStatus(
            @PathVariable UUID id,
            @RequestParam MeetingStatus status,
            Authentication auth) {
        return meetingService.updateStatus(id, status, (UUID) auth.getPrincipal());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id, Authentication auth) {
        meetingService.deleteMeeting(id, (UUID) auth.getPrincipal());
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/complete")
    public MeetingResponse completeMeeting(
            @PathVariable UUID id,
            @Valid @RequestBody MeetingNoteRequest request,
            Authentication auth) {
        return meetingService.completeMeeting(id, request, (UUID) auth.getPrincipal());
    }

    @PostMapping("/{id}/notes")
    public MeetingResponse addNote(
            @PathVariable UUID id,
            @Valid @RequestBody MeetingNoteRequest request,
            Authentication auth) {
        return meetingService.addMeetingNote(id, request, (UUID) auth.getPrincipal());
    }
}
