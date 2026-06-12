package com.fogistanbul.crm.googleads.dto;

public record GoogleAdsStatusResponse(
        boolean connected,
        boolean hasAdsScope,
        String customerId,
        String authUrl) {
}
