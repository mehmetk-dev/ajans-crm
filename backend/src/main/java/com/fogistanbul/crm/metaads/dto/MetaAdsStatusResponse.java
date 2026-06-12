package com.fogistanbul.crm.metaads.dto;

public record MetaAdsStatusResponse(
        boolean connected,
        String adAccountId,
        String authUrl) {}
