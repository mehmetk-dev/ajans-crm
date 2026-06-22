package com.fogistanbul.crm.meeting.application;

import com.fogistanbul.crm.entity.Meeting;
import com.fogistanbul.crm.entity.MeetingNote;
import com.fogistanbul.crm.entity.MeetingParticipant;
import com.fogistanbul.crm.entity.Person;
import com.fogistanbul.crm.entity.UserProfile;
import com.fogistanbul.crm.entity.enums.MeetingStatus;
import com.fogistanbul.crm.repository.MeetingNoteRepository;
import com.fogistanbul.crm.repository.MeetingParticipantRepository;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class MeetingMapperTest {

    private final MeetingParticipantRepository participantRepository = mock(MeetingParticipantRepository.class);
    private final MeetingNoteRepository noteRepository = mock(MeetingNoteRepository.class);
    private final MeetingMapper mapper = new MeetingMapper(participantRepository, noteRepository);

    @Test
    void mapsCreatorParticipantAndNoteAvatarUrls() {
        UUID meetingId = UUID.randomUUID();
        UserProfile creator = user("creator@test.com", "Toplanti Sahibi", "/avatar/creator.png");
        UserProfile participant = user("participant@test.com", "Toplanti Katilimci", "/avatar/participant.png");
        Meeting meeting = Meeting.builder()
                .id(meetingId)
                .title("Haftalik")
                .meetingDate(Instant.parse("2026-06-01T10:00:00Z"))
                .status(MeetingStatus.COMPLETED)
                .createdBy(creator)
                .createdAt(Instant.parse("2026-06-01T09:00:00Z"))
                .build();
        MeetingNote note = MeetingNote.builder()
                .meeting(meeting)
                .user(participant)
                .content("Not")
                .createdAt(Instant.parse("2026-06-01T11:00:00Z"))
                .build();

        when(participantRepository.findByMeetingId(meetingId)).thenReturn(List.of(
                MeetingParticipant.builder().meeting(meeting).user(participant).build()
        ));
        when(noteRepository.findByMeetingId(meetingId)).thenReturn(List.of(note));

        var response = mapper.toResponse(meeting);

        assertThat(response.getCreatedByAvatarUrl()).isEqualTo("/avatar/creator.png");
        assertThat(response.getParticipants().get(0).getAvatarUrl()).isEqualTo("/avatar/participant.png");
        assertThat(response.getNotes().get(0).getAvatarUrl()).isEqualTo("/avatar/participant.png");
    }

    private UserProfile user(String email, String fullName, String avatarUrl) {
        return UserProfile.builder()
                .id(UUID.randomUUID())
                .email(email)
                .person(Person.builder()
                        .fullName(fullName)
                        .avatarUrl(avatarUrl)
                        .build())
                .build();
    }
}
