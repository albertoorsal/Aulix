package com.aulix.student_service.mapper;

import com.aulix.student_service.domain.Student;
import com.aulix.student_service.dto.StudentResponse;
import org.mapstruct.Mapper;

@Mapper(componentModel =  "spring")
public interface StudentMapper {
    StudentResponse toResponse(Student student);
}
