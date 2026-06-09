package com.fogistanbul.crm.task.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateTaskNoteRequest {
    @NotBlank(message = "Not içeriği boş olamaz")
    @Size(max = 5000)
    private String content;
}
