package com.aulix.teacher_service.domain;


import com.aulix.common_core.domain.BaseEntity;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "teacher", uniqueConstraints = {
        @UniqueConstraint(columnNames = "employee_number"),
        @UniqueConstraint(columnNames = "user_id")
})
public class Teacher extends BaseEntity {
    @Column(name="user_id", nullable = false)
    private UUID userId;

    @Column(name = "employee_number", nullable = false, length = 20)
    private String employeeNumber;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Enumerated(EnumType.STRING)
    @Column(name = "employment_status", nullable = false, length = 20)
    private EmploymentStatus employmentStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "teacher_type", nullable = false, length = 20)
    private TeacherType teacherType;

    @Column(name = "hire_date", nullable = false)
    private LocalDate hireDate;

    @Column(name = "department", nullable = false, length = 100)
    private String department;

    @Column(name = "subject_specialization", nullable = false, length = 100)
    private String subjectSpecialization;

    @Column(name = "salary", nullable = false, precision = 12, scale = 2)
    private BigDecimal salary;

    @Column(name = "curp", nullable = false, length = 18)
    private String curp;

    protected Teacher() {}

    public Teacher(
            UUID userId,
            String employeeNumber,
            LocalDate dateOfBirth,
            TeacherType teacherType,
            LocalDate hireDate,
            String department,
            String subjectSpecialization,
            BigDecimal salary,
            String curp
    ) {
        this.userId = userId;
        this.employeeNumber = employeeNumber;
        this.dateOfBirth = dateOfBirth;
        this.teacherType = teacherType;
        this.hireDate = hireDate;
        this.department = department;
        this.subjectSpecialization = subjectSpecialization;
        this.salary = salary;
        this.curp = curp;
        this.employmentStatus = EmploymentStatus.ACTIVE;
    }

    public UUID getUserId() {
        return userId;
    }

    public String getEmployeeNumber() {
        return employeeNumber;
    }

    public LocalDate getDateOfBirth() {
        return dateOfBirth;
    }

    public EmploymentStatus getEmploymentStatus() {
        return employmentStatus;
    }

    public TeacherType getTeacherType() {
        return teacherType;
    }

    public LocalDate getHireDate() {
        return hireDate;
    }

    public String getDepartment() {
        return department;
    }

    public String getSubjectSpecialization() {
        return subjectSpecialization;
    }

    public BigDecimal getSalary() {
        return salary;
    }

    public String getCurp() {
        return curp;
    }

    public void setDateOfBirth(LocalDate dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
    }

    public void setTeacherType(TeacherType teacherType) {
        this.teacherType = teacherType;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public void setSubjectSpecialization(String subjectSpecialization) {
        this.subjectSpecialization = subjectSpecialization;
    }

    public void setSalary(BigDecimal salary) {
        this.salary = salary;
    }

    public void setEmploymentStatus(EmploymentStatus employmentStatus) {
        this.employmentStatus = employmentStatus;
    }
}
