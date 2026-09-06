package com.aulix.subject_service.controller;

import com.aulix.common_core.response.ApiResponse;
import com.aulix.security_starter.annotation.Roles;
import com.aulix.subject_service.dto.StudentEnrollmentResponse;
import com.aulix.subject_service.dto.TeacherAssignmentResponse;
import com.aulix.subject_service.service.AssignmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/subjects/{subjectId}")
@Tag(name = "Subject Assignations", description = "Teacher-subject and student-subject assignations")
public class AssignmentController {

    private final AssignmentService assignmentService;

    public AssignmentController(AssignmentService assignmentService) {
        this.assignmentService = assignmentService;
    }

    @PostMapping("/teachers/{teacherId}")
    @PreAuthorize("hasAnyRole('" + Roles.ADMIN + "', '" + Roles.STAFF + "')")
    @Operation(summary = "Assign a Teacher to a Subject")
    public ResponseEntity<ApiResponse<TeacherAssignmentResponse>> assignTeacher(
            @PathVariable UUID subjectId, @PathVariable UUID teacherId
    ) {
        TeacherAssignmentResponse response = assignmentService.assignTeacher(subjectId, teacherId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(response, "Teacher assigned to subject"));
    }

    @DeleteMapping("/teachers/{teacherId}")
    @PreAuthorize("hasAnyRole('" + Roles.ADMIN + "', '" + Roles.STAFF + "')")
    @Operation(summary = "Remove a Teacher from a Subject")
    public ResponseEntity<ApiResponse<Void>> unassignTeacher(
            @PathVariable UUID subjectId, @PathVariable UUID teacherId
    ) {
        assignmentService.unassignTeacher(subjectId, teacherId);
        return ResponseEntity.ok(ApiResponse.ok(null, "Teacher unassigned from subject"));
    }

    @GetMapping("/teachers")
    @PreAuthorize("hasAnyRole('" + Roles.ADMIN + "', '" + Roles.STAFF + "', '" + Roles.TEACHER + "')")
    public ResponseEntity<ApiResponse<List<TeacherAssignmentResponse>>> listTeachers(@PathVariable UUID subjectId) {
        return ResponseEntity.ok(ApiResponse.ok(assignmentService.listTeachers(subjectId)));
    }

    @PostMapping("/students/{studentId}")
    @PreAuthorize("hasAnyRole('" + Roles.ADMIN + "', '" + Roles.STAFF + "')")
    @Operation(summary = "Enroll a Student in a Subject")
    public ResponseEntity<ApiResponse<StudentEnrollmentResponse>> enrollStudent(
            @PathVariable UUID subjectId, @PathVariable UUID studentId
    ) {
        StudentEnrollmentResponse response = assignmentService.enrollStudent(subjectId, studentId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(response, "Student enrolled in subject"));
    }

    @DeleteMapping("/students/{studentId}")
    @PreAuthorize("hasAnyRole('" + Roles.ADMIN + "', '" + Roles.STAFF + "')")
    @Operation(summary = "Remove a Student from a Subject")
    public ResponseEntity<ApiResponse<Void>> unenrollStudent(
            @PathVariable UUID subjectId, @PathVariable UUID studentId
    ) {
        assignmentService.unenrollStudent(subjectId, studentId);
        return ResponseEntity.ok(ApiResponse.ok(null, "Student unenrolled from subject"));
    }

    @GetMapping("/students")
    @PreAuthorize("hasAnyRole('" + Roles.ADMIN + "', '" + Roles.STAFF + "', '" + Roles.TEACHER + "')")
    public ResponseEntity<ApiResponse<List<StudentEnrollmentResponse>>> listStudents(@PathVariable UUID subjectId) {
        return ResponseEntity.ok(ApiResponse.ok(assignmentService.listStudents(subjectId)));
    }
}
