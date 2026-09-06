package com.aulix.subject_service.mapper;

import com.aulix.subject_service.domain.Subject;
import com.aulix.subject_service.domain.SubjectStudent;
import com.aulix.subject_service.domain.SubjectTeacher;
import com.aulix.subject_service.dto.StudentEnrollmentResponse;
import com.aulix.subject_service.dto.SubjectResponse;
import com.aulix.subject_service.dto.TeacherAssignmentResponse;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface SubjectMapper {

    SubjectResponse toResponse(Subject subject);

    TeacherAssignmentResponse toResponse(SubjectTeacher subjectTeacher);

    StudentEnrollmentResponse toResponse(SubjectStudent subjectStudent);
}
