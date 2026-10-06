package com.aulix.auth_service.service.impl;

import com.aulix.auth_service.domain.AuditAction;
import com.aulix.auth_service.domain.AuditLog;
import com.aulix.auth_service.domain.User;
import com.aulix.auth_service.dto.AuditLogResponse;
import com.aulix.auth_service.dto.AuditLogSearchCriteria;
import com.aulix.auth_service.mapper.AuditLogMapper;
import com.aulix.auth_service.repository.AuditLogRepository;
import com.aulix.auth_service.repository.AuditLogSpecifications;
import com.aulix.auth_service.service.AuditLogService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class AuditLogServiceImpl implements AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final AuditLogMapper auditLogMapper;

    public AuditLogServiceImpl(AuditLogRepository auditLogRepository, AuditLogMapper auditLogMapper) {
        this.auditLogRepository = auditLogRepository;
        this.auditLogMapper = auditLogMapper;
    }

    @Override
    @Transactional
    public void record(AuditAction action, User target, String details) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        // Access tokens carry the user id as `sub` and the email as the principal name.
        UUID actorId = authentication != null && authentication.getPrincipal() instanceof Jwt jwt
                ? parseUuid(jwt.getSubject())
                : null;
        String actorEmail = authentication != null ? authentication.getName() : null;

        auditLogRepository.save(new AuditLog(
                action, actorId, actorEmail, target.getId(), target.getEmail(), details));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AuditLogResponse> search(AuditLogSearchCriteria criteria, Pageable pageable) {
        Specification<AuditLog> spec = Specification.allOf(
                AuditLogSpecifications.hasTargetUser(criteria.userId()),
                AuditLogSpecifications.hasAction(criteria.action()),
                AuditLogSpecifications.matchesEmail(criteria.search()));
        return auditLogRepository.findAll(spec, pageable).map(auditLogMapper::toResponse);
    }

    private static UUID parseUuid(String value) {
        try {
            return value == null ? null : UUID.fromString(value);
        } catch (IllegalArgumentException e) {
            return null;
        }
    }
}
