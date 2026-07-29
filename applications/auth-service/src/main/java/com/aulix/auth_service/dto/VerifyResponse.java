package com.aulix.auth_service.dto;

import java.time.Instant;
import java.util.Set;
import java.util.UUID;

public record VerifyResponse(
        UUID userId,
        String email,
        Set<String> roles,
        Set<String> permissions,
        Instant expiresAt
) {
}
