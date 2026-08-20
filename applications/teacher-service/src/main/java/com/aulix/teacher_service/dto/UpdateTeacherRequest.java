package com.aulix.teacher_service.dto;

import com.aulix.teacher_service.domain.TeacherType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;

import java.math.BigDecimal;
import java.time.LocalDate;

public record UpdateTeacherRequest(
        @NotBlank String firstName,
        @NotBlank String lastName,
        @NotBlank @Email String email,
        @NotNull @Past LocalDate dateOfBirth,
        @NotNull TeacherType teacherType,
        @NotBlank String department,
        @NotBlank String subjectSpecialization,
        @NotNull @DecimalMin("0.0") BigDecimal salary
) {
}
