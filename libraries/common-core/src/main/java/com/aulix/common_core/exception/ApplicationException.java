package com.aulix.common_core.exception;


import org.springframework.http.HttpStatus;

/**
 * Base type for all domain/application exceptions. Carries an {@link ErrorCode} and the
 * {@link HttpStatus} the {@code GlobalExceptionHandler} should translate it to, so subclasses
 * never need to know about HTTP themselves.
 */
public abstract class ApplicationException extends RuntimeException {

    private final ErrorCode errorCode;
    private final HttpStatus httpStatus;

    protected ApplicationException(ErrorCode errorCode, HttpStatus httpStatus, String message) {
        super(message);
        this.errorCode = errorCode;
        this.httpStatus = httpStatus;
    }

    protected ApplicationException(ErrorCode errorCode, HttpStatus httpStatus, String message, Throwable cause) {
        super(message, cause);
        this.errorCode = errorCode;
        this.httpStatus = httpStatus;
    }

    public ErrorCode getErrorCode() {
        return errorCode;
    }

    public HttpStatus getHttpStatus() {
        return httpStatus;
    }
}
