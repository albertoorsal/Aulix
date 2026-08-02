package com.aulix.student_service.controller;

import com.aulix.common_core.pagination.PageResponse;
import com.aulix.common_core.response.ApiResponse;
import com.aulix.security_starter.annotation.Roles;
import com.aulix.student_service.domain.EnrollmentStatus;
import com.aulix.student_service.dto.CreateStudentRequest;
import com.aulix.student_service.dto.StudentSearchCriteria;
import com.aulix.student_service.dto.StudentResponse;
import com.aulix.student_service.service.StudentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/students")
@Tag(name = "Students", description = "Student record management")
public class StudentController {

    private final StudentService studentService;

    public StudentController(StudentService studentService) {
        this.studentService = studentService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('" + Roles.ADMIN + "', '" + Roles.STAFF + "')")
    @Operation(summary = "Enroll a new Student")
    public ResponseEntity<ApiResponse<StudentResponse>> create(@Valid @RequestBody CreateStudentRequest request) {
        StudentResponse response = studentService.create(request);
        return ResponseEntity.status(
                HttpStatus.CREATED).body(ApiResponse.ok(response, "Student enrolled successfully")
        );
    }


    @GetMapping
    @PreAuthorize("hasAnyRole('" + Roles.ADMIN + "', '" + Roles.STAFF + "', '" + Roles.TEACHER + "')")
    public ResponseEntity<ApiResponse<PageResponse<StudentResponse>>> search(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) EnrollmentStatus status,
            @RequestParam(required = false) Integer gradeLevel,
            Pageable pageable
    ) {
        StudentSearchCriteria criteria = new StudentSearchCriteria(search,status,gradeLevel);


        return ResponseEntity.ok(ApiResponse.ok(PageResponse.from(studentService.search(criteria, pageable))));
    }
}
