package com.aulix.auth_service.service.impl;

import com.aulix.auth_service.domain.AuditAction;
import com.aulix.auth_service.domain.Role;
import com.aulix.auth_service.domain.User;
import com.aulix.auth_service.dto.UpdateUserRequest;
import com.aulix.auth_service.dto.UserResponse;
import com.aulix.auth_service.dto.UserSearchCriteria;
import com.aulix.auth_service.mapper.UserMapper;
import com.aulix.auth_service.repository.RoleRepository;
import com.aulix.auth_service.repository.UserRepository;
import com.aulix.auth_service.repository.UserSpecifications;
import com.aulix.auth_service.service.AuditLogService;
import com.aulix.auth_service.service.UserService;
import com.aulix.common_core.exception.BusinessRuleViolationException;
import com.aulix.common_core.exception.ResourceAlreadyExistsException;
import com.aulix.common_core.exception.ResourceNotFoundException;
import com.aulix.security_starter.annotation.Roles;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collection;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserMapper userMapper;
    private final AuditLogService auditLogService;

    public UserServiceImpl(UserRepository userRepository, RoleRepository roleRepository, UserMapper userMapper,
                           AuditLogService auditLogService) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.userMapper = userMapper;
        this.auditLogService = auditLogService;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<UserResponse> findAll(Pageable pageable) {
        return userRepository.findAll(pageable).map(userMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse findById(UUID id) {
        return userMapper.toResponse(getUserOrThrow(id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserResponse> findAllByIds(Collection<UUID> ids) {
        if (ids == null || ids.isEmpty()) {
            return List.of();
        }
        return userRepository.findAllById(ids).stream().map(userMapper::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse findByEmail(String email) {
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> ResourceNotFoundException.of("User", email));
        return userMapper.toResponse(user);
    }

    @Override
    @Transactional
    public void setEnabled(UUID id, boolean enabled) {
        User user = getUserOrThrow(id);
        if (user.isEnabled() == enabled) {
            return;
        }
        if (!enabled && isCurrentUser(user)) {
            throw new BusinessRuleViolationException("You can't disable your own account");
        }
        user.setEnabled(enabled);
        auditLogService.record(enabled ? AuditAction.USER_ENABLED : AuditAction.USER_DISABLED, user, null);
    }

    @Override
    @Transactional
    public UserResponse assignRole(UUID id, String roleName) {
        User user = getUserOrThrow(id);
        Role role = getRoleOrThrow(roleName);
        if (user.assignRole(role)) {
            auditLogService.record(AuditAction.ROLE_ASSIGNED, user, role.getName());
        }
        return userMapper.toResponse(user);
    }

    @Override
    @Transactional
    public UserResponse revokeRole(UUID id, String roleName) {
        User user = getUserOrThrow(id);
        Role role = getRoleOrThrow(roleName);
        // Keeps at least one admin around: the one making the change.
        if (Roles.ADMIN.equals(role.getName()) && isCurrentUser(user)) {
            throw new BusinessRuleViolationException("You can't remove the ADMIN role from your own account");
        }
        if (user.revokeRole(role)) {
            auditLogService.record(AuditAction.ROLE_REVOKED, user, role.getName());
        }
        return userMapper.toResponse(user);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<UserResponse> search(UserSearchCriteria criteria, Pageable pageable) {
        Specification<User> spec = Specification.allOf(
                UserSpecifications.matchesSearch(criteria.search()),
                UserSpecifications.hasRole(criteria.role()),
                UserSpecifications.isEnabled(criteria.enabled()));
        return userRepository.findAll(spec, pageable).map(userMapper::toResponse);
    }

    @Override
    @Transactional
    public UserResponse update(UUID id, UpdateUserRequest request) {
        User user = getUserOrThrow(id);
        String email = request.email().trim();
        if (!email.equalsIgnoreCase(user.getEmail()) && userRepository.existsByEmailIgnoreCase(email)) {
            throw new ResourceAlreadyExistsException("A user with email '%s' already exists".formatted(email));
        }

        List<String> changed = new ArrayList<>();
        if (!Objects.equals(user.getFirstName(), request.firstName())) changed.add("first name");
        if (!Objects.equals(user.getLastName(), request.lastName())) changed.add("last name");
        if (!email.equals(user.getEmail())) changed.add("email");

        user.setFirstName(request.firstName());
        user.setLastName(request.lastName());
        user.setEmail(email);
        User saved = userRepository.save(user);
        if (!changed.isEmpty()) {
            auditLogService.record(AuditAction.USER_UPDATED, saved, "Changed " + String.join(", ", changed));
        }
        return userMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public void delete(UUID id) {
        User user = getUserOrThrow(id);
        if (isCurrentUser(user)) {
            throw new BusinessRuleViolationException("You can't delete your own account");
        }
        auditLogService.record(AuditAction.USER_DELETED, user, null);
        userRepository.delete(user);
    }

    // Access tokens use the email as the principal name (see RbacJwtAuthenticationConverter).
    private boolean isCurrentUser(User user) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null && user.getEmail().equalsIgnoreCase(authentication.getName());
    }

    private User getUserOrThrow(UUID id) {
        return userRepository.findById(id).orElseThrow(() -> ResourceNotFoundException.of("User", id));
    }

    private Role getRoleOrThrow(String roleName) {
        return roleRepository.findByNameIgnoreCase(roleName)
                .orElseThrow(() -> ResourceNotFoundException.of("Role", roleName));
    }
}

