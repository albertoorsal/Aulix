package com.aulix.subject_service.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record CreateSubjectRequest(
        @NotBlank String code,
        @NotBlank String name,
        String description,
        @NotNull @Min(1) Integer creditHours
) {
}
