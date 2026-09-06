package com.aulix.subject_service.domain;


import com.aulix.common_core.domain.BaseEntity;
import jakarta.persistence.*;

@Entity
@Table(name = "subject", uniqueConstraints = {
        @UniqueConstraint(columnNames = "code")
})
public class Subject extends BaseEntity {

    @Column(name = "code", nullable = false, length = 20)
    private String code;

    @Column(name = "name", nullable = false, length = 150)
    private String name;

    @Column(name = "description", length = 1000)
    private String description;

    @Column(name = "credit_hours", nullable = false)
    private int creditHours;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private SubjectStatus status;

    protected Subject() {}

    public Subject(String code, String name, String description, int creditHours) {
        this.code = code;
        this.name = name;
        this.description = description;
        this.creditHours = creditHours;
        this.status = SubjectStatus.ACTIVE;
    }

    public String getCode() {
        return code;
    }

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public int getCreditHours() {
        return creditHours;
    }

    public SubjectStatus getStatus() {
        return status;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setCreditHours(int creditHours) {
        this.creditHours = creditHours;
    }

    public void setStatus(SubjectStatus status) {
        this.status = status;
    }
}
