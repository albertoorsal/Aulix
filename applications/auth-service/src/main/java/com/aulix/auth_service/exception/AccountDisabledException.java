package com.aulix.auth_service.exception;

import com.aulix.common_core.exception.ApplicationException;
import com.aulix.common_core.exception.ErrorCode;
import org.springframework.http.HttpStatus;

public class AccountDisabledException extends ApplicationException {

    public AccountDisabledException() {
        super(ErrorCode.FORBIDDEN, HttpStatus.FORBIDDEN, "This account has been disabled or locked");
    }
}

