package com.fogistanbul.crm.exception;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertEquals;

class GlobalExceptionHandlerTest {

    private GlobalExceptionHandler handler;
    private MockHttpServletRequest request;

    @BeforeEach
    void setUp() {
        handler = new GlobalExceptionHandler(new ApiErrorResponseFactory());
        request = new MockHttpServletRequest("POST", "/api/test");
        request.setAttribute(RequestCorrelationFilter.REQUEST_ID_ATTRIBUTE, "request-123");
    }

    @Test
    void apiExceptionsKeepTheirStatusAndStableCode() {
        var response = handler.handleApiException(
                new ApiException(HttpStatus.CONFLICT, "DUPLICATE_RESOURCE", "Kayıt zaten mevcut"),
                request
        );

        assertEquals(HttpStatus.CONFLICT, response.getStatusCode());
        assertEquals("DUPLICATE_RESOURCE", response.getBody().code());
        assertEquals("Kayıt zaten mevcut", response.getBody().message());
        assertEquals("/api/test", response.getBody().path());
        assertEquals("request-123", response.getBody().requestId());
        assertNotNull(response.getBody().timestamp());
    }

    @Test
    void unexpectedRuntimeErrorsDoNotExposeInternalDetails() {
        var response = handler.handleRuntimeExceptions(
                new RuntimeException("jdbc:postgresql://db.internal/private"),
                request
        );

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertEquals("INTERNAL_ERROR", response.getBody().code());
        assertEquals("Bir hata oluştu. Lütfen tekrar deneyin.", response.getBody().message());
    }

    @Test
    void missingRequestParametersUseTheStandardValidationEnvelope() {
        var response = handler.handleMissingParameter(
                new MissingServletRequestParameterException("companyId", "UUID"),
                request
        );

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("MISSING_PARAMETER", response.getBody().code());
        assertEquals("companyId", response.getBody().fieldErrors().get("companyId"));
    }

    @Test
    void oversizedUploadsReturnPayloadTooLarge() {
        var response = handler.handleMaxUploadSize(
                new MaxUploadSizeExceededException(50L * 1024 * 1024),
                request
        );

        assertEquals(HttpStatus.PAYLOAD_TOO_LARGE, response.getStatusCode());
        assertEquals("PAYLOAD_TOO_LARGE", response.getBody().code());
    }

    @Test
    void databaseConstraintErrorsDoNotExposeSqlDetails() {
        var response = handler.handleDataIntegrityViolation(
                new DataIntegrityViolationException("duplicate key value violates unique constraint users_email_key"),
                request
        );

        assertEquals(HttpStatus.CONFLICT, response.getStatusCode());
        assertEquals("DATA_INTEGRITY_VIOLATION", response.getBody().code());
        assertEquals("İşlem veri bütünlüğü kuralıyla çakıştı", response.getBody().message());
    }

    @Test
    void illegalArgumentsAreHandledAsBadRequests() {
        var response = handler.handleIllegalArgument(
                new IllegalArgumentException("Geçersiz tarih"),
                request
        );

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("INVALID_ARGUMENT", response.getBody().code());
        assertEquals("Geçersiz tarih", response.getBody().message());
    }

    @Test
    void illegalStateDetailsAreHiddenBehindAConflictResponse() {
        var response = handler.handleIllegalState(
                new IllegalStateException("provider token: secret-value"),
                request
        );

        assertEquals(HttpStatus.CONFLICT, response.getStatusCode());
        assertEquals("INVALID_STATE", response.getBody().code());
        assertEquals("İşlem mevcut durumda gerçekleştirilemiyor", response.getBody().message());
    }
}
