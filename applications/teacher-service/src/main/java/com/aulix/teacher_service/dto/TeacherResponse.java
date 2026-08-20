package com.aulix.teacher_service.dto;

import com.aulix.teacher_service.domain.EmploymentStatus;
import com.aulix.teacher_service.domain.TeacherType;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record TeacherResponse(
        UUID id,
        UUID userId,
        String employeeNumber,
        LocalDate dateOfBirth,
        EmploymentStatus employmentStatus,
        TeacherType teacherType,
        LocalDate hireDate,
        String department,
        String subjectSpecialization,
        BigDecimal salary,
        String curp,
        String firstName,
        String lastName,
        String email
) {
    public TeacherResponse withUser(String firstName, String lastName, String email) {
        return new TeacherResponse(
                id, userId, employeeNumber, dateOfBirth, employmentStatus, teacherType, hireDate, department,
                subjectSpecialization, salary, curp, firstName, lastName, email
        );
    }
}
