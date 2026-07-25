package com.aulix.common_core.exception;

import org.springframework.http.HttpStatus;

public class ResourceNotFoundException extends ApplicationException {

    public ResourceNotFoundException(String message) {
        super(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND, message);
    }

    public static ResourceNotFoundException of(String resourceType, Object identifier) {
        return new ResourceNotFoundException("%s not found with identifier '%s'".formatted(resourceType, identifier));
    }
}
