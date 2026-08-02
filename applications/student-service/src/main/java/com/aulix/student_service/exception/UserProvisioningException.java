package com.aulix.student_service.exception;

import com.aulix.common_core.exception.ApplicationException;
import com.aulix.common_core.exception.ErrorCode;
import org.springframework.http.HttpStatus;

public class UserProvisioningException extends ApplicationException {

    public UserProvisioningException(String message) {
        super(ErrorCode.INTERNAL_ERROR, HttpStatus.BAD_GATEWAY, message);
    }

    public UserProvisioningException(String message, Throwable cause) {
        super(ErrorCode.INTERNAL_ERROR, HttpStatus.BAD_GATEWAY, message, cause);
    }
}
