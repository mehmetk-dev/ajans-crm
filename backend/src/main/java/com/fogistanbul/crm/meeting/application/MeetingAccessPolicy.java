package com.fogistanbul.crm.meeting.application;

import com.fogistanbul.crm.company.application.CompanyAccessPolicy;
import com.fogistanbul.crm.entity.Meeting;
import com.fogistanbul.crm.entity.UserProfile;
import com.fogistanbul.crm.entity.enums.GlobalRole;
import com.fogistanbul.crm.repository.MeetingParticipantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class MeetingAccessPolicy {

    private final CompanyAccessPolicy companyAccessPolicy;
    private final MeetingParticipantRepository participantRepository;

    public void requireRead(Meeting meeting, UserProfile user) {
        if (meeting.getCompany() != null) {
            companyAccessPolicy.requireAccess(user, meeting.getCompany().getId());
            return;
        }
        if (isAdmin(user)
                || user.getGlobalRole() == GlobalRole.AGENCY_STAFF
                || isCreator(meeting, user.getId())
                || isParticipant(meeting, user.getId())) {
            return;
        }
        throw new AccessDeniedException("Bu toplantiyi goruntuleme yetkiniz yok");
    }

    public void requireManage(Meeting meeting, UserProfile user) {
        requireRead(meeting, user);
        if (isAdmin(user) || isCreator(meeting, user.getId())) {
            return;
        }
        throw new AccessDeniedException("Bu toplantiyi guncelleme yetkiniz yok");
    }

    public void requireAddNote(Meeting meeting, UserProfile user) {
        requireRead(meeting, user);
        if (isAdmin(user) || isCreator(meeting, user.getId()) || isParticipant(meeting, user.getId())) {
            return;
        }
        throw new AccessDeniedException("Bu toplantiya not ekleme yetkiniz yok");
    }

    public void requireCompanyAccess(UserProfile user, UUID companyId) {
        companyAccessPolicy.requireAccess(user, companyId);
    }

    public void requireParticipantAccess(UserProfile participant, UUID companyId) {
        if (companyId != null) {
            companyAccessPolicy.requireAccess(participant, companyId);
        }
    }

    public List<UUID> accessibleCompanyIds(UserProfile user) {
        return companyAccessPolicy.accessibleClientCompanyIds(user);
    }

    private boolean isAdmin(UserProfile user) {
        return user.getGlobalRole() == GlobalRole.ADMIN;
    }

    private boolean isCreator(Meeting meeting, UUID userId) {
        return meeting.getCreatedBy() != null && meeting.getCreatedBy().getId().equals(userId);
    }

    private boolean isParticipant(Meeting meeting, UUID userId) {
        return meeting.getId() != null
                && participantRepository.findByMeetingId(meeting.getId()).stream()
                .anyMatch(participant -> participant.getUser().getId().equals(userId));
    }
}
