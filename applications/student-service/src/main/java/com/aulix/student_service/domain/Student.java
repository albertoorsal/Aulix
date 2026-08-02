package com.aulix.student_service.domain;

import com.aulix.common_core.domain.BaseEntity;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "students", uniqueConstraints = {
        @UniqueConstraint(columnNames = "student_number"),
        @UniqueConstraint(columnNames = "user_id")
})
public class Student extends BaseEntity {
    @Column(name="user_id", nullable = false)
    private UUID userId;

    @Column(name = "student_number", nullable = false, length = 20)
    private String studentNumber;


    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Enumerated(EnumType.STRING)
    @Column(name = "enrollment_status", nullable = false, length = 20)
    private EnrollmentStatus enrollmentStatus;

    @Column(name = "enrollment_date", nullable = false)
    private LocalDate enrollmentDate;

    @Column(name = "grade_level", nullable = false)
    private int gradeLevel;

    @Column(name = "curp", nullable = false, length = 18)
    private String curp;

    protected Student() {}

    public Student(UUID userId, String studentNumber,LocalDate dateOfBirth, LocalDate enrollmentDate, int gradeLevel, String curp) {
        this.userId = userId;
        this.studentNumber = studentNumber;
        this.dateOfBirth = dateOfBirth;
        this.enrollmentDate = enrollmentDate;
        this.gradeLevel = gradeLevel;
        this.curp = curp;
        this.enrollmentStatus = EnrollmentStatus.ENROLLED;
    }

    public UUID getUserId() {
        return userId;
    }

    public String getStudentNumber() {
        return studentNumber;
    }


    public LocalDate getDateOfBirth() {
        return dateOfBirth;
    }

    public EnrollmentStatus getEnrollmentStatus() {
        return enrollmentStatus;
    }

    public LocalDate getEnrollmentDate() {
        return enrollmentDate;
    }

    public int getGradeLevel() {
        return gradeLevel;
    }

    public String getCurp() {
        return curp;
    }
}
