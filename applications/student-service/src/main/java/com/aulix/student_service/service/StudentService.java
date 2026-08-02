package com.aulix.student_service.service;

import com.aulix.student_service.dto.CreateStudentRequest;
import com.aulix.student_service.dto.StudentResponse;
import com.aulix.student_service.dto.StudentSearchCriteria;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface StudentService {

    StudentResponse create(CreateStudentRequest request);

    Page<StudentResponse> search(StudentSearchCriteria criteria, Pageable pageable);
}
