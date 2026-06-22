package com.fogistanbul.crm.prproject.application;

import com.fogistanbul.crm.entity.Person;
import com.fogistanbul.crm.entity.PrPhaseNote;
import com.fogistanbul.crm.entity.PrProject;
import com.fogistanbul.crm.entity.PrProjectMember;
import com.fogistanbul.crm.entity.PrProjectPhase;
import com.fogistanbul.crm.entity.UserProfile;
import com.fogistanbul.crm.entity.enums.PrProjectStatus;
import com.fogistanbul.crm.repository.PrPhaseNoteRepository;
import com.fogistanbul.crm.repository.PrProjectMemberRepository;
import com.fogistanbul.crm.repository.PrProjectPhaseRepository;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class PrProjectMapperTest {

    private final PrProjectPhaseRepository phaseRepository = mock(PrProjectPhaseRepository.class);
    private final PrProjectMemberRepository memberRepository = mock(PrProjectMemberRepository.class);
    private final PrPhaseNoteRepository noteRepository = mock(PrPhaseNoteRepository.class);
    private final PrProjectMapper mapper = new PrProjectMapper(phaseRepository, memberRepository, noteRepository);

    @Test
    void mapsResponsiblePhaseMemberAndNoteAvatarUrls() {
        UUID projectId = UUID.randomUUID();
        UserProfile creator = user("creator@test.com", "Proje Sahibi", "/avatar/creator.png");
        UserProfile responsible = user("responsible@test.com", "PR Sorumlu", "/avatar/responsible.png");
        UserProfile assignee = user("assignee@test.com", "Faz Sorumlu", "/avatar/assignee.png");
        UserProfile member = user("member@test.com", "Ekip Uyesi", "/avatar/member.png");
        PrProject project = PrProject.builder()
                .id(projectId)
                .name("Lansman")
                .totalPhases(1)
                .currentPhase(1)
                .progressPercent(BigDecimal.ZERO)
                .status(PrProjectStatus.ACTIVE)
                .createdBy(creator)
                .responsible(responsible)
                .createdAt(Instant.parse("2026-06-01T10:00:00Z"))
                .build();
        PrProjectPhase phase = PrProjectPhase.builder()
                .id(UUID.randomUUID())
                .project(project)
                .phaseNumber(1)
                .name("Hazirlik")
                .assignedTo(assignee)
                .isCompleted(false)
                .status("PENDING")
                .build();
        PrPhaseNote note = PrPhaseNote.builder()
                .id(UUID.randomUUID())
                .phase(phase)
                .author(member)
                .content("Faz notu")
                .createdAt(Instant.parse("2026-06-01T11:00:00Z"))
                .build();

        when(phaseRepository.findByProjectIdOrderByPhaseNumber(projectId)).thenReturn(List.of(phase));
        when(memberRepository.findByProjectId(projectId)).thenReturn(List.of(
                PrProjectMember.builder().project(project).user(member).build()
        ));
        when(noteRepository.findByPhaseProjectIdOrderByCreatedAtDesc(projectId)).thenReturn(List.of(note));

        var response = mapper.toResponse(project);

        assertThat(response.getCreatedByAvatarUrl()).isEqualTo("/avatar/creator.png");
        assertThat(response.getResponsibleAvatarUrl()).isEqualTo("/avatar/responsible.png");
        assertThat(response.getPhases().get(0).getAssignedToAvatarUrl()).isEqualTo("/avatar/assignee.png");
        assertThat(response.getPhases().get(0).getPhaseNotes().get(0).getAuthorAvatarUrl()).isEqualTo("/avatar/member.png");
        assertThat(response.getMembers().get(0).getAvatarUrl()).isEqualTo("/avatar/member.png");
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
