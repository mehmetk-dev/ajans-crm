package com.fogistanbul.crm.googleads.infrastructure;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientResponseException;

import java.util.Iterator;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class GoogleAdsProviderErrorParser {

    private static final String UNKNOWN_CODE = "UNKNOWN";
    private static final String UNKNOWN_REQUEST_ID = "unknown";

    private final ObjectMapper objectMapper;

    public ProviderError parse(Exception exception) {
        if (!(exception instanceof RestClientResponseException responseException)) {
            return new ProviderError(0, UNKNOWN_CODE, UNKNOWN_REQUEST_ID);
        }

        int httpStatus = responseException.getStatusCode().value();
        try {
            JsonNode root = objectMapper.readTree(responseException.getResponseBodyAsByteArray());
            JsonNode details = root.path("error").path("details");
            String providerCode = findProviderCode(details);
            String requestId = findRequestId(details);
            return new ProviderError(
                    httpStatus,
                    safeProviderCode(providerCode),
                    safeRequestId(requestId));
        } catch (Exception ignored) {
            return new ProviderError(httpStatus, UNKNOWN_CODE, UNKNOWN_REQUEST_ID);
        }
    }

    private String findProviderCode(JsonNode details) {
        if (!details.isArray()) {
            return null;
        }
        for (JsonNode detail : details) {
            JsonNode errors = detail.path("errors");
            if (!errors.isArray()) {
                continue;
            }
            for (JsonNode error : errors) {
                JsonNode errorCode = error.path("errorCode");
                Iterator<Map.Entry<String, JsonNode>> fields = errorCode.fields();
                while (fields.hasNext()) {
                    JsonNode value = fields.next().getValue();
                    if (value.isTextual() && !value.asText().isBlank()) {
                        return value.asText();
                    }
                }
            }
        }
        return null;
    }

    private String findRequestId(JsonNode details) {
        if (!details.isArray()) {
            return null;
        }
        for (JsonNode detail : details) {
            String requestId = detail.path("requestId").asText("");
            if (!requestId.isBlank()) {
                return requestId;
            }
        }
        return null;
    }

    private String safeProviderCode(String value) {
        return value != null && value.matches("[A-Z0-9_]{1,100}")
                ? value
                : UNKNOWN_CODE;
    }

    private String safeRequestId(String value) {
        return value != null && value.matches("[A-Za-z0-9_-]{1,128}")
                ? value
                : UNKNOWN_REQUEST_ID;
    }

    public record ProviderError(
            int httpStatus,
            String providerCode,
            String requestId
    ) {
    }
}
