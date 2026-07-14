package com.fogistanbul.crm.googleads.dto;

public record GoogleAdsStatusResponse(
        boolean connected,
        boolean hasAdsScope,
        boolean needsReconnect,
        String customerId,
        String authUrl) {
}
