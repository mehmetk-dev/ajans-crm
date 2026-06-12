package com.fogistanbul.crm.metaads.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record MetaAdsWriteResponse(String status, String error) {
    public static MetaAdsWriteResponse ok() {
        return new MetaAdsWriteResponse("ok", null);
    }

    public static MetaAdsWriteResponse error(String message) {
        return new MetaAdsWriteResponse(null, message);
    }
}
