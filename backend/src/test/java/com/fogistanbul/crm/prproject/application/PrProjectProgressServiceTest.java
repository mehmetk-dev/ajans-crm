package com.fogistanbul.crm.prproject.application;

import com.fogistanbul.crm.entity.PrProject;
import com.fogistanbul.crm.entity.PrProjectPhase;
import com.fogistanbul.crm.entity.Task;
import com.fogistanbul.crm.entity.enums.PrProjectStatus;
import com.fogistanbul.crm.entity.enums.TaskStatus;
import com.fogistanbul.crm.repository.PrProjectPhaseRepository;
import com.fogistanbul.crm.repository.PrProjectRepository;
import com.fogistanbul.crm.repository.TaskRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PrProjectProgressServiceTest {

    @Mock
    private PrProjectPhaseRepository phaseRepository;
    @Mock
    private PrProjectRepository projectRepository;
    @Mock
    private TaskRepository taskRepository;

    @InjectMocks
    private PrProjectProgressService progressService;

    @Test
    void completingPhaseAlsoCompletesLinkedTaskAndProject() {
        UUID projectId = UUID.randomUUID();
        Task task = Task.builder().id(UUID.randomUUID()).status(TaskStatus.TODO).build();
        PrProject project = PrProject.builder()
                .id(projectId)
                .totalPhases(1)
                .status(PrProjectStatus.ACTIVE)
                .build();
        PrProjectPhase phase = PrProjectPhase.builder()
                .id(UUID.randomUUID())
                .project(project)
                .phaseNumber(1)
                .isCompleted(false)
                .task(task)
                .build();
        when(phaseRepository.findByProjectIdOrderByPhaseNumber(projectId))
                .thenReturn(List.of(phase));

        progressService.completeFromProject(phase);

        assertEquals(TaskStatus.DONE, task.getStatus());
        assertEquals(PrProjectStatus.COMPLETED, project.getStatus());
        assertEquals(new BigDecimal("100.00"), project.getProgressPercent());
        verify(taskRepository).save(task);
        verify(projectRepository).save(project);
    }
}
