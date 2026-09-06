package com.aulix.subject_service.exception;

import com.aulix.common_core.exception.ResourceAlreadyExistsException;

public class DuplicateAssignmentException extends ResourceAlreadyExistsException {
    public DuplicateAssignmentException(String message) {
        super(message);
    }
}
