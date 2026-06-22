package com.fogistanbul.crm.meeting.application;

import com.fogistanbul.crm.entity.Meeting;
import com.fogistanbul.crm.entity.MeetingNote;
import com.fogistanbul.crm.entity.UserProfile;
import com.fogistanbul.crm.repository.MeetingNoteRepository;
import com.fogistanbul.crm.repository.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MeetingNoteService {

    private final MeetingNoteRepository meetingNoteRepository;
    private final UserProfileRepository userProfileRepository;

    public void save(Meeting meeting, UUID userId, String content) {
        MeetingNote note = meetingNoteRepository.findByMeetingIdAndUserId(meeting.getId(), userId)
                .orElseGet(() -> MeetingNote.builder()
                        .meeting(meeting)
                        .user(getUserOrThrow(userId))
                        .build());
        note.setContent(content);
        meetingNoteRepository.save(note);
    }

    private UserProfile getUserOrThrow(UUID userId) {
        return userProfileRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı"));
    }
}
