package com.fogistanbul.crm.googleads.infrastructure;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.web.client.HttpClientErrorException;

import java.nio.charset.StandardCharsets;

import static org.assertj.core.api.Assertions.assertThat;

class GoogleAdsProviderErrorParserTest {

    private final GoogleAdsProviderErrorParser parser =
            new GoogleAdsProviderErrorParser(new ObjectMapper());

    @Test
    void extractsSafeGoogleErrorCodeAndRequestIdFromForbiddenResponse() {
        HttpClientErrorException exception = HttpClientErrorException.create(
                HttpStatus.FORBIDDEN,
                "Forbidden",
                HttpHeaders.EMPTY,
                """
                        {
                          "error": {
                            "code": 403,
                            "details": [{
                              "errors": [{
                                "errorCode": {
                                  "authorizationError": "CUSTOMER_NOT_ENABLED"
                                },
                                "message": "private provider detail"
                              }],
                              "requestId": "safe-request-id"
                            }]
                          },
                          "accessToken": "must-not-be-exposed"
                        }
                        """.getBytes(StandardCharsets.UTF_8),
                StandardCharsets.UTF_8);

        GoogleAdsProviderErrorParser.ProviderError result = parser.parse(exception);

        assertThat(result.httpStatus()).isEqualTo(403);
        assertThat(result.providerCode()).isEqualTo("CUSTOMER_NOT_ENABLED");
        assertThat(result.requestId()).isEqualTo("safe-request-id");
        assertThat(result.toString()).doesNotContain("private provider detail", "must-not-be-exposed");
    }

    @Test
    void usesSafeFallbacksForMalformedProviderResponse() {
        HttpClientErrorException exception = HttpClientErrorException.create(
                HttpStatus.FORBIDDEN,
                "Forbidden",
                HttpHeaders.EMPTY,
                "not-json".getBytes(StandardCharsets.UTF_8),
                StandardCharsets.UTF_8);

        GoogleAdsProviderErrorParser.ProviderError result = parser.parse(exception);

        assertThat(result.httpStatus()).isEqualTo(403);
        assertThat(result.providerCode()).isEqualTo("UNKNOWN");
        assertThat(result.requestId()).isEqualTo("unknown");
    }
}
