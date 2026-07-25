package com.aulix.common_core.exception;


import com.aulix.common_core.response.ApiError;
import com.aulix.common_core.response.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Centralized translation of exceptions into the {@link ApiResponse} envelope so every
 * service in the platform returns a consistent error shape. Extend per-service only when a
 * service has an exception type common-core cannot know about.
 */
@RestController
public class GlobalExceptionHandler {
    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(ApplicationException.class)
    public ResponseEntity<ApiResponse<Void>> handleApplicationException(
            ApplicationException ex, HttpServletRequest request) {
        log.warn("Application exception [{}] at {}: {}", ex.getErrorCode(), request.getRequestURI(), ex.getMessage());
        ApiError error = new ApiError(ex.getErrorCode().name(), ex.getMessage(), request.getRequestURI(), null);
        return ResponseEntity.status(ex.getHttpStatus()).body(ApiResponse.error(error));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleValidation(
            MethodArgumentNotValidException ex, HttpServletRequest request) {
        List<ApiError.FieldViolation> violations = ex.getBindingResult().getFieldErrors().stream()
                .map(fe -> new ApiError.FieldViolation(fe.getField(), message(fe)))
                .toList();
        ApiError error = new ApiError(ErrorCode.VALIDATION_FAILED.name(), "Validation failed",
                request.getRequestURI(), violations);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.error(error));
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<Void>> handleAccessDenied(
            AccessDeniedException ex, HttpServletRequest request) {
        ApiError error = new ApiError(ErrorCode.FORBIDDEN.name(), "You do not have permission to perform this action",
                request.getRequestURI(), null);
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.error(error));
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiResponse<Void>> handleDataIntegrityViolation(
            DataIntegrityViolationException ex, HttpServletRequest request) {
        log.warn("Data integrity violation at {}: {}", request.getRequestURI(), ex.getMessage());
        ApiError error = new ApiError(ErrorCode.CONFLICT.name(), "The request conflicts with existing data",
                request.getRequestURI(), null);
        return ResponseEntity.status(HttpStatus.CONFLICT).body(ApiResponse.error(error));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleUnexpected(Exception ex, HttpServletRequest request) {
        log.error("Unhandled exception at {}", request.getRequestURI(), ex);
        ApiError error = new ApiError(ErrorCode.INTERNAL_ERROR.name(), "An unexpected error occurred",
                request.getRequestURI(), null);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse.error(error));
    }

    private static String message(FieldError fe) {
        return fe.getDefaultMessage() != null ? fe.getDefaultMessage() : "invalid value";
    }
}

