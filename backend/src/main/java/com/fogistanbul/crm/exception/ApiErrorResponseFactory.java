package com.fogistanbul.crm.exception;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Component
public class ApiErrorResponseFactory {

    public ApiErrorResponse create(
            String code,
            String message,
            Map<String, String> fieldErrors,
            HttpServletRequest request
    ) {
        return new ApiErrorResponse(
                code,
                message,
                fieldErrors,
                Instant.now(),
                request.getRequestURI(),
                requestId(request)
        );
    }

    public ApiErrorResponse create(ApiErrorCode errorCode, HttpServletRequest request) {
        return create(
                errorCode.name(),
                errorCode.getDefaultMessage(),
                Map.of(),
                request
        );
    }

    public ApiErrorResponse create(
            ApiErrorCode errorCode,
            String message,
            Map<String, String> fieldErrors,
            HttpServletRequest request
    ) {
        return create(errorCode.name(), message, fieldErrors, request);
    }

    private String requestId(HttpServletRequest request) {
        Object requestId = request.getAttribute(RequestCorrelationFilter.REQUEST_ID_ATTRIBUTE);
        return requestId instanceof String value && !value.isBlank()
                ? value
                : UUID.randomUUID().toString();
    }
}
