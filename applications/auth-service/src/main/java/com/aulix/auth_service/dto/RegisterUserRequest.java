package com.aulix.auth_service.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

import java.util.Set;

public record RegisterUserRequest(
        @NotBlank @Email String email,
        @NotBlank @Size(min = 8, max = 100, message = "password must be between 8 and 100 characters") String password,
        @NotBlank @Size(max = 100) String firstName,
        @NotBlank @Size(max = 100) String lastName,
        @NotEmpty(message = "at least one role must be assigned") Set<String> roles
) {
}
