package com.aulix.auth_service.repository;

import com.aulix.auth_service.domain.AuditAction;
import com.aulix.auth_service.domain.AuditLog;
import org.springframework.data.jpa.domain.Specification;

import java.util.Locale;
import java.util.UUID;

public class AuditLogSpecifications {
    private AuditLogSpecifications() {}

    public static Specification<AuditLog> hasTargetUser(UUID userId) {
        return (root, query, cb)
                -> userId == null ? null : cb.equal(root.get("targetUserId"), userId);
    }

    public static Specification<AuditLog> hasAction(AuditAction action) {
        return (root, query, cb)
                -> action == null ? null : cb.equal(root.get("action"), action);
    }

    /** Matches the email of either the user who made the change or the user it was made to. */
    public static Specification<AuditLog> matchesEmail(String search) {
        return (root, query, cb) -> {
            if (search == null || search.isBlank()) {
                return null;
            }
            String pattern = "%" + search.trim().toLowerCase(Locale.ROOT) + "%";
            return cb.or(
                    cb.like(cb.lower(root.get("actorEmail")), pattern),
                    cb.like(cb.lower(root.get("targetEmail")), pattern)
            );
        };
    }
}
