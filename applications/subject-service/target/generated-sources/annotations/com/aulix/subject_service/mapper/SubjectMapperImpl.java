package com.aulix.subject_service.mapper;

import com.aulix.subject_service.domain.Subject;
import com.aulix.subject_service.domain.SubjectStatus;
import com.aulix.subject_service.domain.SubjectStudent;
import com.aulix.subject_service.domain.SubjectTeacher;
import com.aulix.subject_service.dto.StudentEnrollmentResponse;
import com.aulix.subject_service.dto.SubjectResponse;
import com.aulix.subject_service.dto.TeacherAssignmentResponse;
import java.util.UUID;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-09-06T15:31:18-0700",
    comments = "version: 1.6.3, compiler: javac, environment: Java 21.0.12 (Homebrew)"
)
@Component
public class SubjectMapperImpl implements SubjectMapper {

    @Override
    public SubjectResponse toResponse(Subject subject) {
        if ( subject == null ) {
            return null;
        }

        UUID id = null;
        String code = null;
        String name = null;
        String description = null;
        int creditHours = 0;
        SubjectStatus status = null;

        id = subject.getId();
        code = subject.getCode();
        name = subject.getName();
        description = subject.getDescription();
        creditHours = subject.getCreditHours();
        status = subject.getStatus();

        SubjectResponse subjectResponse = new SubjectResponse( id, code, name, description, creditHours, status );

        return subjectResponse;
    }

    @Override
    public TeacherAssignmentResponse toResponse(SubjectTeacher subjectTeacher) {
        if ( subjectTeacher == null ) {
            return null;
        }

        UUID id = null;
        UUID subjectId = null;
        UUID teacherId = null;

        id = subjectTeacher.getId();
        subjectId = subjectTeacher.getSubjectId();
        teacherId = subjectTeacher.getTeacherId();

        TeacherAssignmentResponse teacherAssignmentResponse = new TeacherAssignmentResponse( id, subjectId, teacherId );

        return teacherAssignmentResponse;
    }

    @Override
    public StudentEnrollmentResponse toResponse(SubjectStudent subjectStudent) {
        if ( subjectStudent == null ) {
            return null;
        }

        UUID id = null;
        UUID subjectId = null;
        UUID studentId = null;

        id = subjectStudent.getId();
        subjectId = subjectStudent.getSubjectId();
        studentId = subjectStudent.getStudentId();

        StudentEnrollmentResponse studentEnrollmentResponse = new StudentEnrollmentResponse( id, subjectId, studentId );

        return studentEnrollmentResponse;
    }
}
