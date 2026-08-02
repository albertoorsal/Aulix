package com.aulix.student_service.mapper;

import com.aulix.student_service.domain.Student;
import com.aulix.student_service.dto.StudentResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel =  "spring")
public interface StudentMapper {

    @Mapping(target = "firstName", ignore = true)
    @Mapping(target = "lastName", ignore = true)
    @Mapping(target = "email", ignore = true)
    StudentResponse toResponse(Student student);
}
