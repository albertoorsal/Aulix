package com.aulix.teacher_service.controller;

import com.aulix.common_core.pagination.PageResponse;
import com.aulix.common_core.response.ApiResponse;
import com.aulix.security_starter.annotation.Roles;
import com.aulix.teacher_service.domain.EmploymentStatus;
import com.aulix.teacher_service.domain.TeacherType;
import com.aulix.teacher_service.dto.CreateTeacherRequest;
import com.aulix.teacher_service.dto.TeacherSearchCriteria;
import com.aulix.teacher_service.dto.TeacherResponse;
import com.aulix.teacher_service.dto.UpdateTeacherRequest;
import com.aulix.teacher_service.service.TeacherService;
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
@RequestMapping("/api/teachers")
@Tag(name = "Teacher", description = "Teacher record management")
public class TeacherController {

    private final TeacherService teacherService;

    public TeacherController(TeacherService teacherService) {
        this.teacherService = teacherService;
    }

    @PostMapping
    @PreAuthorize("hasRole('" + Roles.ADMIN + "')")
    @Operation(summary = "Hire a new Teacher")
    public ResponseEntity<ApiResponse<TeacherResponse>> create(@Valid @RequestBody CreateTeacherRequest request) {
        TeacherResponse response = teacherService.create(request);
        return ResponseEntity.status(
                HttpStatus.CREATED).body(ApiResponse.ok(response, "Teacher hired successfully")
        );
    }


    @GetMapping
    @PreAuthorize("hasAnyRole('" + Roles.ADMIN + "', '" + Roles.STAFF + "')")
    public ResponseEntity<ApiResponse<PageResponse<TeacherResponse>>> search(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) EmploymentStatus status,
            @RequestParam(required = false) TeacherType teacherType,
            @RequestParam(required = false) String department,
            Pageable pageable
    ) {
        TeacherSearchCriteria criteria = new TeacherSearchCriteria(search, status, teacherType, department);


        return ResponseEntity.ok(ApiResponse.ok(PageResponse.from(teacherService.search(criteria, pageable))));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('" + Roles.ADMIN + "', '" + Roles.STAFF + "', '" + Roles.TEACHER + "')")
    public ResponseEntity<ApiResponse<TeacherResponse>> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(teacherService.findById(id)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('" + Roles.ADMIN + "')")
    @Operation(summary = "Update a Teacher")
    public ResponseEntity<ApiResponse<TeacherResponse>> update(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateTeacherRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.ok(teacherService.update(id, request), "Teacher updated successfully"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('" + Roles.ADMIN + "')")
    @Operation(summary = "Remove a Teacher")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        teacherService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok(null, "Teacher record deleted"));
    }
}
