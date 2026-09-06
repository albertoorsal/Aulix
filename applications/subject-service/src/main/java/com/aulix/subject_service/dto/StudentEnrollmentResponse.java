package com.aulix.subject_service.dto;

import java.util.UUID;

public record StudentEnrollmentResponse(
        UUID id,
        UUID subjectId,
        UUID studentId
) {
}
