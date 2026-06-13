package com.fogistanbul.crm.exception;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.util.Map;

@JsonInclude(JsonInclude.Include.NON_EMPTY)
public record ApiErrorResponse(
        String code,
        String message,
        Map<String, String> fieldErrors
) {
    public ApiErrorResponse(String code, String message) {
        this(code, message, Map.of());
    }
}
