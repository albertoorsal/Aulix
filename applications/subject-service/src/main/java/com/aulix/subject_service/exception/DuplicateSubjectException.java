package com.aulix.subject_service.exception;

import com.aulix.common_core.exception.ResourceAlreadyExistsException;

public class DuplicateSubjectException extends ResourceAlreadyExistsException {
    public DuplicateSubjectException(String field, String value) {
        super("A subject with %s '%s' already exists".formatted(field, value));
    }
}
