package com.fogistanbul.crm.prproject.application;

import com.fogistanbul.crm.entity.PrProject;
import com.fogistanbul.crm.entity.PrProjectMember;
import com.fogistanbul.crm.entity.PrProjectPhase;
import com.fogistanbul.crm.entity.UserProfile;
import com.fogistanbul.crm.repository.PrProjectMemberRepository;
import com.fogistanbul.crm.repository.PrProjectPhaseRepository;
import com.fogistanbul.crm.repository.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PrProjectParticipantService {

    private final UserProfileRepository userProfileRepository;
    private final PrProjectMemberRepository memberRepository;
    private final PrProjectPhaseRepository phaseRepository;
    private final PrProjectAccessPolicy accessPolicy;

    public UserProfile getUser(UUID userId) {
        return userProfileRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Kullanici bulunamadi"));
    }

    public UserProfile getOptionalUser(UUID userId, UUID companyId) {
        if (userId == null) {
            return null;
        }
        UserProfile user = getUser(userId);
        accessPolicy.requireCompanyParticipant(user, companyId);
        return user;
    }

    public void addMembers(PrProject project, List<UUID> memberIds) {
        if (memberIds == null) {
            return;
        }
        UUID companyId = project.getCompany() != null ? project.getCompany().getId() : null;
        for (UUID memberId : new LinkedHashSet<>(memberIds)) {
            if (memberId == null) {
                continue;
            }
            UserProfile member = getOptionalUser(memberId, companyId);
            memberRepository.save(PrProjectMember.builder()
                    .project(project)
                    .user(member)
                    .build());
        }
    }

    public void requireExistingParticipantsForCompany(PrProject project, UUID companyId) {
        if (project.getResponsible() != null) {
            accessPolicy.requireCompanyParticipant(project.getResponsible(), companyId);
        }
        memberRepository.findByProjectId(project.getId())
                .forEach(member -> accessPolicy.requireCompanyParticipant(member.getUser(), companyId));
        for (PrProjectPhase phase : phaseRepository.findByProjectIdOrderByPhaseNumber(project.getId())) {
            if (phase.getAssignedTo() != null) {
                accessPolicy.requireCompanyParticipant(phase.getAssignedTo(), companyId);
            }
        }
    }
}
