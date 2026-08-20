package com.aulix.teacher_service.dto;

import com.aulix.teacher_service.domain.EmploymentStatus;
import com.aulix.teacher_service.domain.TeacherType;

public record TeacherSearchCriteria(
        String search,
        EmploymentStatus status,
        TeacherType teacherType,
        String department
){
}
