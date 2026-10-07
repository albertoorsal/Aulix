package com.aulix.parent_service.exception;

import com.aulix.common_core.exception.ResourceAlreadyExistsException;

public class DuplicateParentException extends ResourceAlreadyExistsException {
    public DuplicateParentException(String field, String value) {
        super("A parent with %s '%s' already exists".formatted(field, value));
    }
}
