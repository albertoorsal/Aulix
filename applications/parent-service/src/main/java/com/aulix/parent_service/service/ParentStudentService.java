package com.aulix.parent_service.service;

import com.aulix.parent_service.dto.LinkStudentRequest;
import com.aulix.parent_service.dto.ParentStudentResponse;

import java.util.List;
import java.util.UUID;

public interface ParentStudentService {

    ParentStudentResponse link(UUID parentId, UUID studentId, LinkStudentRequest request);

    ParentStudentResponse updateLink(UUID parentId, UUID studentId, LinkStudentRequest request);

    void unlink(UUID parentId, UUID studentId);

    List<ParentStudentResponse> listForParent(UUID parentId);

    /** The children linked to the parent profile of {@code userId}; empty if there is no profile. */
    List<ParentStudentResponse> listForUser(UUID userId);

    /**
     * The link between the parent profile of {@code userId} and {@code studentId}, without
     * student details. Throws {@code ResourceNotFoundException} when they aren't linked. Other
     * services call this (with the parent's token) to decide whether a PARENT may read a student.
     */
    ParentStudentResponse findLinkForUser(UUID userId, UUID studentId);
}
