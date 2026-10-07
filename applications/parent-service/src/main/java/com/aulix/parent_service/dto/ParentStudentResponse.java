package com.aulix.parent_service.dto;

import com.aulix.parent_service.domain.Relationship;

import java.util.UUID;

/**
 * A parent-student link. {@code student} is null when the student record could not be loaded
 * (deleted since it was linked, or student-service unavailable).
 */
public record ParentStudentResponse(
        UUID id,
        UUID parentId,
        UUID studentId,
        Relationship relationship,
        boolean primaryContact,
        StudentSummary student
) {
    public ParentStudentResponse withStudent(StudentSummary student) {
        return new ParentStudentResponse(id, parentId, studentId, relationship, primaryContact, student);
    }
}
