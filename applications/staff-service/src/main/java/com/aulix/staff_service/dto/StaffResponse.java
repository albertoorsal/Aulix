package com.aulix.staff_service.dto;

import com.aulix.staff_service.domain.EmploymentStatus;
import com.aulix.staff_service.domain.StaffType;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record StaffResponse(
        UUID id,
        UUID userId,
        String employeeNumber,
        LocalDate dateOfBirth,
        EmploymentStatus employmentStatus,
        StaffType staffType,
        LocalDate hireDate,
        String department,
        String jobTitle,
        BigDecimal salary,
        String curp,
        String firstName,
        String lastName,
        String email
) {
    public StaffResponse withUser(String firstName, String lastName, String email) {
        return new StaffResponse(
                id, userId, employeeNumber, dateOfBirth, employmentStatus, staffType, hireDate, department,
                jobTitle, salary, curp, firstName, lastName, email
        );
    }
}
