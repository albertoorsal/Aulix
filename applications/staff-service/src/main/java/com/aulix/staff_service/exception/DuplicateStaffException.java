package com.aulix.staff_service.exception;

import com.aulix.common_core.exception.ResourceAlreadyExistsException;

public class DuplicateStaffException extends ResourceAlreadyExistsException {
    public DuplicateStaffException(String field, String value) {
        super("A staff member with %s '%s' already exists".formatted(field, value));
    }
}
