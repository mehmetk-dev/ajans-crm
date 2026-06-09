package com.fogistanbul.crm.task.application;

import com.fogistanbul.crm.entity.PrProject;
import com.fogistanbul.crm.entity.PrProjectPhase;
import com.fogistanbul.crm.entity.Task;
import com.fogistanbul.crm.entity.enums.PrProjectStatus;
import com.fogistanbul.crm.repository.PrProjectPhaseRepository;
import com.fogistanbul.crm.repository.PrProjectRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class TaskPhaseCompletionService {

    private final PrProjectPhaseRepository phaseRepository;
    private final PrProjectRepository projectRepository;

    public void completeLinkedPhase(Task task) {
        phaseRepository.findByTaskId(task.getId()).ifPresent(phase -> complete(task, phase));
    }

    private void complete(Task task, PrProjectPhase phase) {
        if (Boolean.TRUE.equals(phase.getIsCompleted())) return;

        phase.setIsCompleted(true);
        phase.setCompletedAt(Instant.now());
        phase.setStatus("COMPLETED");
        phaseRepository.save(phase);

        PrProject project = phase.getProject();
        List<PrProjectPhase> phases = phaseRepository.findByProjectIdOrderByPhaseNumber(project.getId());
        long completedCount = phases.stream().filter(PrProjectPhase::getIsCompleted).count();
        BigDecimal progress = BigDecimal.valueOf(completedCount)
                .multiply(BigDecimal.valueOf(100))
                .divide(BigDecimal.valueOf(phases.size()), 2, RoundingMode.HALF_UP);

        project.setProgressPercent(progress);
        project.setCurrentPhase(phases.stream()
                .filter(item -> !item.getIsCompleted())
                .mapToInt(PrProjectPhase::getPhaseNumber)
                .min()
                .orElse(project.getTotalPhases()));
        if (completedCount == phases.size()) {
            project.setStatus(PrProjectStatus.COMPLETED);
        }
        projectRepository.save(project);
        log.info("Phase '{}' completed via task '{}', project progress: {}%",
                phase.getName(), task.getTitle(), progress);
    }
}
