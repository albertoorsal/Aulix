package com.aulix.parent_service.dto;

import java.time.LocalDate;
import java.util.UUID;

/**
 * The subset of student-service's StudentResponse a parent link displays. Unknown fields in
 * the student-service payload are ignored.
 */
public record StudentSummary(
        UUID id,
        String studentNumber,
        LocalDate dateOfBirth,
        String enrollmentStatus,
        int gradeLevel,
        String firstName,
        String lastName,
        String email
) {
}
