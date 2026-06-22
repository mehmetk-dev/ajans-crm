package com.fogistanbul.crm.meeting.application;

import com.fogistanbul.crm.entity.Meeting;
import com.fogistanbul.crm.entity.MeetingNote;
import com.fogistanbul.crm.entity.MeetingParticipant;
import com.fogistanbul.crm.entity.UserProfile;
import com.fogistanbul.crm.meeting.dto.MeetingResponse;
import com.fogistanbul.crm.repository.MeetingNoteRepository;
import com.fogistanbul.crm.repository.MeetingParticipantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class MeetingMapper {

    private final MeetingParticipantRepository participantRepository;
    private final MeetingNoteRepository meetingNoteRepository;

    public MeetingResponse toResponse(Meeting meeting) {
        List<MeetingParticipant> participants = participantRepository.findByMeetingId(meeting.getId());
        List<MeetingNote> notes = meetingNoteRepository.findByMeetingId(meeting.getId());
        var noteUserIds = notes.stream().map(note -> note.getUser().getId()).toList();

        return MeetingResponse.builder()
                .id(meeting.getId())
                .companyId(meeting.getCompany() != null ? meeting.getCompany().getId() : null)
                .companyName(meeting.getCompany() != null ? meeting.getCompany().getName() : null)
                .title(meeting.getTitle())
                .description(meeting.getDescription())
                .meetingDate(meeting.getMeetingDate())
                .durationMinutes(meeting.getDurationMinutes())
                .location(meeting.getLocation())
                .status(meeting.getStatus().name())
                .createdById(meeting.getCreatedBy().getId())
                .createdByName(displayName(meeting.getCreatedBy()))
                .createdByAvatarUrl(avatarUrl(meeting.getCreatedBy()))
                .participants(participants.stream().map(participant -> MeetingResponse.ParticipantInfo.builder()
                        .userId(participant.getUser().getId())
                        .fullName(displayName(participant.getUser()))
                        .avatarUrl(avatarUrl(participant.getUser()))
                        .email(participant.getUser().getEmail())
                        .noteSubmitted(noteUserIds.contains(participant.getUser().getId()))
                        .build()).toList())
                .notes(notes.stream().map(note -> MeetingResponse.NoteInfo.builder()
                        .userId(note.getUser().getId())
                        .fullName(displayName(note.getUser()))
                        .avatarUrl(avatarUrl(note.getUser()))
                        .content(note.getContent())
                        .createdAt(note.getCreatedAt())
                        .build()).toList())
                .createdAt(meeting.getCreatedAt())
                .build();
    }

    private String displayName(UserProfile user) {
        return user.getPerson() != null ? user.getPerson().getFullName() : user.getEmail();
    }

    private String avatarUrl(UserProfile user) {
        return user.getPerson() != null ? user.getPerson().getAvatarUrl() : null;
    }
}
