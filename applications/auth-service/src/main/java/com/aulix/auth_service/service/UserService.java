package com.aulix.auth_service.service;

import com.aulix.auth_service.dto.UserResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface UserService {

    Page<UserResponse> findAll(Pageable pageable);

    UserResponse findById(UUID id);

    UserResponse findByEmail(String email);

    void setEnabled(UUID id, boolean enabled);

    UserResponse assignRole(UUID id, String roleName);

    UserResponse revokeRole(UUID id, String roleName);
}
