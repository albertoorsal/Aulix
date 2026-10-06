package com.aulix.auth_service.service.impl;

import com.aulix.auth_service.domain.AuditAction;
import com.aulix.auth_service.domain.AuditLog;
import com.aulix.auth_service.domain.User;
import com.aulix.auth_service.mapper.AuditLogMapper;
import com.aulix.auth_service.repository.AuditLogRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class AuditLogServiceImplTest {

    @Mock
    private AuditLogRepository auditLogRepository;

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void recordCapturesActorFromAccessToken() {
        UUID actorId = UUID.randomUUID();
        Jwt jwt = Jwt.withTokenValue("token")
                .header("alg", "RS256")
                .subject(actorId.toString())
                .claim("preferred_username", "admin@aulix.com")
                .build();
        SecurityContextHolder.getContext().setAuthentication(
                new JwtAuthenticationToken(jwt, List.of(), "admin@aulix.com"));

        User target = new User("jane@aulix.com", "hash", "Jane", "Doe");
        target.setId(UUID.randomUUID());

        new AuditLogServiceImpl(auditLogRepository, new AuditLogMapper() {})
                .record(AuditAction.ROLE_ASSIGNED, target, "TEACHER");

        ArgumentCaptor<AuditLog> saved = ArgumentCaptor.forClass(AuditLog.class);
        verify(auditLogRepository).save(saved.capture());
        AuditLog log = saved.getValue();
        assertThat(log.getAction()).isEqualTo(AuditAction.ROLE_ASSIGNED);
        assertThat(log.getActorId()).isEqualTo(actorId);
        assertThat(log.getActorEmail()).isEqualTo("admin@aulix.com");
        assertThat(log.getTargetUserId()).isEqualTo(target.getId());
        assertThat(log.getTargetEmail()).isEqualTo("jane@aulix.com");
        assertThat(log.getDetails()).isEqualTo("TEACHER");
    }
}
