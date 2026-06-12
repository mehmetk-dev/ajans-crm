package com.fogistanbul.crm.searchconsole.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ScSaveSiteUrlResponse(String status, String error) {

    public static ScSaveSiteUrlResponse ok() {
        return new ScSaveSiteUrlResponse("ok", null);
    }

    public static ScSaveSiteUrlResponse error(String message) {
        return new ScSaveSiteUrlResponse(null, message);
    }
}
