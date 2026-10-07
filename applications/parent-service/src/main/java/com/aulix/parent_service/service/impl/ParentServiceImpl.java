package com.aulix.parent_service.service.impl;

import com.aulix.common_core.exception.ResourceNotFoundException;
import com.aulix.parent_service.client.CreateUserRequest;
import com.aulix.parent_service.client.UpdateUserRequest;
import com.aulix.parent_service.client.UserClient;
import com.aulix.parent_service.client.UserResponse;
import com.aulix.parent_service.domain.Parent;
import com.aulix.parent_service.dto.CreateParentRequest;
import com.aulix.parent_service.dto.CurrentUser;
import com.aulix.parent_service.dto.ParentResponse;
import com.aulix.parent_service.dto.ParentSearchCriteria;
import com.aulix.parent_service.dto.UpdateParentRequest;
import com.aulix.parent_service.mapper.ParentMapper;
import com.aulix.parent_service.repository.ParentRepository;
import com.aulix.parent_service.repository.ParentSpecifications;
import com.aulix.parent_service.repository.ParentStudentRepository;
import com.aulix.parent_service.service.ParentService;
import com.aulix.security_starter.annotation.Roles;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class ParentServiceImpl implements ParentService {

    private static final int USER_SEARCH_MAX_RESULTS = 500;

    private final ParentRepository parentRepository;
    private final ParentStudentRepository parentStudentRepository;
    private final ParentMapper parentMapper;
    private final UserClient userClient;

    public ParentServiceImpl(
            ParentRepository parentRepository,
            ParentStudentRepository parentStudentRepository,
            ParentMapper parentMapper,
            UserClient userClient
    ) {
        this.parentRepository = parentRepository;
        this.parentStudentRepository = parentStudentRepository;
        this.parentMapper = parentMapper;
        this.userClient = userClient;
    }

    @Override
    @Transactional
    public ParentResponse create(CreateParentRequest request) {
        // A duplicate email surfaces as a 409 from auth-service (DuplicateParentException).
        UserResponse user = userClient.createUser(new CreateUserRequest(
                request.email(),
                request.password(),
                request.firstName(),
                request.lastName(),
                Set.of(Roles.PARENT)
        ));

        Parent saved = parentRepository.save(new Parent(user.id(), blankToNull(request.phone())));

        return parentMapper.toResponse(saved).withUser(user.firstName(), user.lastName(), user.email());
    }

    @Override
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public Page<ParentResponse> search(ParentSearchCriteria criteria, Pageable pageable) {
        String search = criteria.search();
        List<UUID> matchingUserIds = (search == null || search.isBlank())
                ? List.of()
                : userClient.searchUsers(search, USER_SEARCH_MAX_RESULTS).stream().map(UserResponse::id).toList();

        Specification<Parent> spec = Specification.allOf(
                ParentSpecifications.matchesSearch(search, matchingUserIds));

        Page<Parent> parents = parentRepository.findAll(spec, pageable);

        Map<UUID, UserResponse> usersById = userIndex(parents);
        Map<UUID, Long> childCounts = childCountIndex(parents);

        return parents.map(parentMapper::toResponse)
                .map(response -> response.withChildCount(childCounts.getOrDefault(response.id(), 0L)))
                .map(response -> enrichWithUser(response, usersById));
    }

    private Map<UUID, UserResponse> userIndex(Page<Parent> parents) {
        List<UUID> userIds = parents.getContent().stream().map(Parent::getUserId).toList();
        return userClient.findAllByIds(userIds).stream()
                .collect(Collectors.toMap(UserResponse::id, Function.identity()));
    }

    private Map<UUID, Long> childCountIndex(Page<Parent> parents) {
        List<UUID> parentIds = parents.getContent().stream().map(Parent::getId).toList();
        if (parentIds.isEmpty()) {
            return Map.of();
        }
        return parentStudentRepository.countByParentIds(parentIds).stream()
                .collect(Collectors.toMap(row -> (UUID) row[0], row -> (Long) row[1]));
    }

    private ParentResponse enrichWithUser(ParentResponse response, Map<UUID, UserResponse> usersById) {
        UserResponse user = usersById.get(response.userId());
        if (user == null) {
            return response;
        }
        return response.withUser(user.firstName(), user.lastName(), user.email());
    }

    @Override
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public ParentResponse findById(UUID id) {
        Parent parent = getParentOrThrow(id);
        UserResponse user = userClient.findAllByIds(List.of(parent.getUserId())).stream()
                .findFirst()
                .orElse(null);
        ParentResponse response = parentMapper.toResponse(parent)
                .withChildCount(parentStudentRepository.countByParentId(id));
        return user == null ? response : response.withUser(user.firstName(), user.lastName(), user.email());
    }

    @Override
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public ParentResponse findMine(CurrentUser currentUser) {
        Parent parent = parentRepository.findByUserId(currentUser.userId())
                .orElseThrow(() -> ResourceNotFoundException.of("Parent profile for user", currentUser.userId()));
        // The name and email come from the caller's own token: auth-service's user lookups are
        // staff-only, and these claims are what the parent signed in with.
        return parentMapper.toResponse(parent)
                .withChildCount(parentStudentRepository.countByParentId(parent.getId()))
                .withUser(currentUser.firstName(), currentUser.lastName(), currentUser.email());
    }

    @Override
    @Transactional
    public ParentResponse update(UUID id, UpdateParentRequest request) {
        Parent parent = getParentOrThrow(id);

        UserResponse user = userClient.updateUserByUserId(parent.getUserId(),
                new UpdateUserRequest(request.firstName(), request.lastName(), request.email()));

        parent.setPhone(blankToNull(request.phone()));
        Parent saved = parentRepository.save(parent);

        return parentMapper.toResponse(saved)
                .withChildCount(parentStudentRepository.countByParentId(id))
                .withUser(user.firstName(), user.lastName(), user.email());
    }

    @Override
    @Transactional
    public void delete(UUID id) {
        Parent parent = getParentOrThrow(id);
        parentStudentRepository.deleteByParentId(id);
        parentRepository.delete(parent);
        userClient.deleteUserByUserId(parent.getUserId());
    }

    private Parent getParentOrThrow(UUID id) {
        return parentRepository.findById(id).orElseThrow(() -> ResourceNotFoundException.of("Parent", id));
    }

    private static String blankToNull(String value) {
        return (value == null || value.isBlank()) ? null : value.trim();
    }
}
