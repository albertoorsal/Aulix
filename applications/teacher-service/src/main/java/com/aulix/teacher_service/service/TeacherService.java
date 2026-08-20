package com.aulix.teacher_service.service;

import com.aulix.teacher_service.dto.CreateTeacherRequest;
import com.aulix.teacher_service.dto.TeacherResponse;
import com.aulix.teacher_service.dto.TeacherSearchCriteria;
import com.aulix.teacher_service.dto.UpdateTeacherRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface TeacherService {

    TeacherResponse create(CreateTeacherRequest request);

    Page<TeacherResponse> search(TeacherSearchCriteria criteria, Pageable pageable);

    TeacherResponse findById(UUID id);

    TeacherResponse update(UUID id, UpdateTeacherRequest request);

    void delete(UUID id);
}
