package com.fogistanbul.crm.instagram.dto;

public record InstagramStatusResponse(
        boolean configured,
        boolean connected,
        String authUrl,
        String username,
        String igUserId) {}
