package com.fogistanbul.crm.meeting.application;

import com.fogistanbul.crm.entity.Company;
import com.fogistanbul.crm.entity.Meeting;
import com.fogistanbul.crm.entity.MeetingParticipant;
import com.fogistanbul.crm.entity.UserProfile;
import com.fogistanbul.crm.entity.enums.GlobalRole;
import com.fogistanbul.crm.meeting.dto.CreateMeetingRequest;
import com.fogistanbul.crm.meeting.dto.MeetingResponse;
import com.fogistanbul.crm.repository.CompanyRepository;
import com.fogistanbul.crm.repository.MeetingParticipantRepository;
import com.fogistanbul.crm.repository.MeetingRepository;
import com.fogistanbul.crm.repository.UserProfileRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MeetingServiceTest {

    @Mock
    private MeetingRepository meetingRepository;
    @Mock
    private MeetingParticipantRepository participantRepository;
    @Mock
    private CompanyRepository companyRepository;
    @Mock
    private UserProfileRepository userProfileRepository;
    @Mock
    private MeetingAccessPolicy accessPolicy;
    @Mock
    private MeetingMapper mapper;
    @Mock
    private MeetingNoteService noteService;

    @InjectMocks
    private MeetingService meetingService;

    @Test
    void companyUserListUsesAllAccessibleCompanies() {
        UUID userId = UUID.randomUUID();
        UserProfile user = UserProfile.builder().id(userId).globalRole(GlobalRole.COMPANY_USER).build();
        List<UUID> companyIds = List.of(UUID.randomUUID(), UUID.randomUUID());
        PageRequest pageable = PageRequest.of(0, 20);
        Meeting meeting = Meeting.builder().id(UUID.randomUUID()).build();
        when(userProfileRepository.findById(userId)).thenReturn(Optional.of(user));
        when(accessPolicy.accessibleCompanyIds(user)).thenReturn(companyIds);
        when(meetingRepository.findByCompanyIdIn(companyIds, pageable))
                .thenReturn(new PageImpl<>(List.of(meeting), pageable, 1));

        Page<MeetingResponse> result = meetingService.getAllMeetings(pageable, userId);

        assertEquals(1, result.getTotalElements());
        verify(meetingRepository).findByCompanyIdIn(companyIds, pageable);
    }

    @Test
    void createValidatesDistinctParticipantsAgainstMeetingCompany() {
        UUID creatorId = UUID.randomUUID();
        UUID participantId = UUID.randomUUID();
        UUID companyId = UUID.randomUUID();
        UserProfile creator = UserProfile.builder().id(creatorId).globalRole(GlobalRole.AGENCY_STAFF).build();
        UserProfile participant = UserProfile.builder().id(participantId).globalRole(GlobalRole.AGENCY_STAFF).build();
        Company company = Company.builder().id(companyId).name("Acme").build();
        CreateMeetingRequest request = new CreateMeetingRequest();
        request.setCompanyId(companyId);
        request.setTitle("Planlama");
        request.setMeetingDate(Instant.now());
        request.setParticipantIds(List.of(participantId, participantId));

        when(userProfileRepository.findById(creatorId)).thenReturn(Optional.of(creator));
        when(userProfileRepository.findById(participantId)).thenReturn(Optional.of(participant));
        when(companyRepository.findById(companyId)).thenReturn(Optional.of(company));
        when(meetingRepository.save(any(Meeting.class))).thenAnswer(invocation -> {
            Meeting meeting = invocation.getArgument(0);
            meeting.setId(UUID.randomUUID());
            return meeting;
        });

        meetingService.createMeeting(request, creatorId);

        verify(accessPolicy).requireCompanyAccess(creator, companyId);
        verify(accessPolicy).requireParticipantAccess(participant, companyId);
        ArgumentCaptor<MeetingParticipant> captor = ArgumentCaptor.forClass(MeetingParticipant.class);
        verify(participantRepository).save(captor.capture());
        assertEquals(participantId, captor.getValue().getUser().getId());
    }
}
