package com.aulix.student_service.service.impl;

import com.aulix.security_starter.annotation.Roles;
import com.aulix.student_service.client.CreateUserRequest;
import com.aulix.student_service.client.UserClient;
import com.aulix.student_service.client.UserResponse;
import com.aulix.student_service.domain.Student;
import com.aulix.student_service.dto.CreateStudentRequest;
import com.aulix.student_service.dto.StudentResponse;
import com.aulix.student_service.dto.StudentSearchCriteria;
import com.aulix.student_service.exception.DuplicateStudentException;
import com.aulix.student_service.mapper.StudentMapper;
import com.aulix.student_service.repository.StudentRepository;
import com.aulix.student_service.repository.StudentSpecifications;
import com.aulix.student_service.service.StudentService;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class StudentServiceImpl implements StudentService {

    private static final int USER_SEARCH_MAX_RESULTS = 500;

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

    @Override
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public Page<StudentResponse> search(StudentSearchCriteria criteria, Pageable pageable) {
        String search = criteria.search();
        List<UUID> matchingUserIds = (search == null || search.isBlank())
                ? List.of()
                : userClient.searchUsers(search, USER_SEARCH_MAX_RESULTS).stream().map(UserResponse::id).toList();

        Specification<Student> spec = Specification.allOf(
                StudentSpecifications.matchesSearch(search, matchingUserIds),
                StudentSpecifications.hasEnrollmentStatus(criteria.status()),
                StudentSpecifications.hasGradeLevel(criteria.gradeLevel()));

        Page<Student> students = studentRepository.findAll(spec, pageable);

        Map<UUID, UserResponse> usersById = userIndex(students);

        return students.map(studentMapper::toResponse).map(response -> enrichWithUser(response, usersById));
    }

    private Map<UUID, UserResponse> userIndex(Page<Student> students) {
        List<UUID> userIds = students.getContent().stream().map(Student::getUserId).toList();
        return userClient.findAllByIds(userIds).stream()
                .collect(Collectors.toMap(UserResponse::id, Function.identity()));
    }

    private StudentResponse enrichWithUser(StudentResponse response, Map<UUID, UserResponse> usersById) {
        UserResponse user = usersById.get(response.userId());
        if (user == null) {
            return response;
        }
        return response.withUser(user.firstName(), user.lastName(), user.email());
    }
}
