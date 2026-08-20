package com.aulix.teacher_service.dto;

import com.aulix.teacher_service.domain.TeacherType;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDate;

public record CreateTeacherRequest(
        @NotBlank String employeeNumber,
        @NotBlank String firstName,
        @NotBlank String lastName,
        @NotBlank @Email String email,
        @NotNull @Past LocalDate dateOfBirth,
        @NotNull TeacherType teacherType,
        @NotNull LocalDate hireDate,
        @NotBlank String department,
        @NotBlank String subjectSpecialization,
        @NotNull @DecimalMin("0.0") BigDecimal salary,
        @NotBlank String curp,
        @NotBlank String password
){
}
