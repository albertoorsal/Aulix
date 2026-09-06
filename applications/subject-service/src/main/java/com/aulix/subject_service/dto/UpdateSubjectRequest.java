package com.aulix.subject_service.dto;

import com.aulix.subject_service.domain.SubjectStatus;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record UpdateSubjectRequest(
        @NotBlank String name,
        String description,
        @NotNull @Min(1) Integer creditHours,
        @NotNull SubjectStatus status
) {
}
