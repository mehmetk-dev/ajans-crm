package com.fogistanbul.crm.exception;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.catalina.connector.ClientAbortException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.BindException;
import org.springframework.web.context.request.async.AsyncRequestNotUsableException;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.multipart.MultipartException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@RestControllerAdvice
@Slf4j
@RequiredArgsConstructor
public class GlobalExceptionHandler {

    private final ApiErrorResponseFactory responseFactory;

    @ExceptionHandler({ClientAbortException.class, AsyncRequestNotUsableException.class})
    public void handleClientAbort(Exception ex) {
        log.debug("Client connection closed before response completed: {}", ex.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErrorResponse> handleValidationExceptions(
            MethodArgumentNotValidException ex,
            HttpServletRequest request
    ) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors()
                .forEach(error -> errors.put(error.getField(), error.getDefaultMessage()));
        log.debug("Validation error: {}", errors);
        return response(ApiErrorCode.VALIDATION_ERROR, errors, request);
    }

    @ExceptionHandler(BindException.class)
    public ResponseEntity<ApiErrorResponse> handleBindingExceptions(
            BindException ex,
            HttpServletRequest request
    ) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors()
                .forEach(error -> errors.put(error.getField(), error.getDefaultMessage()));
        return response(ApiErrorCode.VALIDATION_ERROR, errors, request);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiErrorResponse> handleConstraintViolation(
            ConstraintViolationException ex,
            HttpServletRequest request
    ) {
        Map<String, String> errors = ex.getConstraintViolations().stream()
                .collect(Collectors.toMap(
                        violation -> violation.getPropertyPath().toString(),
                        violation -> violation.getMessage(),
                        (first, second) -> first
                ));
        return response(ApiErrorCode.VALIDATION_ERROR, errors, request);
    }

    @ExceptionHandler(ApiException.class)
    public ResponseEntity<ApiErrorResponse> handleApiException(
            ApiException ex,
            HttpServletRequest request
    ) {
        return ResponseEntity.status(ex.getStatus())
                .body(responseFactory.create(ex.getCode(), ex.getMessage(), Map.of(), request));
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiErrorResponse> handleAccessDenied(
            AccessDeniedException ex,
            HttpServletRequest request
    ) {
        return response(ApiErrorCode.FORBIDDEN, request);
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ApiErrorResponse> handleAuthentication(
            AuthenticationException ex,
            HttpServletRequest request
    ) {
        return response(ApiErrorCode.UNAUTHORIZED, request);
    }

    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<ApiErrorResponse> handleMissingParameter(
            MissingServletRequestParameterException ex,
            HttpServletRequest request
    ) {
        return response(
                ApiErrorCode.MISSING_PARAMETER,
                Map.of(ex.getParameterName(), "Zorunlu parametre"),
                request
        );
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiErrorResponse> handleTypeMismatch(
            MethodArgumentTypeMismatchException ex,
            HttpServletRequest request
    ) {
        return response(
                ApiErrorCode.TYPE_MISMATCH,
                Map.of(ex.getName(), "Geçersiz değer"),
                request
        );
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiErrorResponse> handleUnreadableMessage(
            HttpMessageNotReadableException ex,
            HttpServletRequest request
    ) {
        return response(ApiErrorCode.MALFORMED_REQUEST, request);
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ApiErrorResponse> handleMethodNotSupported(
            HttpRequestMethodNotSupportedException ex,
            HttpServletRequest request
    ) {
        HttpHeaders headers = new HttpHeaders();
        if (ex.getSupportedHttpMethods() != null) {
            headers.setAllow(ex.getSupportedHttpMethods());
        }
        return new ResponseEntity<>(
                responseFactory.create(ApiErrorCode.METHOD_NOT_ALLOWED, request),
                headers,
                ApiErrorCode.METHOD_NOT_ALLOWED.getStatus()
        );
    }

    @ExceptionHandler(HttpMediaTypeNotSupportedException.class)
    public ResponseEntity<ApiErrorResponse> handleUnsupportedMediaType(
            HttpMediaTypeNotSupportedException ex,
            HttpServletRequest request
    ) {
        return response(ApiErrorCode.UNSUPPORTED_MEDIA_TYPE, request);
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ApiErrorResponse> handleMaxUploadSize(
            MaxUploadSizeExceededException ex,
            HttpServletRequest request
    ) {
        return response(ApiErrorCode.PAYLOAD_TOO_LARGE, request);
    }

    @ExceptionHandler(MultipartException.class)
    public ResponseEntity<ApiErrorResponse> handleMultipart(
            MultipartException ex,
            HttpServletRequest request
    ) {
        return response(ApiErrorCode.MULTIPART_ERROR, request);
    }

    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<ApiErrorResponse> handleNoResource(
            NoResourceFoundException ex,
            HttpServletRequest request
    ) {
        return response(ApiErrorCode.RESOURCE_NOT_FOUND, request);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiErrorResponse> handleDataIntegrityViolation(
            DataIntegrityViolationException ex,
            HttpServletRequest request
    ) {
        log.warn(
                "Data integrity violation requestId={} path={} cause={}",
                requestId(request),
                request.getRequestURI(),
                ex.getMostSpecificCause().getClass().getSimpleName()
        );
        return response(ApiErrorCode.DATA_INTEGRITY_VIOLATION, request);
    }

    @ExceptionHandler(OptimisticLockingFailureException.class)
    public ResponseEntity<ApiErrorResponse> handleOptimisticLock(
            OptimisticLockingFailureException ex,
            HttpServletRequest request
    ) {
        return response(ApiErrorCode.CONFLICT, request);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiErrorResponse> handleIllegalArgument(
            IllegalArgumentException ex,
            HttpServletRequest request
    ) {
        return response(
                ApiErrorCode.INVALID_ARGUMENT,
                safeClientMessage(ex.getMessage(), ApiErrorCode.INVALID_ARGUMENT.getDefaultMessage()),
                Map.of(),
                request
        );
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ApiErrorResponse> handleIllegalState(
            IllegalStateException ex,
            HttpServletRequest request
    ) {
        log.warn(
                "Invalid application state requestId={} path={} exception={}",
                requestId(request),
                request.getRequestURI(),
                ex.getClass().getSimpleName()
        );
        return response(ApiErrorCode.INVALID_STATE, request);
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ApiErrorResponse> handleRuntimeExceptions(
            RuntimeException ex,
            HttpServletRequest request
    ) {
        log.error(
                "Runtime error requestId={} path={}",
                requestId(request),
                request.getRequestURI(),
                ex
        );
        return response(ApiErrorCode.INTERNAL_ERROR, request);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorResponse> handleAllExceptions(
            Exception ex,
            HttpServletRequest request
    ) {
        log.error(
                "Unexpected error requestId={} path={}",
                requestId(request),
                request.getRequestURI(),
                ex
        );
        return response(ApiErrorCode.INTERNAL_ERROR, request);
    }

    private ResponseEntity<ApiErrorResponse> response(
            ApiErrorCode errorCode,
            HttpServletRequest request
    ) {
        return ResponseEntity.status(errorCode.getStatus())
                .body(responseFactory.create(errorCode, request));
    }

    private ResponseEntity<ApiErrorResponse> response(
            ApiErrorCode errorCode,
            Map<String, String> fieldErrors,
            HttpServletRequest request
    ) {
        return response(errorCode, errorCode.getDefaultMessage(), fieldErrors, request);
    }

    private ResponseEntity<ApiErrorResponse> response(
            ApiErrorCode errorCode,
            String message,
            Map<String, String> fieldErrors,
            HttpServletRequest request
    ) {
        return ResponseEntity.status(errorCode.getStatus())
                .body(responseFactory.create(errorCode, message, fieldErrors, request));
    }

    private String requestId(HttpServletRequest request) {
        Object requestId = request.getAttribute(RequestCorrelationFilter.REQUEST_ID_ATTRIBUTE);
        return requestId == null ? "unknown" : requestId.toString();
    }

    private String safeClientMessage(String message, String fallback) {
        return message == null || message.isBlank() || message.length() > 200
                ? fallback
                : message;
    }
}
