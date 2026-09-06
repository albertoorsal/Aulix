package com.aulix.subject_service.service.impl;

import com.aulix.common_core.exception.ResourceNotFoundException;
import com.aulix.subject_service.client.StudentClient;
import com.aulix.subject_service.client.TeacherClient;
import com.aulix.subject_service.domain.Subject;
import com.aulix.subject_service.domain.SubjectStudent;
import com.aulix.subject_service.domain.SubjectTeacher;
import com.aulix.subject_service.dto.StudentEnrollmentResponse;
import com.aulix.subject_service.dto.TeacherAssignmentResponse;
import com.aulix.subject_service.exception.DuplicateAssignmentException;
import com.aulix.subject_service.mapper.SubjectMapper;
import com.aulix.subject_service.repository.SubjectRepository;
import com.aulix.subject_service.repository.SubjectStudentRepository;
import com.aulix.subject_service.repository.SubjectTeacherRepository;
import com.aulix.subject_service.service.AssignmentService;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class AssignmentServiceImpl implements AssignmentService {

    private final SubjectRepository subjectRepository;
    private final SubjectTeacherRepository subjectTeacherRepository;
    private final SubjectStudentRepository subjectStudentRepository;
    private final TeacherClient teacherClient;
    private final StudentClient studentClient;
    private final SubjectMapper subjectMapper;

    public AssignmentServiceImpl(
            SubjectRepository subjectRepository,
            SubjectTeacherRepository subjectTeacherRepository,
            SubjectStudentRepository subjectStudentRepository,
            TeacherClient teacherClient,
            StudentClient studentClient,
            SubjectMapper subjectMapper
    ) {
        this.subjectRepository = subjectRepository;
        this.subjectTeacherRepository = subjectTeacherRepository;
        this.subjectStudentRepository = subjectStudentRepository;
        this.teacherClient = teacherClient;
        this.studentClient = studentClient;
        this.subjectMapper = subjectMapper;
    }

    @Override
    @Transactional
    public TeacherAssignmentResponse assignTeacher(UUID subjectId, UUID teacherId) {
        getSubjectOrThrow(subjectId);

        if (!teacherClient.exists(teacherId)) {
            throw ResourceNotFoundException.of("Teacher", teacherId);
        }
        if (subjectTeacherRepository.existsBySubjectIdAndTeacherId(subjectId, teacherId)) {
            throw new DuplicateAssignmentException(
                    "Teacher '%s' is already assigned to subject '%s'".formatted(teacherId, subjectId));
        }

        SubjectTeacher saved = subjectTeacherRepository.save(new SubjectTeacher(subjectId, teacherId));
        return subjectMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public void unassignTeacher(UUID subjectId, UUID teacherId) {
        SubjectTeacher assignment = subjectTeacherRepository.findBySubjectIdAndTeacherId(subjectId, teacherId)
                .orElseThrow(() -> ResourceNotFoundException.of("Teacher assignment", teacherId));
        subjectTeacherRepository.delete(assignment);
    }

    @Override
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public List<TeacherAssignmentResponse> listTeachers(UUID subjectId) {
        getSubjectOrThrow(subjectId);
        return subjectTeacherRepository.findBySubjectId(subjectId).stream()
                .map(subjectMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public StudentEnrollmentResponse enrollStudent(UUID subjectId, UUID studentId) {
        getSubjectOrThrow(subjectId);

        if (!studentClient.exists(studentId)) {
            throw ResourceNotFoundException.of("Student", studentId);
        }
        if (subjectStudentRepository.existsBySubjectIdAndStudentId(subjectId, studentId)) {
            throw new DuplicateAssignmentException(
                    "Student '%s' is already enrolled in subject '%s'".formatted(studentId, subjectId));
        }

        SubjectStudent saved = subjectStudentRepository.save(new SubjectStudent(subjectId, studentId));
        return subjectMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public void unenrollStudent(UUID subjectId, UUID studentId) {
        SubjectStudent enrollment = subjectStudentRepository.findBySubjectIdAndStudentId(subjectId, studentId)
                .orElseThrow(() -> ResourceNotFoundException.of("Student enrollment", studentId));
        subjectStudentRepository.delete(enrollment);
    }

    @Override
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public List<StudentEnrollmentResponse> listStudents(UUID subjectId) {
        getSubjectOrThrow(subjectId);
        return subjectStudentRepository.findBySubjectId(subjectId).stream()
                .map(subjectMapper::toResponse)
                .toList();
    }

    private Subject getSubjectOrThrow(UUID subjectId) {
        return subjectRepository.findById(subjectId)
                .orElseThrow(() -> ResourceNotFoundException.of("Subject", subjectId));
    }
}
