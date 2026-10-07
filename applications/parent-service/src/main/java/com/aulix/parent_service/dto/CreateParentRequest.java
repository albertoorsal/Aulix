package com.aulix.parent_service.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

// Name/email/password sizes match auth-service's RegisterUserRequest; phone matches V1.
public record CreateParentRequest(
        @NotBlank @Size(max = 100) String firstName,
        @NotBlank @Size(max = 100) String lastName,
        @NotBlank @Email @Size(max = 255) String email,
        @Size(max = 30) String phone,
        @NotBlank @Size(min = 8, max = 100, message = "password must be between 8 and 100 characters") String password
) {
}
