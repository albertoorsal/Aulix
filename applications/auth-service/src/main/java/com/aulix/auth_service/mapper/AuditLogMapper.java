package com.aulix.auth_service.mapper;

import com.aulix.auth_service.domain.AuditLog;
import com.aulix.auth_service.dto.AuditLogResponse;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface AuditLogMapper {

    default AuditLogResponse toResponse(AuditLog log) {
        return new AuditLogResponse(
                log.getId(),
                log.getAction(),
                log.getActorId(),
                log.getActorEmail(),
                log.getTargetUserId(),
                log.getTargetEmail(),
                log.getDetails(),
                log.getCreatedAt()
        );
    }
}
