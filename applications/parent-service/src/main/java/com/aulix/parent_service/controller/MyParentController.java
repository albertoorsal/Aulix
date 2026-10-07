package com.aulix.parent_service.controller;

import com.aulix.common_core.response.ApiResponse;
import com.aulix.parent_service.dto.CurrentUser;
import com.aulix.parent_service.dto.ParentResponse;
import com.aulix.parent_service.dto.ParentStudentResponse;
import com.aulix.parent_service.service.ParentService;
import com.aulix.parent_service.service.ParentStudentService;
import com.aulix.security_starter.annotation.Roles;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

/**
 * Self-service endpoints for the signed-in parent. The parent is always resolved from the
 * token's subject, never from a path or body id, so a PARENT can only ever see their own
 * children (ADR 0001 §3).
 */
@RestController
@RequestMapping("/api/parents/me")
@Tag(name = "My children", description = "The signed-in parent's profile and linked children")
@PreAuthorize("hasRole('" + Roles.PARENT + "')")
public class MyParentController {

    private final ParentService parentService;
    private final ParentStudentService parentStudentService;

    public MyParentController(ParentService parentService, ParentStudentService parentStudentService) {
        this.parentService = parentService;
        this.parentStudentService = parentStudentService;
    }

    @GetMapping
    @Operation(summary = "The signed-in parent's profile")
    public ResponseEntity<ApiResponse<ParentResponse>> me(@AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(ApiResponse.ok(parentService.findMine(CurrentUser.from(jwt))));
    }

    @GetMapping("/students")
    @Operation(summary = "The signed-in parent's children, with their student details")
    public ResponseEntity<ApiResponse<List<ParentStudentResponse>>> myStudents(@AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(ApiResponse.ok(parentStudentService.listForUser(CurrentUser.from(jwt).userId())));
    }

    @GetMapping("/students/{studentId}")
    @Operation(summary = "Whether a student is linked to the signed-in parent (404 when not)",
            description = "Used by student-service and subject-service to authorize PARENT reads.")
    public ResponseEntity<ApiResponse<ParentStudentResponse>> myStudentLink(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID studentId
    ) {
        return ResponseEntity.ok(ApiResponse.ok(
                parentStudentService.findLinkForUser(CurrentUser.from(jwt).userId(), studentId)));
    }
}
