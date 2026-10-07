package com.aulix.parent_service.dto;

import com.aulix.parent_service.domain.Relationship;
import jakarta.validation.constraints.NotNull;

public record LinkStudentRequest(
        @NotNull Relationship relationship,
        boolean primaryContact
) {
}
