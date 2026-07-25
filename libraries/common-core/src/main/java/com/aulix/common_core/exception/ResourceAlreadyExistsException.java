package com.aulix.common_core.exception;

import org.springframework.http.HttpStatus;

public class ResourceAlreadyExistsException extends ApplicationException {

    public ResourceAlreadyExistsException(String message) {
        super(ErrorCode.RESOURCE_ALREADY_EXISTS, HttpStatus.CONFLICT, message);
    }
}
