package com.aulix.subject_service.exception;

import com.aulix.common_core.exception.ApplicationException;
import com.aulix.common_core.exception.ErrorCode;
import org.springframework.http.HttpStatus;

public class RemoteServiceException extends ApplicationException {

    public RemoteServiceException(String message) {
        super(ErrorCode.INTERNAL_ERROR, HttpStatus.BAD_GATEWAY, message);
    }
}
