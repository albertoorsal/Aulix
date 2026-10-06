package com.aulix.auth_service.dto;

public record UserSearchCriteria(
        String search,
        String role,
        Boolean enabled
) {
}
