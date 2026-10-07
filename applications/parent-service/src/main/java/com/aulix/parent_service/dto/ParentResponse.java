package com.aulix.parent_service.dto;

import java.util.UUID;

public record ParentResponse(
        UUID id,
        UUID userId,
        String phone,
        long childCount,
        String firstName,
        String lastName,
        String email
) {
    public ParentResponse withUser(String firstName, String lastName, String email) {
        return new ParentResponse(id, userId, phone, childCount, firstName, lastName, email);
    }

    public ParentResponse withChildCount(long childCount) {
        return new ParentResponse(id, userId, phone, childCount, firstName, lastName, email);
    }
}
