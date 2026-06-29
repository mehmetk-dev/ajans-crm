package com.fogistanbul.crm.company.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
public class StaffResponse {
    private String id;
    private String fullName;
    private String email;
    private String phone;
    private String position;
    private String department;
    private String address;
    private LocalDate birthDate;
    private String notes;
    private String avatarUrl;
    private String globalRole;
    private Instant createdAt;

    private List<AssignedCompany> assignedCompanies;

    @Data
    @Builder
    public static class AssignedCompany {
        private String membershipId;
        private String companyId;
        private String companyName;
        private String membershipRole;
    }
}
