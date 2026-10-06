package com.aulix.auth_service.domain;

import com.aulix.common_core.domain.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;

import java.util.UUID;

/**
 * Append-only record of an administrative change to a user account. The target's email is
 * copied in so the entry stays readable after the user is deleted.
 */
@Entity
@Table(name = "audit_log")
public class AuditLog extends BaseEntity {

    @Enumerated(EnumType.STRING)
    @Column(name = "action", nullable = false, length = 50)
    private AuditAction action;

    @Column(name = "actor_id")
    private UUID actorId;

    @Column(name = "actor_email", length = 255)
    private String actorEmail;

    @Column(name = "target_user_id", nullable = false)
    private UUID targetUserId;

    @Column(name = "target_email", nullable = false, length = 255)
    private String targetEmail;

    @Column(name = "details", length = 255)
    private String details;

    protected AuditLog() {
    }

    public AuditLog(AuditAction action, UUID actorId, String actorEmail,
                    UUID targetUserId, String targetEmail, String details) {
        this.action = action;
        this.actorId = actorId;
        this.actorEmail = actorEmail;
        this.targetUserId = targetUserId;
        this.targetEmail = targetEmail;
        this.details = details;
    }

    public AuditAction getAction() {
        return action;
    }

    public UUID getActorId() {
        return actorId;
    }

    public String getActorEmail() {
        return actorEmail;
    }

    public UUID getTargetUserId() {
        return targetUserId;
    }

    public String getTargetEmail() {
        return targetEmail;
    }

    public String getDetails() {
        return details;
    }
}
