package com.aulix.common_core.exception;

import org.springframework.http.HttpStatus;

/**
 * Raised when a request is well-formed but violates a domain invariant
 * (e.g. enrolling a student in a full section).
 */
public class BusinessRuleViolationException extends ApplicationException {

    public BusinessRuleViolationException(String message) {
        super(ErrorCode.BUSINESS_RULE_VIOLATION, HttpStatus.UNPROCESSABLE_ENTITY, message);
    }
}
