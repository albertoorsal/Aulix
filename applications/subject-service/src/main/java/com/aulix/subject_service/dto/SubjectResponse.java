package com.aulix.subject_service.dto;

import com.aulix.subject_service.domain.SubjectStatus;

import java.util.UUID;

public record SubjectResponse(
        UUID id,
        String code,
        String name,
        String description,
        int creditHours,
        SubjectStatus status
) {
}
