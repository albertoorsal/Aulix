package com.aulix.auth_service.controller;

import com.aulix.auth_service.dto.UserResponse;
import com.aulix.auth_service.service.UserService;
import com.aulix.common_core.pagination.PageResponse;
import com.aulix.common_core.response.ApiResponse;
import com.aulix.security_starter.annotation.Roles;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@Tag(name = "Users", description = "User administration and RBAC role management")
@PreAuthorize("hasRole('" + Roles.ADMIN + "')")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<UserResponse>>> findAll(Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(PageResponse.from(userService.findAll(pageable))));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(userService.findById(id)));
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<UserResponse>> me(Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.ok(userService.findByEmail(authentication.getName())));
    }

    @PutMapping("/{id}/enable")
    public ResponseEntity<ApiResponse<Void>> enable(@PathVariable UUID id) {
        userService.setEnabled(id, true);
        return ResponseEntity.ok(ApiResponse.ok(null, "User enabled"));
    }

    @PutMapping("/{id}/disable")
    public ResponseEntity<ApiResponse<Void>> disable(@PathVariable UUID id) {
        userService.setEnabled(id, false);
        return ResponseEntity.ok(ApiResponse.ok(null, "User disabled"));
    }

    @PostMapping("/{id}/roles/{roleName}")
    public ResponseEntity<ApiResponse<UserResponse>> assignRole(@PathVariable UUID id, @PathVariable String roleName) {
        return ResponseEntity.ok(ApiResponse.ok(userService.assignRole(id, roleName), "Role assigned"));
    }

    @PostMapping("/{id}/roles/{roleName}/revoke")
    public ResponseEntity<ApiResponse<UserResponse>> revokeRole(@PathVariable UUID id, @PathVariable String roleName) {
        return ResponseEntity.ok(ApiResponse.ok(userService.revokeRole(id, roleName), "Role revoked"));
    }
}
