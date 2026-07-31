package com.aulix.student_service.dto;

import jakarta.validation.constraints.*;
import java.time.LocalDate;

public record CreateStudentRequest (
        @NotBlank String studentNumber,
        @NotBlank String firstName,
        @NotBlank String lastName,
        @NotBlank @Email String email,
        @NotNull @Past LocalDate dateOfBirth,
        @NotNull LocalDate enrollmentDate,
        @Min(1) int gradeLevel,
        @NotBlank String curp
){
}
