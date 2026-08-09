package com.aulix.staff_service.dto;

import com.aulix.staff_service.domain.StaffType;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDate;

public record CreateStaffRequest(
        @NotBlank String employeeNumber,
        @NotBlank String firstName,
        @NotBlank String lastName,
        @NotBlank @Email String email,
        @NotNull @Past LocalDate dateOfBirth,
        @NotNull StaffType staffType,
        @NotNull LocalDate hireDate,
        @NotBlank String department,
        @NotBlank String jobTitle,
        @NotNull @DecimalMin("0.0") BigDecimal salary,
        @NotBlank String curp,
        @NotBlank String password
){
}
