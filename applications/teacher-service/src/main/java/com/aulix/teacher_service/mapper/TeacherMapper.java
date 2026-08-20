package com.aulix.teacher_service.mapper;

import com.aulix.teacher_service.domain.Teacher;
import com.aulix.teacher_service.dto.TeacherResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel =  "spring")
public interface TeacherMapper {

    @Mapping(target = "firstName", ignore = true)
    @Mapping(target = "lastName", ignore = true)
    @Mapping(target = "email", ignore = true)
    TeacherResponse toResponse(Teacher teacher);
}
