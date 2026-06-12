package com.fogistanbul.crm.instagram.dto;

public record InstagramWriteResponse(String status) {
    public static InstagramWriteResponse ok() {
        return new InstagramWriteResponse("ok");
    }
}
