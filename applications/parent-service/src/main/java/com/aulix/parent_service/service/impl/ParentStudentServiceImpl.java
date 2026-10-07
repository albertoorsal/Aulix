package com.aulix.parent_service.service.impl;

import com.aulix.common_core.exception.ResourceNotFoundException;
import com.aulix.parent_service.client.StudentClient;
import com.aulix.parent_service.domain.Parent;
import com.aulix.parent_service.domain.ParentStudent;
import com.aulix.parent_service.dto.LinkStudentRequest;
import com.aulix.parent_service.dto.ParentStudentResponse;
import com.aulix.parent_service.dto.StudentSummary;
import com.aulix.parent_service.exception.DuplicateLinkException;
import com.aulix.parent_service.exception.RemoteServiceException;
import com.aulix.parent_service.mapper.ParentMapper;
import com.aulix.parent_service.repository.ParentRepository;
import com.aulix.parent_service.repository.ParentStudentRepository;
import com.aulix.parent_service.service.ParentStudentService;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
public class ParentStudentServiceImpl implements ParentStudentService {

    private final ParentRepository parentRepository;
    private final ParentStudentRepository parentStudentRepository;
    private final StudentClient studentClient;
    private final ParentMapper parentMapper;

    public ParentStudentServiceImpl(
            ParentRepository parentRepository,
            ParentStudentRepository parentStudentRepository,
            StudentClient studentClient,
            ParentMapper parentMapper
    ) {
        this.parentRepository = parentRepository;
        this.parentStudentRepository = parentStudentRepository;
        this.studentClient = studentClient;
        this.parentMapper = parentMapper;
    }

    @Override
    @Transactional
    public ParentStudentResponse link(UUID parentId, UUID studentId, LinkStudentRequest request) {
        getParentOrThrow(parentId);

        StudentSummary student = studentClient.findById(studentId)
                .orElseThrow(() -> ResourceNotFoundException.of("Student", studentId));
        if (parentStudentRepository.existsByParentIdAndStudentId(parentId, studentId)) {
            throw new DuplicateLinkException(
                    "Student '%s' is already linked to parent '%s'".formatted(studentId, parentId));
        }

        if (request.primaryContact()) {
            clearPrimaryContact(studentId);
        }
        ParentStudent saved = parentStudentRepository.save(
                new ParentStudent(parentId, studentId, request.relationship(), request.primaryContact()));
        return parentMapper.toResponse(saved).withStudent(student);
    }

    @Override
    @Transactional
    public ParentStudentResponse updateLink(UUID parentId, UUID studentId, LinkStudentRequest request) {
        ParentStudent link = getLinkOrThrow(parentId, studentId);

        if (request.primaryContact() && !link.isPrimaryContact()) {
            clearPrimaryContact(studentId);
        }
        link.setRelationship(request.relationship());
        link.setPrimaryContact(request.primaryContact());

        ParentStudent saved = parentStudentRepository.save(link);
        return withStudentDetails(parentMapper.toResponse(saved));
    }

    @Override
    @Transactional
    public void unlink(UUID parentId, UUID studentId) {
        parentStudentRepository.delete(getLinkOrThrow(parentId, studentId));
    }

    @Override
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public List<ParentStudentResponse> listForParent(UUID parentId) {
        getParentOrThrow(parentId);
        return withStudentDetails(parentStudentRepository.findByParentId(parentId));
    }

    @Override
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public List<ParentStudentResponse> listForUser(UUID userId) {
        return parentRepository.findByUserId(userId)
                .map(parent -> withStudentDetails(parentStudentRepository.findByParentId(parent.getId())))
                .orElse(List.of());
    }

    @Override
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public ParentStudentResponse findLinkForUser(UUID userId, UUID studentId) {
        // Deliberately no student lookup here: student-service calls this endpoint while
        // answering a parent's request, so loading the student would call straight back into it.
        return parentRepository.findByUserId(userId)
                .flatMap(parent -> parentStudentRepository.findByParentIdAndStudentId(parent.getId(), studentId))
                .map(parentMapper::toResponse)
                .orElseThrow(() -> ResourceNotFoundException.of("Linked student", studentId));
    }

    /** A student has at most one primary contact, so promoting one parent demotes the others. */
    private void clearPrimaryContact(UUID studentId) {
        List<ParentStudent> current = parentStudentRepository.findByStudentIdAndPrimaryContactTrue(studentId);
        current.forEach(link -> link.setPrimaryContact(false));
        parentStudentRepository.saveAll(current);
    }

    private List<ParentStudentResponse> withStudentDetails(List<ParentStudent> links) {
        return links.stream()
                .map(parentMapper::toResponse)
                .map(this::withStudentDetails)
                .sorted(Comparator.comparing(ParentStudentServiceImpl::sortName))
                .toList();
    }

    // One lookup per child: a parent only has a handful. A child that can't be loaded (deleted
    // since linking, or student-service down) is still listed so it can be unlinked.
    private ParentStudentResponse withStudentDetails(ParentStudentResponse link) {
        try {
            return studentClient.findById(link.studentId()).map(link::withStudent).orElse(link);
        } catch (RemoteServiceException ex) {
            return link;
        }
    }

    private static String sortName(ParentStudentResponse link) {
        StudentSummary student = link.student();
        // Unresolved children go last.
        if (student == null || student.firstName() == null) {
            return "￿";
        }
        return "%s %s".formatted(student.firstName(), student.lastName());
    }

    private Parent getParentOrThrow(UUID parentId) {
        return parentRepository.findById(parentId)
                .orElseThrow(() -> ResourceNotFoundException.of("Parent", parentId));
    }

    private ParentStudent getLinkOrThrow(UUID parentId, UUID studentId) {
        return parentStudentRepository.findByParentIdAndStudentId(parentId, studentId)
                .orElseThrow(() -> ResourceNotFoundException.of("Parent-student link", studentId));
    }
}
