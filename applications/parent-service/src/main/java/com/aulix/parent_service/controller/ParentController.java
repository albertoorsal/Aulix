package com.aulix.parent_service.controller;

import com.aulix.common_core.pagination.PageResponse;
import com.aulix.common_core.response.ApiResponse;
import com.aulix.parent_service.dto.CreateParentRequest;
import com.aulix.parent_service.dto.ParentResponse;
import com.aulix.parent_service.dto.ParentSearchCriteria;
import com.aulix.parent_service.dto.UpdateParentRequest;
import com.aulix.parent_service.service.ParentService;
import com.aulix.security_starter.annotation.Roles;
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
@RequestMapping("/api/parents")
@Tag(name = "Parents", description = "Parent/guardian record management")
public class ParentController {

    private final ParentService parentService;

    public ParentController(ParentService parentService) {
        this.parentService = parentService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('" + Roles.ADMIN + "', '" + Roles.STAFF + "')")
    @Operation(summary = "Register a Parent and create their login account")
    public ResponseEntity<ApiResponse<ParentResponse>> create(@Valid @RequestBody CreateParentRequest request) {
        ParentResponse response = parentService.create(request);
        return ResponseEntity.status(
                HttpStatus.CREATED).body(ApiResponse.ok(response, "Parent registered successfully")
        );
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('" + Roles.ADMIN + "', '" + Roles.STAFF + "')")
    public ResponseEntity<ApiResponse<PageResponse<ParentResponse>>> search(
            @RequestParam(required = false) String search,
            Pageable pageable
    ) {
        ParentSearchCriteria criteria = new ParentSearchCriteria(search);
        return ResponseEntity.ok(ApiResponse.ok(PageResponse.from(parentService.search(criteria, pageable))));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('" + Roles.ADMIN + "', '" + Roles.STAFF + "')")
    public ResponseEntity<ApiResponse<ParentResponse>> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(parentService.findById(id)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('" + Roles.ADMIN + "', '" + Roles.STAFF + "')")
    @Operation(summary = "Update a Parent")
    public ResponseEntity<ApiResponse<ParentResponse>> update(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateParentRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.ok(parentService.update(id, request), "Parent updated successfully"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('" + Roles.ADMIN + "', '" + Roles.STAFF + "')")
    @Operation(summary = "Remove a Parent, their student links and their login account")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        parentService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok(null, "Parent record deleted"));
    }
}
