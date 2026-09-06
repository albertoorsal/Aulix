package com.aulix.subject_service.service;

import com.aulix.subject_service.dto.CreateSubjectRequest;
import com.aulix.subject_service.dto.SubjectResponse;
import com.aulix.subject_service.dto.SubjectSearchCriteria;
import com.aulix.subject_service.dto.UpdateSubjectRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface SubjectService {

    SubjectResponse create(CreateSubjectRequest request);

    Page<SubjectResponse> search(SubjectSearchCriteria criteria, Pageable pageable);

    SubjectResponse findById(UUID id);

    SubjectResponse update(UUID id, UpdateSubjectRequest request);

    void delete(UUID id);
}
