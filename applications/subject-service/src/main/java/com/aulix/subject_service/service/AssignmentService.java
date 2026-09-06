package com.aulix.subject_service.service;

import com.aulix.subject_service.dto.StudentEnrollmentResponse;
import com.aulix.subject_service.dto.TeacherAssignmentResponse;

import java.util.List;
import java.util.UUID;

public interface AssignmentService {

    TeacherAssignmentResponse assignTeacher(UUID subjectId, UUID teacherId);

    void unassignTeacher(UUID subjectId, UUID teacherId);

    List<TeacherAssignmentResponse> listTeachers(UUID subjectId);

    StudentEnrollmentResponse enrollStudent(UUID subjectId, UUID studentId);

    void unenrollStudent(UUID subjectId, UUID studentId);

    List<StudentEnrollmentResponse> listStudents(UUID subjectId);
}
