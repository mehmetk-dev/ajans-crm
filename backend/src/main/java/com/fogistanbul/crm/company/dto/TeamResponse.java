package com.fogistanbul.crm.company.dto;

import java.util.List;

public record TeamResponse(
        List<TeamMemberResponse> agencyStaff,
        List<TeamMemberResponse> employees
) {
    public record TeamMemberResponse(
            String id,
            String fullName,
            String email,
            String avatarUrl,
            String phone,
            String position,
            String department,
            String membershipRole,
            String companyName
    ) {
    }
}
