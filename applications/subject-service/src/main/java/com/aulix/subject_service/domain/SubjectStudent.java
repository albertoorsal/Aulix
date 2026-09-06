package com.aulix.subject_service.domain;

import com.aulix.common_core.domain.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import java.util.UUID;

@Entity
@Table(name = "subject_student", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"subject_id", "student_id"})
})
public class SubjectStudent extends BaseEntity {

    @Column(name = "subject_id", nullable = false)
    private UUID subjectId;

    @Column(name = "student_id", nullable = false)
    private UUID studentId;

    protected SubjectStudent() {}

    public SubjectStudent(UUID subjectId, UUID studentId) {
        this.subjectId = subjectId;
        this.studentId = studentId;
    }

    public UUID getSubjectId() {
        return subjectId;
    }

    public UUID getStudentId() {
        return studentId;
    }
}
