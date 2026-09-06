package com.aulix.subject_service.dto;

import java.util.UUID;

public record TeacherAssignmentResponse(
        UUID id,
        UUID subjectId,
        UUID teacherId
) {
}
