package com.fogistanbul.crm.exception;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

import static org.junit.jupiter.api.Assertions.assertEquals;

class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @Test
    void apiExceptionsKeepTheirStatusAndStableCode() {
        var response = handler.handleApiException(
                new ApiException(HttpStatus.CONFLICT, "DUPLICATE_RESOURCE", "Kayıt zaten mevcut")
        );

        assertEquals(HttpStatus.CONFLICT, response.getStatusCode());
        assertEquals("DUPLICATE_RESOURCE", response.getBody().code());
        assertEquals("Kayıt zaten mevcut", response.getBody().message());
    }

    @Test
    void unexpectedRuntimeErrorsDoNotExposeInternalDetails() {
        var response = handler.handleRuntimeExceptions(
                new RuntimeException("jdbc:postgresql://db.internal/private")
        );

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertEquals("INTERNAL_ERROR", response.getBody().code());
        assertEquals("Bir hata oluştu. Lütfen tekrar deneyin.", response.getBody().message());
    }
}
