package com.fogistanbul.crm.task.dto;

import com.fogistanbul.crm.entity.enums.Priority;
import com.fogistanbul.crm.entity.enums.TaskCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.Instant;
import java.time.LocalTime;
import java.util.UUID;

@Data
public class CreateTaskRequest {
    private UUID companyId;

    @NotNull(message = "Atanan kişi zorunludur")
    private UUID assignedToId;

    @NotBlank(message = "Görev başlığı zorunludur")
    @Size(max = 200)
    private String title;

    @Size(max = 5000)
    private String description;

    private TaskCategory category;

    private Priority priority;

    private Instant startDate;

    private LocalTime startTime;

    private Instant endDate;

    private LocalTime endTime;
}
