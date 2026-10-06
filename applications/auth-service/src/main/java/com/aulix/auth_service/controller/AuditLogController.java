package com.aulix.auth_service.controller;

import com.aulix.auth_service.domain.AuditAction;
import com.aulix.auth_service.dto.AuditLogResponse;
import com.aulix.auth_service.dto.AuditLogSearchCriteria;
import com.aulix.auth_service.service.AuditLogService;
import com.aulix.common_core.pagination.PageResponse;
import com.aulix.common_core.response.ApiResponse;
import com.aulix.security_starter.annotation.Roles;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

// Lives under /api/users so it reuses the gateway's existing user-service route and breaker.
@RestController
@RequestMapping("/api/users/audit-logs")
@Tag(name = "Audit Log", description = "History of administrative changes to user accounts")
public class AuditLogController {

    private final AuditLogService auditLogService;

    public AuditLogController(AuditLogService auditLogService) {
        this.auditLogService = auditLogService;
    }

    @GetMapping
    @PreAuthorize("hasRole('" + Roles.ADMIN + "')")
    @Operation(summary = "Search the audit log, newest first by default")
    public ResponseEntity<ApiResponse<PageResponse<AuditLogResponse>>> search(
            @RequestParam(required = false) UUID userId,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) AuditAction action,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        AuditLogSearchCriteria criteria = new AuditLogSearchCriteria(userId, search, action);
        return ResponseEntity.ok(ApiResponse.ok(PageResponse.from(auditLogService.search(criteria, pageable))));
    }
}
