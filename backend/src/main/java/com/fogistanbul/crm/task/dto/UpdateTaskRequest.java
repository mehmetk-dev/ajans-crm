package com.fogistanbul.crm.task.dto;

import com.fogistanbul.crm.entity.enums.Priority;
import com.fogistanbul.crm.entity.enums.TaskCategory;
import com.fogistanbul.crm.entity.enums.TaskStatus;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.Instant;
import java.time.LocalTime;
import java.util.UUID;

@Data
public class UpdateTaskRequest {
    @Size(max = 200)
    private String title;

    @Size(max = 5000)
    private String description;

    private TaskStatus status;
    private TaskCategory category;
    private Priority priority;
    private UUID assignedToId;
    private UUID companyId;
    private Instant startDate;
    private LocalTime startTime;
    private Instant endDate;
    private LocalTime endTime;
}
