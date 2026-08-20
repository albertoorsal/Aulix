package com.aulix.teacher_service.client;

import java.util.Set;
import java.util.UUID;

public record UserResponse(
        UUID id,
        String email,
        String firstName,
        String lastName,
        boolean enabled,
        Set<String> roles
) {
}
