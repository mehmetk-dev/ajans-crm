package com.fogistanbul.crm.searchconsole.dto;

public record ScStatusResponse(
        boolean connected,
        String siteUrl,
        boolean hasScScope,
        boolean needsReconnect,
        String authUrl) {
}
