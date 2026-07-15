package com.fogistanbul.crm.googleads.dto;

public record GoogleAdsAccountOption(
        String customerId,
        String descriptiveName,
        String loginCustomerId,
        String accessType,
        String managerName,
        String status
) {
}
