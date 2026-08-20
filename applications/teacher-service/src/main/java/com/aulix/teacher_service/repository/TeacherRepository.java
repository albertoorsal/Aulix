package com.aulix.teacher_service.repository;


import com.aulix.teacher_service.domain.Teacher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TeacherRepository extends JpaRepository<Teacher, UUID>,
        JpaSpecificationExecutor<Teacher> {

    Optional<Teacher> findByUserId(UUID userId);


    boolean existsByCurpIgnoreCase(String curp);
}
