package com.fogistanbul.crm.prproject.application;

import com.fogistanbul.crm.entity.PrPhaseNote;
import com.fogistanbul.crm.entity.PrProject;
import com.fogistanbul.crm.entity.PrProjectMember;
import com.fogistanbul.crm.entity.PrProjectPhase;
import com.fogistanbul.crm.entity.UserProfile;
import com.fogistanbul.crm.prproject.dto.PrProjectResponse;
import com.fogistanbul.crm.repository.PrPhaseNoteRepository;
import com.fogistanbul.crm.repository.PrProjectMemberRepository;
import com.fogistanbul.crm.repository.PrProjectPhaseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class PrProjectMapper {

    private final PrProjectPhaseRepository phaseRepository;
    private final PrProjectMemberRepository memberRepository;
    private final PrPhaseNoteRepository phaseNoteRepository;

    public PrProjectResponse toResponse(PrProject project) {
        List<PrProjectPhase> phases =
                phaseRepository.findByProjectIdOrderByPhaseNumber(project.getId());
        List<PrProjectMember> members = memberRepository.findByProjectId(project.getId());
        List<PrPhaseNote> notes =
                phaseNoteRepository.findByPhaseProjectIdOrderByCreatedAtDesc(project.getId());

        return PrProjectResponse.builder()
                .id(project.getId())
                .companyId(project.getCompany() != null ? project.getCompany().getId() : null)
                .companyName(project.getCompany() != null ? project.getCompany().getName() : null)
                .name(project.getName())
                .purpose(project.getPurpose())
                .totalPhases(project.getTotalPhases())
                .currentPhase(project.getCurrentPhase())
                .progressPercent(project.getProgressPercent())
                .status(project.getStatus().name())
                .createdById(project.getCreatedBy().getId())
                .createdByName(displayName(project.getCreatedBy()))
                .responsibleId(project.getResponsible() != null ? project.getResponsible().getId() : null)
                .responsibleName(displayName(project.getResponsible()))
                .startDate(project.getStartDate())
                .endDate(project.getEndDate())
                .notes(project.getNotes())
                .phases(phases.stream().map(phase -> mapPhase(phase, notes)).toList())
                .members(members.stream().map(this::mapMember).toList())
                .createdAt(project.getCreatedAt())
                .build();
    }

    private PrProjectResponse.PhaseInfo mapPhase(
            PrProjectPhase phase,
            List<PrPhaseNote> notes
    ) {
        return PrProjectResponse.PhaseInfo.builder()
                .id(phase.getId())
                .phaseNumber(phase.getPhaseNumber())
                .name(phase.getName())
                .isCompleted(phase.getIsCompleted())
                .completedAt(phase.getCompletedAt())
                .assignedToId(phase.getAssignedTo() != null ? phase.getAssignedTo().getId() : null)
                .assignedToName(displayName(phase.getAssignedTo()))
                .taskId(phase.getTask() != null ? phase.getTask().getId() : null)
                .startDate(phase.getStartDate())
                .endDate(phase.getEndDate())
                .notes(phase.getNotes())
                .status(phase.getStatus())
                .phaseNotes(notes.stream()
                        .filter(note -> note.getPhase().getId().equals(phase.getId()))
                        .map(this::mapNote)
                        .toList())
                .build();
    }

    private PrProjectResponse.PhaseNoteInfo mapNote(PrPhaseNote note) {
        return PrProjectResponse.PhaseNoteInfo.builder()
                .id(note.getId())
                .authorId(note.getAuthor().getId())
                .authorName(displayName(note.getAuthor()))
                .content(note.getContent())
                .createdAt(note.getCreatedAt())
                .build();
    }

    private PrProjectResponse.MemberInfo mapMember(PrProjectMember member) {
        return PrProjectResponse.MemberInfo.builder()
                .userId(member.getUser().getId())
                .fullName(displayName(member.getUser()))
                .build();
    }

    private String displayName(UserProfile user) {
        if (user == null) {
            return null;
        }
        return user.getPerson() != null ? user.getPerson().getFullName() : user.getEmail();
    }
}
