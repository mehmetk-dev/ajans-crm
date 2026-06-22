package com.fogistanbul.crm.prproject.application;

import com.fogistanbul.crm.entity.PrPhaseNote;
import com.fogistanbul.crm.entity.PrProject;
import com.fogistanbul.crm.entity.PrProjectPhase;
import com.fogistanbul.crm.entity.Task;
import com.fogistanbul.crm.entity.UserProfile;
import com.fogistanbul.crm.entity.enums.TaskCategory;
import com.fogistanbul.crm.prproject.dto.CreatePrProjectRequest;
import com.fogistanbul.crm.prproject.dto.UpdatePrProjectRequest;
import com.fogistanbul.crm.repository.PrPhaseNoteRepository;
import com.fogistanbul.crm.repository.PrProjectPhaseRepository;
import com.fogistanbul.crm.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PrProjectPhaseService {

    private final PrProjectPhaseRepository phaseRepository;
    private final PrPhaseNoteRepository phaseNoteRepository;
    private final TaskRepository taskRepository;
    private final PrProjectParticipantService participantService;
    private final PrProjectProgressService progressService;

    public void createPhases(
            PrProject project,
            List<CreatePrProjectRequest.PhaseRequest> requests,
            UserProfile creator
    ) {
        if (requests == null) {
            return;
        }
        for (int index = 0; index < requests.size(); index++) {
            CreatePrProjectRequest.PhaseRequest request = requests.get(index);
            createPhase(
                    project,
                    index + 1,
                    request.getName(),
                    request.getAssignedToId(),
                    request.getStartDate(),
                    request.getEndDate(),
                    request.getNotes(),
                    creator
            );
        }
    }

    public void updatePhases(
            PrProject project,
            List<UpdatePrProjectRequest.PhaseUpdateRequest> requests
    ) {
        if (requests == null) {
            return;
        }
        for (UpdatePrProjectRequest.PhaseUpdateRequest request : requests) {
            if (request.getId() == null) {
                int nextNumber = phaseRepository.findByProjectIdOrderByPhaseNumber(project.getId())
                        .stream()
                        .mapToInt(PrProjectPhase::getPhaseNumber)
                        .max()
                        .orElse(0) + 1;
                createPhase(
                        project,
                        nextNumber,
                        request.getName() != null ? request.getName() : "Faz " + nextNumber,
                        request.getAssignedToId(),
                        request.getStartDate(),
                        request.getEndDate(),
                        request.getNotes(),
                        project.getCreatedBy()
                );
                project.setTotalPhases(nextNumber);
                continue;
            }

            PrProjectPhase phase = getProjectPhase(project.getId(), request.getId());
            Task task = phase.getTask();
            if (request.getName() != null) {
                phase.setName(request.getName());
                if (task != null) {
                    task.setTitle("[" + project.getName() + "] " + request.getName());
                    task.setDescription("Proje fazi: " + request.getName());
                }
            }
            if (request.getNotes() != null) {
                phase.setNotes(request.getNotes());
            }
            if (request.getStartDate() != null) {
                phase.setStartDate(PrProjectDates.parse(request.getStartDate()));
                if (task != null) {
                    task.setStartDate(phase.getStartDate());
                }
            }
            if (request.getEndDate() != null) {
                phase.setEndDate(PrProjectDates.parse(request.getEndDate()));
                if (task != null) {
                    task.setEndDate(phase.getEndDate());
                }
            }
            if (request.getAssignedToId() != null) {
                UUID companyId = project.getCompany() != null ? project.getCompany().getId() : null;
                phase.setAssignedTo(participantService.getOptionalUser(
                        request.getAssignedToId(), companyId));
                if (task != null) {
                    task.setAssignedTo(phase.getAssignedTo());
                }
            }
            phaseRepository.save(phase);
            if (task != null) {
                taskRepository.save(task);
            }
        }
    }

    public void updateLinkedTaskCompanies(PrProject project) {
        for (PrProjectPhase phase :
                phaseRepository.findByProjectIdOrderByPhaseNumber(project.getId())) {
            if (phase.getTask() != null) {
                phase.getTask().setCompany(project.getCompany());
                taskRepository.save(phase.getTask());
            }
        }
    }

    public void updateLinkedTaskProjectName(PrProject project) {
        for (PrProjectPhase phase :
                phaseRepository.findByProjectIdOrderByPhaseNumber(project.getId())) {
            if (phase.getTask() != null) {
                phase.getTask().setTitle("[" + project.getName() + "] " + phase.getName());
                taskRepository.save(phase.getTask());
            }
        }
    }

    public void updateResponsibleFallbackTasks(PrProject project) {
        for (PrProjectPhase phase :
                phaseRepository.findByProjectIdOrderByPhaseNumber(project.getId())) {
            if (phase.getAssignedTo() == null && phase.getTask() != null) {
                phase.getTask().setAssignedTo(project.getResponsible() != null
                        ? project.getResponsible()
                        : project.getCreatedBy());
                taskRepository.save(phase.getTask());
            }
        }
    }

    public void completePhase(PrProject project, UUID phaseId) {
        progressService.completeFromProject(getProjectPhase(project.getId(), phaseId));
    }

    public void addNote(PrProject project, UUID phaseId, String content, UserProfile author) {
        PrProjectPhase phase = getProjectPhase(project.getId(), phaseId);
        phaseNoteRepository.save(PrPhaseNote.builder()
                .phase(phase)
                .author(author)
                .content(content.trim())
                .build());
    }

    private void createPhase(
            PrProject project,
            int phaseNumber,
            String name,
            UUID assignedToId,
            String startDate,
            String endDate,
            String notes,
            UserProfile creator
    ) {
        UUID companyId = project.getCompany() != null ? project.getCompany().getId() : null;
        UserProfile assignedTo = participantService.getOptionalUser(assignedToId, companyId);
        UserProfile taskAssignee = assignedTo != null
                ? assignedTo
                : project.getResponsible() != null ? project.getResponsible() : creator;

        Task task = taskRepository.save(Task.builder()
                .company(project.getCompany())
                .createdBy(creator)
                .assignedTo(taskAssignee)
                .title("[" + project.getName() + "] " + name)
                .description("Proje fazi: " + name)
                .category(TaskCategory.OTHER)
                .startDate(PrProjectDates.parse(startDate))
                .endDate(PrProjectDates.parse(endDate))
                .build());

        phaseRepository.save(PrProjectPhase.builder()
                .project(project)
                .phaseNumber(phaseNumber)
                .name(name)
                .assignedTo(assignedTo)
                .startDate(PrProjectDates.parse(startDate))
                .endDate(PrProjectDates.parse(endDate))
                .notes(notes)
                .task(task)
                .build());
    }

    private PrProjectPhase getProjectPhase(UUID projectId, UUID phaseId) {
        PrProjectPhase phase = phaseRepository.findById(phaseId)
                .orElseThrow(() -> new RuntimeException("Faz bulunamadı"));
        if (!phase.getProject().getId().equals(projectId)) {
            throw new IllegalArgumentException("Faz bu projeye ait değil");
        }
        return phase;
    }
}
