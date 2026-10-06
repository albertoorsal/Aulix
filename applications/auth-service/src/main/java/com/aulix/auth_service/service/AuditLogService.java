package com.aulix.auth_service.service;

import com.aulix.auth_service.domain.AuditAction;
import com.aulix.auth_service.domain.User;
import com.aulix.auth_service.dto.AuditLogResponse;
import com.aulix.auth_service.dto.AuditLogSearchCriteria;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AuditLogService {

    /** Records a change to {@code target} made by the currently authenticated user. */
    void record(AuditAction action, User target, String details);

    Page<AuditLogResponse> search(AuditLogSearchCriteria criteria, Pageable pageable);
}
