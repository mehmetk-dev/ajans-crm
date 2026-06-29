package com.fogistanbul.crm.company.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDate;

@Data
public class UpdateStaffRequest {
    @NotBlank(message = "Ad soyad zorunludur")
    private String fullName;

    private String phone;
    private String position;
    private String department;
    private String address;
    private LocalDate birthDate;
    private String notes;
}
