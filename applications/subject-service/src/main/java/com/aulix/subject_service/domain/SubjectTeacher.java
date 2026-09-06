package com.aulix.subject_service.domain;

import com.aulix.common_core.domain.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import java.util.UUID;

@Entity
@Table(name = "subject_teacher", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"subject_id", "teacher_id"})
})
public class SubjectTeacher extends BaseEntity {

    @Column(name = "subject_id", nullable = false)
    private UUID subjectId;

    @Column(name = "teacher_id", nullable = false)
    private UUID teacherId;

    protected SubjectTeacher() {}

    public SubjectTeacher(UUID subjectId, UUID teacherId) {
        this.subjectId = subjectId;
        this.teacherId = teacherId;
    }

    public UUID getSubjectId() {
        return subjectId;
    }

    public UUID getTeacherId() {
        return teacherId;
    }
}
