package com.aulix.student_service.exception;

import com.aulix.common_core.exception.ResourceAlreadyExistsException;

public class DuplicateStudentException extends ResourceAlreadyExistsException {
    public DuplicateStudentException(String field, String value) {
        super("A student with %s '%s' already exists".formatted(field, value));
    }
}
