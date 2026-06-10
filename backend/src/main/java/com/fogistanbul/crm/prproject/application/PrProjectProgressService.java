package com.fogistanbul.crm.prproject.application;

import com.fogistanbul.crm.entity.PrProject;
import com.fogistanbul.crm.entity.PrProjectPhase;
import com.fogistanbul.crm.entity.Task;
import com.fogistanbul.crm.entity.enums.PrProjectStatus;
import com.fogistanbul.crm.entity.enums.TaskStatus;
import com.fogistanbul.crm.repository.PrProjectPhaseRepository;
import com.fogistanbul.crm.repository.PrProjectRepository;
import com.fogistanbul.crm.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PrProjectProgressService {

    private final PrProjectPhaseRepository phaseRepository;
    private final PrProjectRepository projectRepository;
    private final TaskRepository taskRepository;

    public void completeFromProject(PrProjectPhase phase) {
        markPhaseCompleted(phase);
        Task task = phase.getTask();
        if (task != null && task.getStatus() != TaskStatus.DONE) {
            task.setStatus(TaskStatus.DONE);
            task.setCompletedAt(Instant.now());
            taskRepository.save(task);
        }
        recalculate(phase.getProject());
    }

    public void completeFromTask(Task task) {
        phaseRepository.findByTaskId(task.getId()).ifPresent(phase -> {
            markPhaseCompleted(phase);
            recalculate(phase.getProject());
        });
    }

    private void markPhaseCompleted(PrProjectPhase phase) {
        if (!Boolean.TRUE.equals(phase.getIsCompleted())) {
            phase.setIsCompleted(true);
            phase.setCompletedAt(Instant.now());
            phase.setStatus("COMPLETED");
            phaseRepository.save(phase);
        }
    }

    private void recalculate(PrProject project) {
        List<PrProjectPhase> phases =
                phaseRepository.findByProjectIdOrderByPhaseNumber(project.getId());
        long completedCount = phases.stream()
                .filter(phase -> Boolean.TRUE.equals(phase.getIsCompleted()))
                .count();
        BigDecimal progress = phases.isEmpty()
                ? BigDecimal.ZERO
                : BigDecimal.valueOf(completedCount)
                        .multiply(BigDecimal.valueOf(100))
                        .divide(BigDecimal.valueOf(phases.size()), 2, RoundingMode.HALF_UP);

        project.setProgressPercent(progress);
        project.setCurrentPhase(phases.stream()
                .filter(phase -> !Boolean.TRUE.equals(phase.getIsCompleted()))
                .mapToInt(PrProjectPhase::getPhaseNumber)
                .min()
                .orElse(project.getTotalPhases()));
        if (!phases.isEmpty() && completedCount == phases.size()) {
            project.setStatus(PrProjectStatus.COMPLETED);
        }
        projectRepository.save(project);
    }
}
