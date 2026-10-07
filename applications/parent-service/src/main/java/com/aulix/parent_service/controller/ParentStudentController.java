package com.aulix.parent_service.controller;

import com.aulix.common_core.response.ApiResponse;
import com.aulix.parent_service.dto.LinkStudentRequest;
import com.aulix.parent_service.dto.ParentStudentResponse;
import com.aulix.parent_service.service.ParentStudentService;
import com.aulix.security_starter.annotation.Roles;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/parents/{parentId}/students")
@Tag(name = "Parent-Student links", description = "Links between parents and the students they are responsible for")
@PreAuthorize("hasAnyRole('" + Roles.ADMIN + "', '" + Roles.STAFF + "')")
public class ParentStudentController {

    private final ParentStudentService parentStudentService;

    public ParentStudentController(ParentStudentService parentStudentService) {
        this.parentStudentService = parentStudentService;
    }

    @GetMapping
    @Operation(summary = "List the students linked to a Parent")
    public ResponseEntity<ApiResponse<List<ParentStudentResponse>>> list(@PathVariable UUID parentId) {
        return ResponseEntity.ok(ApiResponse.ok(parentStudentService.listForParent(parentId)));
    }

    @PostMapping("/{studentId}")
    @Operation(summary = "Link a Student to a Parent")
    public ResponseEntity<ApiResponse<ParentStudentResponse>> link(
            @PathVariable UUID parentId,
            @PathVariable UUID studentId,
            @Valid @RequestBody LinkStudentRequest request
    ) {
        ParentStudentResponse response = parentStudentService.link(parentId, studentId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(response, "Student linked to parent"));
    }

    @PutMapping("/{studentId}")
    @Operation(summary = "Change the relationship or primary contact of a link")
    public ResponseEntity<ApiResponse<ParentStudentResponse>> updateLink(
            @PathVariable UUID parentId,
            @PathVariable UUID studentId,
            @Valid @RequestBody LinkStudentRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.ok(
                parentStudentService.updateLink(parentId, studentId, request), "Link updated"));
    }

    @DeleteMapping("/{studentId}")
    @Operation(summary = "Unlink a Student from a Parent")
    public ResponseEntity<ApiResponse<Void>> unlink(@PathVariable UUID parentId, @PathVariable UUID studentId) {
        parentStudentService.unlink(parentId, studentId);
        return ResponseEntity.ok(ApiResponse.ok(null, "Student unlinked from parent"));
    }
}
