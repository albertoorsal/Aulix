package com.aulix.staff_service.domain;


import com.aulix.common_core.domain.BaseEntity;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "staff", uniqueConstraints = {
        @UniqueConstraint(columnNames = "employee_number"),
        @UniqueConstraint(columnNames = "user_id")
})
public class Staff extends BaseEntity {
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
    @Column(name = "staff_type", nullable = false, length = 20)
    private StaffType staffType;

    @Column(name = "hire_date", nullable = false)
    private LocalDate hireDate;

    @Column(name = "department", nullable = false, length = 100)
    private String department;

    @Column(name = "job_title", nullable = false, length = 100)
    private String jobTitle;

    @Column(name = "salary", nullable = false, precision = 12, scale = 2)
    private BigDecimal salary;

    @Column(name = "curp", nullable = false, length = 18)
    private String curp;

    protected Staff() {}

    public Staff(
            UUID userId,
            String employeeNumber,
            LocalDate dateOfBirth,
            StaffType staffType,
            LocalDate hireDate,
            String department,
            String jobTitle,
            BigDecimal salary,
            String curp
    ) {
        this.userId = userId;
        this.employeeNumber = employeeNumber;
        this.dateOfBirth = dateOfBirth;
        this.staffType = staffType;
        this.hireDate = hireDate;
        this.department = department;
        this.jobTitle = jobTitle;
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

    public StaffType getStaffType() {
        return staffType;
    }

    public LocalDate getHireDate() {
        return hireDate;
    }

    public String getDepartment() {
        return department;
    }

    public String getJobTitle() {
        return jobTitle;
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

    public void setStaffType(StaffType staffType) {
        this.staffType = staffType;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public void setJobTitle(String jobTitle) {
        this.jobTitle = jobTitle;
    }

    public void setSalary(BigDecimal salary) {
        this.salary = salary;
    }

    public void setEmploymentStatus(EmploymentStatus employmentStatus) {
        this.employmentStatus = employmentStatus;
    }
}
