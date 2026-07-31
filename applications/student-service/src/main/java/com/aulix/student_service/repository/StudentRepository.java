package com.aulix.student_service.repository;


import com.aulix.student_service.domain.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface StudentRepository extends JpaRepository<Student, UUID>,
        JpaSpecificationExecutor<Student> {

    Optional<Student> findByUserId(UUID userId);

    boolean existsByEmailIgnoreCase(String email);

    boolean existsByCurpIgnoreCase(String curp);
}
