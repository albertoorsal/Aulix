package com.aulix.parent_service.exception;

import com.aulix.common_core.exception.ResourceAlreadyExistsException;

public class DuplicateLinkException extends ResourceAlreadyExistsException {
    public DuplicateLinkException(String message) {
        super(message);
    }
}
