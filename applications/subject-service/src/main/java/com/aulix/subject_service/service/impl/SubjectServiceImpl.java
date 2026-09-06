package com.aulix.subject_service.service.impl;

import com.aulix.common_core.exception.ResourceNotFoundException;
import com.aulix.subject_service.domain.Subject;
import com.aulix.subject_service.dto.CreateSubjectRequest;
import com.aulix.subject_service.dto.SubjectResponse;
import com.aulix.subject_service.dto.SubjectSearchCriteria;
import com.aulix.subject_service.dto.UpdateSubjectRequest;
import com.aulix.subject_service.exception.DuplicateSubjectException;
import com.aulix.subject_service.mapper.SubjectMapper;
import com.aulix.subject_service.repository.SubjectRepository;
import com.aulix.subject_service.repository.SubjectSpecifications;
import com.aulix.subject_service.service.SubjectService;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class SubjectServiceImpl implements SubjectService {

    private final SubjectRepository subjectRepository;
    private final SubjectMapper subjectMapper;

    public SubjectServiceImpl(SubjectRepository subjectRepository, SubjectMapper subjectMapper) {
        this.subjectRepository = subjectRepository;
        this.subjectMapper = subjectMapper;
    }

    @Override
    @Transactional
    public SubjectResponse create(CreateSubjectRequest request) {
        if (subjectRepository.existsByCodeIgnoreCase(request.code())) {
            throw new DuplicateSubjectException("code", request.code());
        }

        Subject subject = new Subject(request.code(), request.name(), request.description(), request.creditHours());
        Subject saved = subjectRepository.save(subject);

        return subjectMapper.toResponse(saved);
    }

    @Override
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public Page<SubjectResponse> search(SubjectSearchCriteria criteria, Pageable pageable) {
        Specification<Subject> spec = Specification.allOf(
                SubjectSpecifications.matchesSearch(criteria.search()),
                SubjectSpecifications.hasStatus(criteria.status()));

        return subjectRepository.findAll(spec, pageable).map(subjectMapper::toResponse);
    }

    @Override
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public SubjectResponse findById(UUID id) {
        return subjectMapper.toResponse(getSubjectOrThrow(id));
    }

    @Override
    @Transactional
    public SubjectResponse update(UUID id, UpdateSubjectRequest request) {
        Subject subject = getSubjectOrThrow(id);

        subject.setName(request.name());
        subject.setDescription(request.description());
        subject.setCreditHours(request.creditHours());
        subject.setStatus(request.status());

        Subject saved = subjectRepository.save(subject);
        return subjectMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public void delete(UUID id) {
        Subject subject = getSubjectOrThrow(id);
        subjectRepository.delete(subject);
    }

    private Subject getSubjectOrThrow(UUID id) {
        return subjectRepository.findById(id).orElseThrow(() -> ResourceNotFoundException.of("Subject", id));
    }
}
