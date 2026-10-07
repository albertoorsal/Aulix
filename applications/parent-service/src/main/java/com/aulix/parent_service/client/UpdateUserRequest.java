package com.aulix.parent_service.client;

// Body of auth-service's PUT /api/users/{id}.
public record UpdateUserRequest(
        String firstName,
        String lastName,
        String email
) {
}
