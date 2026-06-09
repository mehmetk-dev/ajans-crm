package com.fogistanbul.crm.meeting.application;

import com.fogistanbul.crm.entity.Meeting;
import com.fogistanbul.crm.entity.MeetingNote;
import com.fogistanbul.crm.entity.UserProfile;
import com.fogistanbul.crm.repository.MeetingNoteRepository;
import com.fogistanbul.crm.repository.UserProfileRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MeetingNoteServiceTest {

    @Mock
    private MeetingNoteRepository meetingNoteRepository;
    @Mock
    private UserProfileRepository userProfileRepository;

    @Test
    void createsNoteWhenUserHasNoExistingNote() {
        MeetingNoteService service = new MeetingNoteService(meetingNoteRepository, userProfileRepository);
        Meeting meeting = Meeting.builder().id(UUID.randomUUID()).build();
        UUID userId = UUID.randomUUID();
        UserProfile user = UserProfile.builder().id(userId).build();
        when(meetingNoteRepository.findByMeetingIdAndUserId(meeting.getId(), userId))
                .thenReturn(Optional.empty());
        when(userProfileRepository.findById(userId)).thenReturn(Optional.of(user));

        service.save(meeting, userId, "Kararlar");

        ArgumentCaptor<MeetingNote> captor = ArgumentCaptor.forClass(MeetingNote.class);
        verify(meetingNoteRepository).save(captor.capture());
        assertEquals("Kararlar", captor.getValue().getContent());
        assertEquals(userId, captor.getValue().getUser().getId());
    }

    @Test
    void updatesExistingUserNote() {
        MeetingNoteService service = new MeetingNoteService(meetingNoteRepository, userProfileRepository);
        Meeting meeting = Meeting.builder().id(UUID.randomUUID()).build();
        UUID userId = UUID.randomUUID();
        MeetingNote note = MeetingNote.builder().meeting(meeting).content("Eski").build();
        when(meetingNoteRepository.findByMeetingIdAndUserId(meeting.getId(), userId))
                .thenReturn(Optional.of(note));

        service.save(meeting, userId, "Yeni");

        assertEquals("Yeni", note.getContent());
        verify(meetingNoteRepository).save(note);
    }
}
