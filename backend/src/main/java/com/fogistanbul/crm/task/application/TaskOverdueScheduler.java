package com.fogistanbul.crm.task.application;

import com.fogistanbul.crm.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Component
@RequiredArgsConstructor
@Slf4j
public class TaskOverdueScheduler {

    private final TaskRepository taskRepository;

    @Scheduled(fixedRate = 60000)
    @Transactional
    public void markOverdueTasks() {
        int count = taskRepository.markOverdueTasks(Instant.now());
        if (count > 0) {
            log.info("Marked {} tasks as OVERDUE", count);
        }
    }
}
