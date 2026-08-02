package com.aulix.auth_service.service.impl;

import com.aulix.auth_service.domain.Role;
import com.aulix.auth_service.domain.User;
import com.aulix.auth_service.dto.UserResponse;
import com.aulix.auth_service.dto.UserSearchCriteria;
import com.aulix.auth_service.mapper.UserMapper;
import com.aulix.auth_service.repository.RoleRepository;
import com.aulix.auth_service.repository.UserRepository;
import com.aulix.auth_service.repository.UserSpecifications;
import com.aulix.auth_service.service.UserService;
import com.aulix.common_core.exception.ResourceNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserMapper userMapper;

    public UserServiceImpl(UserRepository userRepository, RoleRepository roleRepository, UserMapper userMapper) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.userMapper = userMapper;
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
        user.setEnabled(enabled);
    }

    @Override
    @Transactional
    public UserResponse assignRole(UUID id, String roleName) {
        User user = getUserOrThrow(id);
        user.assignRole(getRoleOrThrow(roleName));
        return userMapper.toResponse(user);
    }

    @Override
    @Transactional
    public UserResponse revokeRole(UUID id, String roleName) {
        User user = getUserOrThrow(id);
        user.revokeRole(getRoleOrThrow(roleName));
        return userMapper.toResponse(user);
    }

    @Override
    public Page<UserResponse> search(UserSearchCriteria criteria, Pageable pageable) {
        Specification<User> spec = Specification.allOf(
                UserSpecifications.nameContains(criteria.search()));


        return userRepository.findAll(spec, pageable).map(userMapper::toResponse);
    }

    private User getUserOrThrow(UUID id) {
        return userRepository.findById(id).orElseThrow(() -> ResourceNotFoundException.of("User", id));
    }

    private Role getRoleOrThrow(String roleName) {
        return roleRepository.findByNameIgnoreCase(roleName)
                .orElseThrow(() -> ResourceNotFoundException.of("Role", roleName));
    }
}

