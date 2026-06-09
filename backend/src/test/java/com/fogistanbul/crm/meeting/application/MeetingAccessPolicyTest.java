package com.fogistanbul.crm.meeting.application;

import com.fogistanbul.crm.company.application.CompanyAccessPolicy;
import com.fogistanbul.crm.entity.Company;
import com.fogistanbul.crm.entity.Meeting;
import com.fogistanbul.crm.entity.MeetingParticipant;
import com.fogistanbul.crm.entity.UserProfile;
import com.fogistanbul.crm.entity.enums.GlobalRole;
import com.fogistanbul.crm.repository.MeetingParticipantRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MeetingAccessPolicyTest {

    @Mock
    private CompanyAccessPolicy companyAccessPolicy;
    @Mock
    private MeetingParticipantRepository participantRepository;

    @Test
    void companyMeetingReadUsesCompanyAccessPolicy() {
        MeetingAccessPolicy policy = new MeetingAccessPolicy(companyAccessPolicy, participantRepository);
        UserProfile user = user(GlobalRole.COMPANY_USER);
        UUID companyId = UUID.randomUUID();
        Meeting meeting = meeting(companyId, UUID.randomUUID());

        assertDoesNotThrow(() -> policy.requireRead(meeting, user));

        verify(companyAccessPolicy).requireAccess(user, companyId);
        verifyNoInteractions(participantRepository);
    }

    @Test
    void companyUserCannotReadInternalMeetingWithoutParticipation() {
        MeetingAccessPolicy policy = new MeetingAccessPolicy(companyAccessPolicy, participantRepository);
        UserProfile user = user(GlobalRole.COMPANY_USER);
        Meeting meeting = meeting(null, UUID.randomUUID());
        when(participantRepository.findByMeetingId(meeting.getId())).thenReturn(List.of());

        assertThrows(AccessDeniedException.class, () -> policy.requireRead(meeting, user));
    }

    @Test
    void participantCanReadInternalMeetingButCannotManageIt() {
        MeetingAccessPolicy policy = new MeetingAccessPolicy(companyAccessPolicy, participantRepository);
        UserProfile user = user(GlobalRole.COMPANY_USER);
        Meeting meeting = meeting(null, UUID.randomUUID());
        when(participantRepository.findByMeetingId(meeting.getId()))
                .thenReturn(List.of(MeetingParticipant.builder().meeting(meeting).user(user).build()));

        assertDoesNotThrow(() -> policy.requireRead(meeting, user));
        assertThrows(AccessDeniedException.class, () -> policy.requireManage(meeting, user));
    }

    @Test
    void companyParticipantMustHaveCompanyAccess() {
        MeetingAccessPolicy policy = new MeetingAccessPolicy(companyAccessPolicy, participantRepository);
        UserProfile participant = user(GlobalRole.AGENCY_STAFF);
        UUID companyId = UUID.randomUUID();

        policy.requireParticipantAccess(participant, companyId);

        verify(companyAccessPolicy).requireAccess(participant, companyId);
    }

    private Meeting meeting(UUID companyId, UUID creatorId) {
        return Meeting.builder()
                .id(UUID.randomUUID())
                .company(companyId == null ? null : Company.builder().id(companyId).build())
                .createdBy(UserProfile.builder().id(creatorId).build())
                .build();
    }

    private UserProfile user(GlobalRole role) {
        return UserProfile.builder()
                .id(UUID.randomUUID())
                .globalRole(role)
                .email("user@example.com")
                .build();
    }
}
