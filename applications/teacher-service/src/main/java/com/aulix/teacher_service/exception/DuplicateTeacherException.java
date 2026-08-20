package com.aulix.teacher_service.exception;

import com.aulix.common_core.exception.ResourceAlreadyExistsException;

public class DuplicateTeacherException extends ResourceAlreadyExistsException {
    public DuplicateTeacherException(String field, String value) {
        super("A teacher with %s '%s' already exists".formatted(field, value));
    }
}
