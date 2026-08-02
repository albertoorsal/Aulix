package com.aulix.student_service.dto;

import com.aulix.student_service.domain.EnrollmentStatus;
import java.time.LocalDate;
import java.util.UUID;

public record StudentResponse(
        UUID id,
        UUID userId,
        String studentNumber,
        LocalDate dateOfBirth,
        EnrollmentStatus enrollmentStatus,
        LocalDate enrollmentDate,
        int gradeLevel,
        String curp
) {
}
