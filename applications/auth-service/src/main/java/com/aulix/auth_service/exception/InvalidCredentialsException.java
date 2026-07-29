package com.aulix.auth_service.exception;

import org.springframework.http.HttpStatus;
import com.aulix.common_core.exception.ApplicationException;
import com.aulix.common_core.exception.ErrorCode;

public class InvalidCredentialsException extends ApplicationException {

    public InvalidCredentialsException() {
        super(ErrorCode.UNAUTHORIZED, HttpStatus.UNAUTHORIZED, "Invalid email or password");
    }
}
