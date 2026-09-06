package com.aulix.subject_service.repository;

import com.aulix.subject_service.domain.SubjectStudent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SubjectStudentRepository extends JpaRepository<SubjectStudent, UUID> {

    boolean existsBySubjectIdAndStudentId(UUID subjectId, UUID studentId);

    Optional<SubjectStudent> findBySubjectIdAndStudentId(UUID subjectId, UUID studentId);

    List<SubjectStudent> findBySubjectId(UUID subjectId);

    List<SubjectStudent> findByStudentId(UUID studentId);
}
