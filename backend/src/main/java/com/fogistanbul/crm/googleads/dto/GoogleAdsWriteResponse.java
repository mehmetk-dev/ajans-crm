package com.fogistanbul.crm.googleads.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record GoogleAdsWriteResponse(String status, String error) {

    public static GoogleAdsWriteResponse ok() {
        return new GoogleAdsWriteResponse("ok", null);
    }

    public static GoogleAdsWriteResponse error(String message) {
        return new GoogleAdsWriteResponse(null, message);
    }
}
