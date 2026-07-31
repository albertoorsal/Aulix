package com.aulix.student_service.service;

import com.aulix.student_service.dto.CreateStudentRequest;
import com.aulix.student_service.dto.StudentResponse;

public interface StudentService {

    StudentResponse create(CreateStudentRequest request);

}
