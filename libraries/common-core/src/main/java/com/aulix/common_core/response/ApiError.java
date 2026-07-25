package com.aulix.common_core.response;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ApiError(
        String code,
        String message,
        String path,
        List<FieldViolation> violations
) {

    public record FieldViolation(String field, String message) {
    }
}
