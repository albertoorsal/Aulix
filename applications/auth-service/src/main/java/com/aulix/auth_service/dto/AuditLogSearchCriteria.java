package com.aulix.auth_service.dto;

import com.aulix.auth_service.domain.AuditAction;

import java.util.UUID;

public record AuditLogSearchCriteria(
        UUID userId,
        String search,
        AuditAction action
) {
}
