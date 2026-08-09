package com.aulix.staff_service.dto;

import com.aulix.staff_service.domain.EmploymentStatus;
import com.aulix.staff_service.domain.StaffType;

public record StaffSearchCriteria(
        String search,
        EmploymentStatus status,
        StaffType staffType,
        String department
){
}
