package com.aulix.staff_service.mapper;

import com.aulix.staff_service.domain.Staff;
import com.aulix.staff_service.dto.StaffResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel =  "spring")
public interface StaffMapper {

    @Mapping(target = "firstName", ignore = true)
    @Mapping(target = "lastName", ignore = true)
    @Mapping(target = "email", ignore = true)
    StaffResponse toResponse(Staff staff);
}
