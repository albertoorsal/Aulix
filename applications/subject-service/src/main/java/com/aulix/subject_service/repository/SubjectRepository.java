package com.aulix.subject_service.repository;

import com.aulix.subject_service.domain.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface SubjectRepository extends JpaRepository<Subject, UUID>,
        JpaSpecificationExecutor<Subject> {

    boolean existsByCodeIgnoreCase(String code);
}
