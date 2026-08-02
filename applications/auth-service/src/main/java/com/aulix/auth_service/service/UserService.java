package com.aulix.auth_service.service;

import com.aulix.auth_service.dto.UserResponse;
import com.aulix.auth_service.dto.UserSearchCriteria;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

public interface UserService {

    Page<UserResponse> findAll(Pageable pageable);

    UserResponse findById(UUID id);

    List<UserResponse> findAllByIds(Collection<UUID> ids);

    UserResponse findByEmail(String email);

    void setEnabled(UUID id, boolean enabled);

    UserResponse assignRole(UUID id, String roleName);

    UserResponse revokeRole(UUID id, String roleName);

    Page<UserResponse> search(UserSearchCriteria criteria, Pageable pageable);
}
