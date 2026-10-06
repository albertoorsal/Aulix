package com.aulix.auth_service.dto;

import com.aulix.auth_service.domain.AuditAction;

import java.time.Instant;
import java.util.UUID;

public record AuditLogResponse(
        UUID id,
        AuditAction action,
        UUID actorId,
        String actorEmail,
        UUID targetUserId,
        String targetEmail,
        String details,
        Instant createdAt
) {
}
