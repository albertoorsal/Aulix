package com.aulix.student_service.dto;

import com.aulix.student_service.domain.EnrollmentStatus;

public record StudentSearchCriteria(
        String search,
        EnrollmentStatus status,
        Integer gradeLevel
){
}
