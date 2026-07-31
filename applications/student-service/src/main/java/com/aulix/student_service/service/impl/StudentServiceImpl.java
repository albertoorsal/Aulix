package com.aulix.student_service.service.impl;

import com.aulix.student_service.domain.EnrollmentStatus;
import com.aulix.student_service.domain.Student;
import com.aulix.student_service.dto.CreateStudentRequest;
import com.aulix.student_service.dto.StudentResponse;
import com.aulix.student_service.exception.DuplicateStudentException;
import com.aulix.student_service.mapper.StudentMapper;
import com.aulix.student_service.repository.StudentRepository;
import com.aulix.student_service.service.StudentService;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class StudentServiceImpl implements StudentService {

    private final StudentRepository studentRepository;
    private final StudentMapper studentMapper;

    public StudentServiceImpl(StudentRepository studentRepository, StudentMapper studentMapper) {
        this.studentRepository = studentRepository;
        this.studentMapper = studentMapper;
    }

    @Override
    @Transactional
    public StudentResponse create(CreateStudentRequest request) {
        if (studentRepository.existsByEmailIgnoreCase(request.email())) {
            throw  new DuplicateStudentException("Email: ", request.email());
        }

        if (studentRepository.existsByCurpIgnoreCase(request.curp())) {
            throw  new DuplicateStudentException("CURP: ", request.curp());
        }

        Student student = new Student(
                UUID.randomUUID(),
                request.studentNumber(),
                request.firstName(),
                request.lastName(),
                request.email(),
                request.dateOfBirth(),
                request.enrollmentDate(),
                request.gradeLevel(),
                request.curp()
        );

        Student saved = studentRepository.save(student);

        return studentMapper.toResponse(saved);
    }
}
