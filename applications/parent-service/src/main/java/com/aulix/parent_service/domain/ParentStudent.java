package com.aulix.parent_service.domain;

import com.aulix.common_core.domain.BaseEntity;
import jakarta.persistence.*;

import java.util.UUID;

@Entity
@Table(name = "parent_student", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"parent_id", "student_id"})
})
public class ParentStudent extends BaseEntity {

    @Column(name = "parent_id", nullable = false)
    private UUID parentId;

    @Column(name = "student_id", nullable = false)
    private UUID studentId;

    @Enumerated(EnumType.STRING)
    @Column(name = "relationship", nullable = false, length = 20)
    private Relationship relationship;

    @Column(name = "primary_contact", nullable = false)
    private boolean primaryContact;

    protected ParentStudent() {}

    public ParentStudent(UUID parentId, UUID studentId, Relationship relationship, boolean primaryContact) {
        this.parentId = parentId;
        this.studentId = studentId;
        this.relationship = relationship;
        this.primaryContact = primaryContact;
    }

    public UUID getParentId() {
        return parentId;
    }

    public UUID getStudentId() {
        return studentId;
    }

    public Relationship getRelationship() {
        return relationship;
    }

    public boolean isPrimaryContact() {
        return primaryContact;
    }

    public void setRelationship(Relationship relationship) {
        this.relationship = relationship;
    }

    public void setPrimaryContact(boolean primaryContact) {
        this.primaryContact = primaryContact;
    }
}
