package com.aulix.auth_service.exception;

import com.aulix.common_core.exception.ApplicationException;
import com.aulix.common_core.exception.ErrorCode;
import org.springframework.http.HttpStatus;

public class UserNotFoundException extends ApplicationException {

    public UserNotFoundException() {
        super(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND, "User(s) not found");
    }
}
