package com.aulix.parent_service.mapper;

import com.aulix.parent_service.domain.Parent;
import com.aulix.parent_service.domain.ParentStudent;
import com.aulix.parent_service.dto.ParentResponse;
import com.aulix.parent_service.dto.ParentStudentResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ParentMapper {

    @Mapping(target = "childCount", ignore = true)
    @Mapping(target = "firstName", ignore = true)
    @Mapping(target = "lastName", ignore = true)
    @Mapping(target = "email", ignore = true)
    ParentResponse toResponse(Parent parent);

    @Mapping(target = "student", ignore = true)
    ParentStudentResponse toResponse(ParentStudent parentStudent);
}
