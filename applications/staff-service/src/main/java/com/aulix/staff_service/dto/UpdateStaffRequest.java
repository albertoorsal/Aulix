package com.aulix.staff_service.dto;

import com.aulix.staff_service.domain.StaffType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;

import java.math.BigDecimal;
import java.time.LocalDate;

public record UpdateStaffRequest(
        @NotBlank String firstName,
        @NotBlank String lastName,
        @NotBlank @Email String email,
        @NotNull @Past LocalDate dateOfBirth,
        @NotNull StaffType staffType,
        @NotBlank String department,
        @NotBlank String jobTitle,
        @NotNull @DecimalMin("0.0") BigDecimal salary
) {
}
