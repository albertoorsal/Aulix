package com.aulix.staff_service.controller;

import com.aulix.common_core.pagination.PageResponse;
import com.aulix.common_core.response.ApiResponse;
import com.aulix.security_starter.annotation.Roles;
import com.aulix.staff_service.domain.EmploymentStatus;
import com.aulix.staff_service.domain.StaffType;
import com.aulix.staff_service.dto.CreateStaffRequest;
import com.aulix.staff_service.dto.StaffSearchCriteria;
import com.aulix.staff_service.dto.StaffResponse;
import com.aulix.staff_service.dto.UpdateStaffRequest;
import com.aulix.staff_service.service.StaffService;
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
@RequestMapping("/api/staff")
@Tag(name = "Staff", description = "Staff record management")
public class StaffController {

    private final StaffService staffService;

    public StaffController(StaffService staffService) {
        this.staffService = staffService;
    }

    @PostMapping
    @PreAuthorize("hasRole('" + Roles.ADMIN + "')")
    @Operation(summary = "Hire a new Staff member")
    public ResponseEntity<ApiResponse<StaffResponse>> create(@Valid @RequestBody CreateStaffRequest request) {
        StaffResponse response = staffService.create(request);
        return ResponseEntity.status(
                HttpStatus.CREATED).body(ApiResponse.ok(response, "Staff member hired successfully")
        );
    }


    @GetMapping
    @PreAuthorize("hasAnyRole('" + Roles.ADMIN + "', '" + Roles.STAFF + "')")
    public ResponseEntity<ApiResponse<PageResponse<StaffResponse>>> search(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) EmploymentStatus status,
            @RequestParam(required = false) StaffType staffType,
            @RequestParam(required = false) String department,
            Pageable pageable
    ) {
        StaffSearchCriteria criteria = new StaffSearchCriteria(search, status, staffType, department);


        return ResponseEntity.ok(ApiResponse.ok(PageResponse.from(staffService.search(criteria, pageable))));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('" + Roles.ADMIN + "', '" + Roles.STAFF + "')")
    public ResponseEntity<ApiResponse<StaffResponse>> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(staffService.findById(id)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('" + Roles.ADMIN + "')")
    @Operation(summary = "Update a Staff member")
    public ResponseEntity<ApiResponse<StaffResponse>> update(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateStaffRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.ok(staffService.update(id, request), "Staff member updated successfully"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('" + Roles.ADMIN + "')")
    @Operation(summary = "Remove a Staff member")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        staffService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok(null, "Staff record deleted"));
    }
}
