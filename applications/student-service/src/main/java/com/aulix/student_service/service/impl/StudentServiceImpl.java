package com.aulix.student_service.service.impl;

import com.aulix.security_starter.annotation.Roles;
import com.aulix.student_service.client.CreateUserRequest;
import com.aulix.student_service.client.UserClient;
import com.aulix.student_service.client.UserResponse;
import com.aulix.student_service.domain.Student;
import com.aulix.student_service.dto.CreateStudentRequest;
import com.aulix.student_service.dto.StudentResponse;
import com.aulix.student_service.exception.DuplicateStudentException;
import com.aulix.student_service.mapper.StudentMapper;
import com.aulix.student_service.repository.StudentRepository;
import com.aulix.student_service.service.StudentService;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.Set;

@Service
public class StudentServiceImpl implements StudentService {

    private final StudentRepository studentRepository;
    private final StudentMapper studentMapper;
    private final UserClient userClient;

    public StudentServiceImpl(
            StudentRepository studentRepository,
            StudentMapper studentMapper,
            UserClient userClient
    ) {
        this.studentRepository = studentRepository;
        this.studentMapper = studentMapper;
        this.userClient = userClient;
    }

    @Override
    @Transactional
    public StudentResponse create(CreateStudentRequest request) {
        if (studentRepository.existsByCurpIgnoreCase(request.curp())) {
            throw new DuplicateStudentException("CURP: ", request.curp());
        }

        // First we need to create a user and retrieve user_id
        UserResponse user = userClient.createUser(new CreateUserRequest(
                request.email(),
                request.password(),
                request.firstName(),
                request.lastName(),
                Set.of(Roles.STUDENT)
        ));

        Student student = new Student(
                user.id(),
                request.studentNumber(),
                request.dateOfBirth(),
                request.enrollmentDate(),
                request.gradeLevel(),
                request.curp()
        );

        Student saved = studentRepository.save(student);

        return studentMapper.toResponse(saved);
    }
}
