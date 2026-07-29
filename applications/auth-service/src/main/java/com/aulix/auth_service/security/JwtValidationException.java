package com.aulix.auth_service.security;

import com.aulix.common_core.exception.ApplicationException;
import com.aulix.common_core.exception.ErrorCode;
import org.springframework.http.HttpStatus;

public class JwtValidationException extends ApplicationException {

    public JwtValidationException(String message) {
        super(ErrorCode.UNAUTHORIZED, HttpStatus.UNAUTHORIZED, message);
    }
}