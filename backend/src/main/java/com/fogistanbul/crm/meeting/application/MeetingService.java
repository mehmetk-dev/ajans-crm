package com.fogistanbul.crm.meeting.application;

import com.fogistanbul.crm.entity.Company;
import com.fogistanbul.crm.entity.Meeting;
import com.fogistanbul.crm.entity.MeetingParticipant;
import com.fogistanbul.crm.entity.UserProfile;
import com.fogistanbul.crm.entity.enums.GlobalRole;
import com.fogistanbul.crm.entity.enums.MeetingStatus;
import com.fogistanbul.crm.meeting.dto.CreateMeetingRequest;
import com.fogistanbul.crm.meeting.dto.MeetingNoteRequest;
import com.fogistanbul.crm.meeting.dto.MeetingResponse;
import com.fogistanbul.crm.repository.CompanyRepository;
import com.fogistanbul.crm.repository.MeetingParticipantRepository;
import com.fogistanbul.crm.repository.MeetingRepository;
import com.fogistanbul.crm.repository.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class MeetingService {

    private final MeetingRepository meetingRepository;
    private final MeetingParticipantRepository participantRepository;
    private final CompanyRepository companyRepository;
    private final UserProfileRepository userProfileRepository;
    private final MeetingAccessPolicy accessPolicy;
    private final MeetingMapper mapper;
    private final MeetingNoteService noteService;

    @Transactional
    public MeetingResponse createMeeting(CreateMeetingRequest request, UUID createdById) {
        UserProfile creator = getUserOrThrow(createdById);
        Company company = getCompany(request.getCompanyId());
        if (company != null) {
            accessPolicy.requireCompanyAccess(creator, company.getId());
        }

        Meeting meeting = meetingRepository.save(Meeting.builder()
                .company(company)
                .title(request.getTitle())
                .description(request.getDescription())
                .meetingDate(request.getMeetingDate())
                .durationMinutes(request.getDurationMinutes())
                .location(request.getLocation())
                .createdBy(creator)
                .build());

        for (UUID participantId : distinctParticipantIds(request.getParticipantIds())) {
            UserProfile participant = getUserOrThrow(participantId);
            accessPolicy.requireParticipantAccess(participant, company != null ? company.getId() : null);
            participantRepository.save(MeetingParticipant.builder()
                    .meeting(meeting)
                    .user(participant)
                    .build());
        }

        log.info("Meeting created: {}{}", meeting.getTitle(),
                company != null ? " for company " + company.getName() : " (agency internal)");
        return mapper.toResponse(meeting);
    }

    @Transactional(readOnly = true)
    public Page<MeetingResponse> getAllMeetings(Pageable pageable, UUID userId) {
        UserProfile user = getUserOrThrow(userId);
        if (user.getGlobalRole() == GlobalRole.ADMIN || user.getGlobalRole() == GlobalRole.AGENCY_STAFF) {
            return meetingRepository.findAll(pageable).map(mapper::toResponse);
        }

        List<UUID> companyIds = accessPolicy.accessibleCompanyIds(user);
        if (companyIds.isEmpty()) {
            return Page.empty(pageable);
        }
        return meetingRepository.findByCompanyIdIn(companyIds, pageable).map(mapper::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<MeetingResponse> getMeetingsByCompany(UUID companyId, Pageable pageable, UUID userId) {
        accessPolicy.requireCompanyAccess(getUserOrThrow(userId), companyId);
        return meetingRepository.findByCompanyId(companyId, pageable).map(mapper::toResponse);
    }

    @Transactional(readOnly = true)
    public MeetingResponse getMeetingById(UUID meetingId, UUID userId) {
        Meeting meeting = getMeetingOrThrow(meetingId);
        accessPolicy.requireRead(meeting, getUserOrThrow(userId));
        return mapper.toResponse(meeting);
    }

    @Transactional
    public MeetingResponse updateStatus(UUID meetingId, MeetingStatus status, UUID userId) {
        Meeting meeting = getMeetingOrThrow(meetingId);
        accessPolicy.requireManage(meeting, getUserOrThrow(userId));
        meeting.setStatus(status);
        return mapper.toResponse(meetingRepository.save(meeting));
    }

    @Transactional
    public MeetingResponse completeMeeting(UUID meetingId, MeetingNoteRequest request, UUID userId) {
        Meeting meeting = getMeetingOrThrow(meetingId);
        accessPolicy.requireManage(meeting, getUserOrThrow(userId));
        meeting.setStatus(MeetingStatus.COMPLETED);
        meetingRepository.save(meeting);
        noteService.save(meeting, userId, request.getContent());
        log.info("Meeting completed: {} by user {}", meeting.getTitle(), userId);
        return mapper.toResponse(meeting);
    }

    @Transactional
    public MeetingResponse addMeetingNote(UUID meetingId, MeetingNoteRequest request, UUID userId) {
        Meeting meeting = getMeetingOrThrow(meetingId);
        accessPolicy.requireAddNote(meeting, getUserOrThrow(userId));
        noteService.save(meeting, userId, request.getContent());
        return mapper.toResponse(meeting);
    }

    @Transactional
    public void deleteMeeting(UUID meetingId, UUID userId) {
        Meeting meeting = getMeetingOrThrow(meetingId);
        accessPolicy.requireManage(meeting, getUserOrThrow(userId));
        meetingRepository.delete(meeting);
    }

    private Company getCompany(UUID companyId) {
        if (companyId == null) {
            return null;
        }
        return companyRepository.findById(companyId)
                .orElseThrow(() -> new RuntimeException("Sirket bulunamadi"));
    }

    private Meeting getMeetingOrThrow(UUID meetingId) {
        return meetingRepository.findById(meetingId)
                .orElseThrow(() -> new RuntimeException("Toplanti bulunamadi"));
    }

    private UserProfile getUserOrThrow(UUID userId) {
        return userProfileRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Kullanici bulunamadi"));
    }

    private List<UUID> distinctParticipantIds(List<UUID> participantIds) {
        return participantIds == null ? List.of() : List.copyOf(new LinkedHashSet<>(participantIds));
    }
}
