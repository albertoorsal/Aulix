package com.aulix.subject_service.controller;

import com.aulix.common_core.pagination.PageResponse;
import com.aulix.common_core.response.ApiResponse;
import com.aulix.security_starter.annotation.Roles;
import com.aulix.subject_service.domain.SubjectStatus;
import com.aulix.subject_service.dto.CreateSubjectRequest;
import com.aulix.subject_service.dto.SubjectResponse;
import com.aulix.subject_service.dto.SubjectSearchCriteria;
import com.aulix.subject_service.dto.UpdateSubjectRequest;
import com.aulix.subject_service.service.SubjectService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/subjects")
@Tag(name = "Subject", description = "School subject catalog management")
public class SubjectController {

    private final SubjectService subjectService;

    public SubjectController(SubjectService subjectService) {
        this.subjectService = subjectService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('" + Roles.ADMIN + "', '" + Roles.STAFF + "')")
    @Operation(summary = "Create a new Subject")
    public ResponseEntity<ApiResponse<SubjectResponse>> create(@Valid @RequestBody CreateSubjectRequest request) {
        SubjectResponse response = subjectService.create(request);
        return ResponseEntity.status(
                HttpStatus.CREATED).body(ApiResponse.ok(response, "Subject created successfully")
        );
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('" + Roles.ADMIN + "', '" + Roles.STAFF + "', '" + Roles.TEACHER + "', '" + Roles.STUDENT + "')")
    public ResponseEntity<ApiResponse<PageResponse<SubjectResponse>>> search(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) SubjectStatus status,
            Pageable pageable
    ) {
        SubjectSearchCriteria criteria = new SubjectSearchCriteria(search, status);
        return ResponseEntity.ok(ApiResponse.ok(PageResponse.from(subjectService.search(criteria, pageable))));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('" + Roles.ADMIN + "', '" + Roles.STAFF + "', '" + Roles.TEACHER + "', '" + Roles.STUDENT + "')")
    public ResponseEntity<ApiResponse<SubjectResponse>> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(subjectService.findById(id)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('" + Roles.ADMIN + "', '" + Roles.STAFF + "')")
    @Operation(summary = "Update a Subject")
    public ResponseEntity<ApiResponse<SubjectResponse>> update(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateSubjectRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.ok(subjectService.update(id, request), "Subject updated successfully"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('" + Roles.ADMIN + "', '" + Roles.STAFF + "')")
    @Operation(summary = "Remove a Subject")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        subjectService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok(null, "Subject deleted"));
    }
}
