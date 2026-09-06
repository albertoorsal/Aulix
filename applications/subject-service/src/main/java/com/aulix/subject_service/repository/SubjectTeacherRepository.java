package com.aulix.subject_service.repository;

import com.aulix.subject_service.domain.SubjectTeacher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SubjectTeacherRepository extends JpaRepository<SubjectTeacher, UUID> {

    boolean existsBySubjectIdAndTeacherId(UUID subjectId, UUID teacherId);

    Optional<SubjectTeacher> findBySubjectIdAndTeacherId(UUID subjectId, UUID teacherId);

    List<SubjectTeacher> findBySubjectId(UUID subjectId);

    List<SubjectTeacher> findByTeacherId(UUID teacherId);
}
