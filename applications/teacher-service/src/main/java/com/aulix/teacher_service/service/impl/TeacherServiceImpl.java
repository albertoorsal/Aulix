package com.aulix.teacher_service.service.impl;

import com.aulix.security_starter.annotation.Roles;
import com.aulix.teacher_service.client.CreateUserRequest;
import com.aulix.teacher_service.client.UserClient;
import com.aulix.teacher_service.client.UserResponse;
import com.aulix.teacher_service.domain.Teacher;
import com.aulix.teacher_service.dto.CreateTeacherRequest;
import com.aulix.teacher_service.dto.TeacherResponse;
import com.aulix.teacher_service.dto.TeacherSearchCriteria;
import com.aulix.teacher_service.dto.UpdateTeacherRequest;
import com.aulix.teacher_service.exception.DuplicateTeacherException;
import com.aulix.teacher_service.mapper.TeacherMapper;
import com.aulix.teacher_service.repository.TeacherRepository;
import com.aulix.teacher_service.repository.TeacherSpecifications;
import com.aulix.teacher_service.service.TeacherService;
import com.aulix.common_core.exception.ResourceNotFoundException;
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
public class TeacherServiceImpl implements TeacherService {

    private static final int USER_SEARCH_MAX_RESULTS = 500;

    private final TeacherRepository teacherRepository;
    private final TeacherMapper teacherMapper;
    private final UserClient userClient;

    public TeacherServiceImpl(
            TeacherRepository teacherRepository,
            TeacherMapper teacherMapper,
            UserClient userClient
    ) {
        this.teacherRepository = teacherRepository;
        this.teacherMapper = teacherMapper;
        this.userClient = userClient;
    }

    @Override
    @Transactional
    public TeacherResponse create(CreateTeacherRequest request) {
        if (teacherRepository.existsByCurpIgnoreCase(request.curp())) {
            throw new DuplicateTeacherException("CURP: ", request.curp());
        }


        // First we need to create a user and retrieve user_id
        UserResponse user = userClient.createUser(new CreateUserRequest(
                request.email(),
                request.password(),
                request.firstName(),
                request.lastName(),
                Set.of(Roles.TEACHER)
        ));

        Teacher teacher = new Teacher(
                user.id(),
                request.employeeNumber(),
                request.dateOfBirth(),
                request.teacherType(),
                request.hireDate(),
                request.department(),
                request.subjectSpecialization(),
                request.salary(),
                request.curp()
        );

        Teacher saved = teacherRepository.save(teacher);

        return teacherMapper.toResponse(saved);
    }

    @Override
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public Page<TeacherResponse> search(TeacherSearchCriteria criteria, Pageable pageable) {
        String search = criteria.search();
        List<UUID> matchingUserIds = (search == null || search.isBlank())
                ? List.of()
                : userClient.searchUsers(search, USER_SEARCH_MAX_RESULTS).stream().map(UserResponse::id).toList();

        Specification<Teacher> spec = Specification.allOf(
                TeacherSpecifications.matchesSearch(search, matchingUserIds),
                TeacherSpecifications.hasEmploymentStatus(criteria.status()),
                TeacherSpecifications.hasTeacherType(criteria.teacherType()),
                TeacherSpecifications.hasDepartment(criteria.department()));

        Page<Teacher> teacher = teacherRepository.findAll(spec, pageable);

        Map<UUID, UserResponse> usersById = userIndex(teacher);

        return teacher.map(teacherMapper::toResponse).map(response -> enrichWithUser(response, usersById));
    }

    private Map<UUID, UserResponse> userIndex(Page<Teacher> teacher) {
        List<UUID> userIds = teacher.getContent().stream().map(Teacher::getUserId).toList();
        return userClient.findAllByIds(userIds).stream()
                .collect(Collectors.toMap(UserResponse::id, Function.identity()));
    }

    private TeacherResponse enrichWithUser(TeacherResponse response, Map<UUID, UserResponse> usersById) {
        UserResponse user = usersById.get(response.userId());
        if (user == null) {
            return response;
        }
        return response.withUser(user.firstName(), user.lastName(), user.email());
    }


    @Override
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public TeacherResponse findById(UUID id) {
        Teacher teacher = getTeacherOrThrow(id);
        UserResponse user = userClient.findAllByIds(List.of(teacher.getUserId())).stream()
                .findFirst()
                .orElse(null);
        TeacherResponse response = teacherMapper.toResponse(teacher);
        return user == null ? response : response.withUser(user.firstName(), user.lastName(), user.email());
    }

    @Override
    @Transactional
    public TeacherResponse update(UUID id, UpdateTeacherRequest request) {
        Teacher teacher = getTeacherOrThrow(id);

        UserResponse user = userClient.updateUserByUserId(teacher.getUserId(), request);

        teacher.setDateOfBirth(request.dateOfBirth());
        teacher.setTeacherType(request.teacherType());
        teacher.setDepartment(request.department());
        teacher.setSubjectSpecialization(request.subjectSpecialization());
        teacher.setSalary(request.salary());
        Teacher saved = teacherRepository.save(teacher);

        return teacherMapper.toResponse(saved).withUser(user.firstName(), user.lastName(), user.email());
    }

    @Override
    @Transactional
    public void delete(UUID id) {
        Teacher teacher = getTeacherOrThrow(id);
        teacherRepository.delete(teacher);
        userClient.deleteUserByUserId(teacher.getUserId());
    }

    private Teacher getTeacherOrThrow(UUID id) {
        return teacherRepository.findById(id).orElseThrow(() -> ResourceNotFoundException.of("Teacher", id));
    }
}
